import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { GALLERY_ACCESS_LEVELS } from "../utils/global.ts";

export const accessLevels = pgEnum("access_levels", GALLERY_ACCESS_LEVELS);

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

export const galleryAccessTable = pgTable("gallery_access", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessLevel: accessLevels().notNull(),
});

export const galleryAccessRelations = relations(
  galleryAccessTable,
  ({ one }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryAccessTable.galleryId],
      references: [galleriesTable.id],
    }),
  }),
);

export const galleryPhotosTable = pgTable("gallery_photos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
});
