import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =====================================
// AUTH (Replit Auth)
// =====================================

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// =====================================
// APP MODELS
// =====================================

export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "admin"]);

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: adminRoleEnum("role").notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [index("IDX_admins_user_id").on(table.userId)],
);

export const contentLanguageEnum = pgEnum("content_language", [
  "en",
  "hi",
  "mr",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
]);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    isFeatured: boolean("is_featured").notNull().default(false),
    coverImagePath: text("cover_image_path"),
    createdByAdminId: integer("created_by_admin_id").references(() => admins.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_projects_featured").on(table.isFeatured),
    index("IDX_projects_slug").on(table.slug),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    language: contentLanguageEnum("language").notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    title: text("title").notNull(),
    summary: text("summary"),
    contentHtml: text("content_html").notNull(),
  },
  (table) => [
    index("IDX_project_translations_project_id").on(table.projectId),
    index("IDX_project_translations_language").on(table.language),
  ],
);

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    coverImagePath: text("cover_image_path"),
    createdByAdminId: integer("created_by_admin_id").references(() => admins.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("IDX_events_slug").on(table.slug)],
);

export const eventTranslations = pgTable(
  "event_translations",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    language: contentLanguageEnum("language").notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    title: text("title").notNull(),
    location: text("location"),
    contentHtml: text("content_html").notNull(),
  },
  (table) => [
    index("IDX_event_translations_event_id").on(table.eventId),
    index("IDX_event_translations_language").on(table.language),
  ],
);

// =====================================
// ZOD INSERT SCHEMAS
// =====================================

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectTranslationSchema =
  createInsertSchema(projectTranslations).omit({ id: true });

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventTranslationSchema = createInsertSchema(eventTranslations).omit({
  id: true,
});

// =====================================
// EXPLICIT API CONTRACT TYPES
// =====================================

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectTranslation = typeof projectTranslations.$inferSelect;
export type InsertProjectTranslation = z.infer<typeof insertProjectTranslationSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventTranslation = typeof eventTranslations.$inferSelect;
export type InsertEventTranslation = z.infer<typeof insertEventTranslationSchema>;

export type CreateAdminRequest = {
  userId: string;
  role: "super_admin" | "admin";
};

export type UpdateAdminRequest = Partial<{
  role: "super_admin" | "admin";
  isActive: boolean;
}>;

export type CreateProjectRequest = {
  slug: string;
  isFeatured?: boolean;
  coverImagePath?: string | null;
  translations: Array<{
    language: "en" | "hi" | "mr";
    status?: "draft" | "published";
    title: string;
    summary?: string | null;
    contentHtml: string;
  }>;
};

export type UpdateProjectRequest = Partial<{
  slug: string;
  isFeatured: boolean;
  coverImagePath: string | null;
}>;

export type UpsertProjectTranslationRequest = {
  language: "en" | "hi" | "mr";
  status?: "draft" | "published";
  title: string;
  summary?: string | null;
  contentHtml: string;
};

export type CreateEventRequest = {
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
  coverImagePath?: string | null;
  translations: Array<{
    language: "en" | "hi" | "mr";
    status?: "draft" | "published";
    title: string;
    location?: string | null;
    contentHtml: string;
  }>;
};

export type UpdateEventRequest = Partial<{
  slug: string;
  startDate: string | null;
  endDate: string | null;
  coverImagePath: string | null;
}>;

export type UpsertEventTranslationRequest = {
  language: "en" | "hi" | "mr";
  status?: "draft" | "published";
  title: string;
  location?: string | null;
  contentHtml: string;
};

export type HomeFeaturedResponse = {
  featuredProjects: Array<{
    project: Project;
    translations: ProjectTranslation[];
  }>;
};

export type ProjectsListResponse = Array<{
  project: Project;
  translations: ProjectTranslation[];
}>;

export type EventsListResponse = Array<{
  event: Event;
  translations: EventTranslation[];
}>;

export interface UploadUrlResponse {
  uploadURL: string;
  objectPath: string;
  metadata: {
    name: string;
    size?: number;
    contentType?: string;
  };
}
