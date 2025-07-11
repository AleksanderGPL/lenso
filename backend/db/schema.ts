import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
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
  uuid: uuid().notNull().defaultRandom(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const galleriesRelations = relations(
  galleriesTable,
  ({ many }) => ({
    images: many(galleryImagesTable),
    accessKeys: many(galleryAccessKeyTable),
    collections: many(galleryCollectionsTable),
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
  size: decimal().notNull(),
}, (t) => [
  unique().on(t.galleryId, t.fileName),
]);

export const galleryImagesRelations = relations(
  galleryImagesTable,
  ({ one, many }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryImagesTable.galleryId],
      references: [galleriesTable.id],
    }),
    sharedCollections: many(gallerySharedCollectionsImagesTable),
    privateCollections: many(galleryPrivateCollectionsImagesTable),
  }),
);

export const galleryAccessKeyTable = pgTable("gallery_access_key", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
  accessKey: text().notNull().unique(),
  name: text().notNull(),
  canDownload: boolean().notNull(),
  canUseCollections: boolean().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const galleryAccessKeyRelations = relations(
  galleryAccessKeyTable,
  ({ one, many }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryAccessKeyTable.galleryId],
      references: [galleriesTable.id],
    }),
    privateCollectionImages: many(galleryPrivateCollectionsImagesTable),
  }),
);

export const galleryCollectionsTable = pgTable("gallery_collections", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  galleryId: integer()
    .notNull()
    .references(() => galleriesTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  isShared: boolean().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const galleryCollectionsRelations = relations(
  galleryCollectionsTable,
  ({ one, many }) => ({
    gallery: one(galleriesTable, {
      fields: [galleryCollectionsTable.galleryId],
      references: [galleriesTable.id],
    }),
    privateCollectionImages: many(galleryPrivateCollectionsImagesTable),
    sharedCollectionImages: many(gallerySharedCollectionsImagesTable),
  }),
);

export const galleryPrivateCollectionsImagesTable = pgTable(
  "gallery_private_collections_images",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    accessId: integer()
      .notNull()
      .references(() => galleryAccessKeyTable.id, { onDelete: "cascade" }),
    collectionId: integer()
      .notNull()
      .references(() => galleryCollectionsTable.id, { onDelete: "cascade" }),
    imageId: integer()
      .notNull()
      .references(() => galleryImagesTable.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique().on(t.accessId, t.collectionId, t.imageId),
  ],
);

export const galleryPrivateCollectionsImagesRelations = relations(
  galleryPrivateCollectionsImagesTable,
  ({ one }) => ({
    collection: one(galleryCollectionsTable, {
      fields: [galleryPrivateCollectionsImagesTable.collectionId],
      references: [galleryCollectionsTable.id],
    }),
    image: one(galleryImagesTable, {
      fields: [galleryPrivateCollectionsImagesTable.imageId],
      references: [galleryImagesTable.id],
    }),
    accessKey: one(galleryAccessKeyTable, {
      fields: [galleryPrivateCollectionsImagesTable.accessId],
      references: [galleryAccessKeyTable.id],
    }),
  }),
);

export const gallerySharedCollectionsImagesTable = pgTable(
  "gallery_shared_collections_images",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    collectionId: integer()
      .notNull()
      .references(() => galleryCollectionsTable.id, { onDelete: "cascade" }),
    imageId: integer()
      .notNull()
      .references(() => galleryImagesTable.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique().on(t.collectionId, t.imageId),
  ],
);

export const gallerySharedCollectionsImagesRelations = relations(
  gallerySharedCollectionsImagesTable,
  ({ one }) => ({
    collection: one(galleryCollectionsTable, {
      fields: [gallerySharedCollectionsImagesTable.collectionId],
      references: [galleryCollectionsTable.id],
    }),
    image: one(galleryImagesTable, {
      fields: [gallerySharedCollectionsImagesTable.imageId],
      references: [galleryImagesTable.id],
    }),
  }),
);
