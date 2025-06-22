import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { GALLERY_ACCESS_LEVELS } from "../utils/global.ts";

export const accessLevels = pgEnum("access_levels", GALLERY_ACCESS_LEVELS);

export const plansTable = pgTable("plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  storage: integer().notNull(),
});

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  name: text().notNull(),
  email: text().notNull(),
  isEmailVerified: boolean().notNull().default(false),
  emailVerificationToken: text().unique(),
  accountDeletionToken: text().unique(),
  accountDeletionTokenExpiresAt: timestamp(),
  password: text(),
  passwordResetToken: text().unique(),
  isAdmin: boolean().notNull().default(false),
  isBlocked: boolean().notNull().default(false),
  planId: integer().references(() => plansTable.id),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsTable = pgTable("user_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  sessionToken: text().notNull().unique(),
  ip: text(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userSessionsRelations = relations(
  userSessionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userSessionsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const galleriesTable = pgTable("galleries", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  description: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const galleriesRelations = relations(
  galleriesTable,
  ({ many }) => ({
    images: many(galleryImagesTable),
    accessKeys: many(galleryAccessKeyTable),
  }),
);

export const galleryAccessTable = pgTable("gallery_access", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessLevel: accessLevels().notNull(),
}, (t) => [
  unique().on(t.userId, t.galleryId),
]);

export const galleryAccessRelations = relations(
  galleryAccessTable,
  ({ one }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryAccessTable.galleryId],
      references: [galleriesTable.id],
    }),
  }),
);

export const galleryImagesTable = pgTable("gallery_images", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
  fileName: text().notNull(),
  height: integer().notNull(),
  width: integer().notNull(),
}, (t) => [
  unique().on(t.galleryId, t.fileName),
]);

export const galleryImagesRelations = relations(
  galleryImagesTable,
  ({ one }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryImagesTable.galleryId],
      references: [galleriesTable.id],
    }),
  }),
);

export const galleryAccessKeyTable = pgTable("gallery_access_key", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
  accessKey: text().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const galleryAccessKeyRelations = relations(
  galleryAccessKeyTable,
  ({ one }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryAccessKeyTable.galleryId],
      references: [galleriesTable.id],
    }),
  }),
);
