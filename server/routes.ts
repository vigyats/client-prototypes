import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import { api, errorSchemas } from "@shared/routes";
import { storage } from "./storage";
import { isAuthenticated, registerAuthRoutes, setupAuth } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

function getUserId(req: any): string {
  return req?.user?.claims?.sub;
}

async function requireAdmin(req: any): Promise<{ adminId: number; role: "super_admin" | "admin" }> {
  const userId = getUserId(req);
  const admin = await storage.getAdminByUserId(userId);
  if (!admin || !admin.isActive) {
    throw new Error("FORBIDDEN_NOT_ADMIN");
  }
  return { adminId: admin.id, role: admin.role };
}

async function upsertUser(claims: any) {
  const user = await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });

  // Automatically promote specified email to super_admin if not already an admin
  if (user.email === "admin@blackai.in") {
    const existingAdmin = await storage.getAdminByUserId(user.id);
    if (!existingAdmin) {
      await storage.createAdmin({ userId: user.id, role: "super_admin" });
    }
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  app.get(api.admins.me.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const admin = await storage.getAdminByUserId(userId);
    if (!admin || !admin.isActive) {
      return res.json({ isAdmin: false, role: null });
    }
    return res.json({ isAdmin: true, role: admin.role });
  });

  // Admin management (super admin only)
  app.get(api.admins.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const { role } = await requireAdmin(req);
      if (role !== "super_admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const rows = await storage.listAdmins();
      return res.json(rows);
    } catch {
      return res.status(403).json({ message: "Forbidden" });
    }
  });

  app.post(api.admins.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const { role } = await requireAdmin(req);
      if (role !== "super_admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const input = api.admins.create.input.parse(req.body);
      const row = await storage.createAdmin({ userId: input.userId, role: input.role });
      return res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.admins.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const { role } = await requireAdmin(req);
      if (role !== "super_admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid id", field: "id" });
      }

      const input = api.admins.update.input.parse(req.body);
      const updated = await storage.updateAdmin(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  // Home featured
  app.get(api.home.featured.path, async (_req, res) => {
    const data = await storage.getHomeFeatured();
    return res.json(data);
  });

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
    const rows = await storage.listProjects({ featured });
    return res.json(rows);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(404).json({ message: "Not found" });
    }
    const row = await storage.getProject(id);
    if (!row) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json(row);
  });

  app.post(api.projects.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const { adminId } = await requireAdmin(req);
      const input = api.projects.create.input.parse(req.body);

      if (input.isFeatured) {
        const count = await storage.getFeaturedCount();
        if (count >= 4) {
          return res.status(400).json({ message: "Only 4 projects can be featured", field: "isFeatured" });
        }
      }

      const created = await storage.createProject(adminId, input);
      return res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      if (String(err).includes("FORBIDDEN_NOT_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.projects.update.path, isAuthenticated, async (req: any, res) => {
    try {
      await requireAdmin(req);
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(404).json({ message: "Not found" });
      }

      const input = api.projects.update.input.parse(req.body);

      if (input.isFeatured === true) {
        const existing = await storage.getProject(id);
        if (!existing) return res.status(404).json({ message: "Not found" });
        if (!existing.project.isFeatured) {
          const count = await storage.getFeaturedCount();
          if (count >= 4) {
            return res.status(400).json({ message: "Only 4 projects can be featured", field: "isFeatured" });
          }
        }
      }

      const updated = await storage.updateProject(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      if (String(err).includes("FORBIDDEN_NOT_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  app.put(api.projects.upsertTranslation.path, isAuthenticated, async (req: any, res) => {
    try {
      await requireAdmin(req);
      const id = Number(req.params.id);
      const lang = req.params.lang;
      if (Number.isNaN(id) || !["en", "hi", "mr"].includes(lang)) {
        return res.status(404).json({ message: "Not found" });
      }

      const input = api.projects.upsertTranslation.input.parse(req.body);
      const updated = await storage.upsertProjectTranslation(id, lang, input);
      if (!updated) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      if (String(err).includes("FORBIDDEN_NOT_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  // Events
  app.get(api.events.list.path, async (_req, res) => {
    const rows = await storage.listEvents();
    return res.json(rows);
  });

  app.get(api.events.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(404).json({ message: "Not found" });
    }
    const row = await storage.getEvent(id);
    if (!row) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json(row);
  });

  app.post(api.events.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const { adminId } = await requireAdmin(req);
      const input = api.events.create.input.parse(req.body);
      const created = await storage.createEvent(adminId, input);
      return res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      if (String(err).includes("FORBIDDEN_NOT_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.events.update.path, isAuthenticated, async (req: any, res) => {
    try {
      await requireAdmin(req);
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(404).json({ message: "Not found" });
      }

      const input = api.events.update.input.parse(req.body);
      const updated = await storage.updateEvent(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      if (String(err).includes("FORBIDDEN_NOT_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  app.put(api.events.upsertTranslation.path, isAuthenticated, async (req: any, res) => {
    try {
      await requireAdmin(req);
      const id = Number(req.params.id);
      const lang = req.params.lang;
      if (Number.isNaN(id) || !["en", "hi", "mr"].includes(lang)) {
        return res.status(404).json({ message: "Not found" });
      }

      const input = api.events.upsertTranslation.input.parse(req.body);
      const updated = await storage.upsertEventTranslation(id, lang, input);
      if (!updated) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      if (String(err).includes("FORBIDDEN_NOT_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.status(500).json({ message: "Internal error" });
    }
  });

  return httpServer;
}
