import { and, desc, eq, inArray } from "drizzle-orm";
import {
  admins,
  events,
  eventTranslations,
  projects,
  projectTranslations,
  type Admin,
  type CreateAdminRequest,
  type CreateEventRequest,
  type CreateProjectRequest,
  type Event,
  type EventTranslation,
  type EventsListResponse,
  type HomeFeaturedResponse,
  type Project,
  type ProjectTranslation,
  type ProjectsListResponse,
  type UpdateAdminRequest,
  type UpdateEventRequest,
  type UpdateProjectRequest,
  type UpsertEventTranslationRequest,
  type UpsertProjectTranslationRequest,
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Admins
  getAdminByUserId(userId: string): Promise<Admin | undefined>;
  listAdmins(): Promise<Admin[]>;
  createAdmin(req: CreateAdminRequest): Promise<Admin>;
  updateAdmin(id: number, updates: UpdateAdminRequest): Promise<Admin | undefined>;

  // Projects
  listProjects(params?: {
    featured?: boolean;
  }): Promise<ProjectsListResponse>;
  getProject(id: number): Promise<{ project: Project; translations: ProjectTranslation[] } | undefined>;
  createProject(adminId: number, req: CreateProjectRequest): Promise<{ project: Project; translations: ProjectTranslation[] }>;
  updateProject(id: number, updates: UpdateProjectRequest): Promise<{ project: Project; translations: ProjectTranslation[] } | undefined>;
  upsertProjectTranslation(
    projectId: number,
    lang: "en" | "hi" | "mr",
    req: UpsertProjectTranslationRequest,
  ): Promise<{ project: Project; translations: ProjectTranslation[] } | undefined>;
  setProjectFeatured(id: number, featured: boolean): Promise<void>;
  getFeaturedCount(): Promise<number>;
  getHomeFeatured(): Promise<HomeFeaturedResponse>;

  // Events
  listEvents(): Promise<EventsListResponse>;
  getEvent(id: number): Promise<{ event: Event; translations: EventTranslation[] } | undefined>;
  createEvent(adminId: number, req: CreateEventRequest): Promise<{ event: Event; translations: EventTranslation[] }>;
  updateEvent(id: number, updates: UpdateEventRequest): Promise<{ event: Event; translations: EventTranslation[] } | undefined>;
  upsertEventTranslation(
    eventId: number,
    lang: "en" | "hi" | "mr",
    req: UpsertEventTranslationRequest,
  ): Promise<{ event: Event; translations: EventTranslation[] } | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Admins
  async getAdminByUserId(userId: string): Promise<Admin | undefined> {
    const [row] = await db.select().from(admins).where(eq(admins.userId, userId));
    return row;
  }

  async listAdmins(): Promise<Admin[]> {
    return await db.select().from(admins).orderBy(desc(admins.id));
  }

  async createAdmin(req: CreateAdminRequest): Promise<Admin> {
    const [row] = await db
      .insert(admins)
      .values({ userId: req.userId, role: req.role })
      .returning();
    return row;
  }

  async updateAdmin(id: number, updates: UpdateAdminRequest): Promise<Admin | undefined> {
    const [row] = await db.update(admins).set(updates).where(eq(admins.id, id)).returning();
    return row;
  }

  // Projects
  async listProjects(params?: { featured?: boolean }): Promise<ProjectsListResponse> {
    const where = params?.featured === undefined ? undefined : eq(projects.isFeatured, params.featured);

    const projRows = where
      ? await db.select().from(projects).where(where).orderBy(desc(projects.updatedAt))
      : await db.select().from(projects).orderBy(desc(projects.updatedAt));

    if (projRows.length === 0) return [];

    const ids = projRows.map((p) => p.id);
    const trans = await db
      .select()
      .from(projectTranslations)
      .where(inArray(projectTranslations.projectId, ids));

    const byProject = new Map<number, ProjectTranslation[]>();
    for (const t of trans) {
      const arr = byProject.get(t.projectId) ?? [];
      arr.push(t);
      byProject.set(t.projectId, arr);
    }

    return projRows.map((p) => ({ project: p, translations: byProject.get(p.id) ?? [] }));
  }

  async getProject(id: number): Promise<{ project: Project; translations: ProjectTranslation[] } | undefined> {
    const [p] = await db.select().from(projects).where(eq(projects.id, id));
    if (!p) return undefined;
    const trans = await db.select().from(projectTranslations).where(eq(projectTranslations.projectId, id));
    return { project: p, translations: trans };
  }

  async createProject(
    adminId: number,
    req: CreateProjectRequest,
  ): Promise<{ project: Project; translations: ProjectTranslation[] }> {
    const [p] = await db
      .insert(projects)
      .values({
        slug: req.slug,
        isFeatured: !!req.isFeatured,
        coverImagePath: req.coverImagePath ?? null,
        createdByAdminId: adminId,
      })
      .returning();

    const transValues = req.translations.map((t) => ({
      projectId: p.id,
      language: t.language,
      status: t.status ?? "draft",
      title: t.title,
      summary: t.summary ?? null,
      contentHtml: t.contentHtml,
    }));

    const trans = transValues.length
      ? await db.insert(projectTranslations).values(transValues).returning()
      : [];

    return { project: p, translations: trans };
  }

  async updateProject(
    id: number,
    updates: UpdateProjectRequest,
  ): Promise<{ project: Project; translations: ProjectTranslation[] } | undefined> {
    const [p] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (!p) return undefined;
    const trans = await db.select().from(projectTranslations).where(eq(projectTranslations.projectId, id));
    return { project: p, translations: trans };
  }

  async upsertProjectTranslation(
    projectId: number,
    lang: "en" | "hi" | "mr",
    req: UpsertProjectTranslationRequest,
  ): Promise<{ project: Project; translations: ProjectTranslation[] } | undefined> {
    const existing = await this.getProject(projectId);
    if (!existing) return undefined;

    const [row] = await db
      .select()
      .from(projectTranslations)
      .where(and(eq(projectTranslations.projectId, projectId), eq(projectTranslations.language, lang)));

    if (row) {
      await db
        .update(projectTranslations)
        .set({
          status: req.status ?? row.status,
          title: req.title,
          summary: req.summary ?? null,
          contentHtml: req.contentHtml,
        })
        .where(eq(projectTranslations.id, row.id));
    } else {
      await db.insert(projectTranslations).values({
        projectId,
        language: lang,
        status: req.status ?? "draft",
        title: req.title,
        summary: req.summary ?? null,
        contentHtml: req.contentHtml,
      });
    }

    return await this.getProject(projectId);
  }

  async setProjectFeatured(id: number, featured: boolean): Promise<void> {
    await db
      .update(projects)
      .set({ isFeatured: featured, updatedAt: new Date() })
      .where(eq(projects.id, id));
  }

  async getFeaturedCount(): Promise<number> {
    const rows = await db.select({ id: projects.id }).from(projects).where(eq(projects.isFeatured, true));
    return rows.length;
  }

  async getHomeFeatured(): Promise<HomeFeaturedResponse> {
    const projRows = await db
      .select()
      .from(projects)
      .where(eq(projects.isFeatured, true))
      .orderBy(desc(projects.updatedAt))
      .limit(4);

    if (projRows.length === 0) return { featuredProjects: [] };

    const ids = projRows.map((p) => p.id);
    const trans = await db
      .select()
      .from(projectTranslations)
      .where(inArray(projectTranslations.projectId, ids));

    const byProject = new Map<number, ProjectTranslation[]>();
    for (const t of trans) {
      const arr = byProject.get(t.projectId) ?? [];
      arr.push(t);
      byProject.set(t.projectId, arr);
    }

    return {
      featuredProjects: projRows.map((p) => ({ project: p, translations: byProject.get(p.id) ?? [] })),
    };
  }

  // Events
  async listEvents(): Promise<EventsListResponse> {
    const eventRows = await db.select().from(events).orderBy(desc(events.updatedAt));
    if (eventRows.length === 0) return [];

    const ids = eventRows.map((e) => e.id);
    const trans = await db
      .select()
      .from(eventTranslations)
      .where(inArray(eventTranslations.eventId, ids));

    const byEvent = new Map<number, EventTranslation[]>();
    for (const t of trans) {
      const arr = byEvent.get(t.eventId) ?? [];
      arr.push(t);
      byEvent.set(t.eventId, arr);
    }

    return eventRows.map((e) => ({ event: e, translations: byEvent.get(e.id) ?? [] }));
  }

  async getEvent(id: number): Promise<{ event: Event; translations: EventTranslation[] } | undefined> {
    const [e] = await db.select().from(events).where(eq(events.id, id));
    if (!e) return undefined;
    const trans = await db.select().from(eventTranslations).where(eq(eventTranslations.eventId, id));
    return { event: e, translations: trans };
  }

  async createEvent(
    adminId: number,
    req: CreateEventRequest,
  ): Promise<{ event: Event; translations: EventTranslation[] }> {
    const [e] = await db
      .insert(events)
      .values({
        slug: req.slug,
        startDate: req.startDate ? new Date(req.startDate) : null,
        endDate: req.endDate ? new Date(req.endDate) : null,
        coverImagePath: req.coverImagePath ?? null,
        createdByAdminId: adminId,
      })
      .returning();

    const transValues = req.translations.map((t) => ({
      eventId: e.id,
      language: t.language,
      status: t.status ?? "draft",
      title: t.title,
      location: t.location ?? null,
      contentHtml: t.contentHtml,
    }));

    const trans = transValues.length
      ? await db.insert(eventTranslations).values(transValues).returning()
      : [];

    return { event: e, translations: trans };
  }

  async updateEvent(
    id: number,
    updates: UpdateEventRequest,
  ): Promise<{ event: Event; translations: EventTranslation[] } | undefined> {
    const [e] = await db
      .update(events)
      .set({
        ...updates,
        startDate:
          updates.startDate === undefined
            ? undefined
            : updates.startDate
              ? new Date(updates.startDate)
              : null,
        endDate:
          updates.endDate === undefined
            ? undefined
            : updates.endDate
              ? new Date(updates.endDate)
              : null,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!e) return undefined;
    const trans = await db.select().from(eventTranslations).where(eq(eventTranslations.eventId, id));
    return { event: e, translations: trans };
  }

  async upsertEventTranslation(
    eventId: number,
    lang: "en" | "hi" | "mr",
    req: UpsertEventTranslationRequest,
  ): Promise<{ event: Event; translations: EventTranslation[] } | undefined> {
    const existing = await this.getEvent(eventId);
    if (!existing) return undefined;

    const [row] = await db
      .select()
      .from(eventTranslations)
      .where(and(eq(eventTranslations.eventId, eventId), eq(eventTranslations.language, lang)));

    if (row) {
      await db
        .update(eventTranslations)
        .set({
          status: req.status ?? row.status,
          title: req.title,
          location: req.location ?? null,
          contentHtml: req.contentHtml,
        })
        .where(eq(eventTranslations.id, row.id));
    } else {
      await db.insert(eventTranslations).values({
        eventId,
        language: lang,
        status: req.status ?? "draft",
        title: req.title,
        location: req.location ?? null,
        contentHtml: req.contentHtml,
      });
    }

    return await this.getEvent(eventId);
  }
}

export const storage = new DatabaseStorage();
