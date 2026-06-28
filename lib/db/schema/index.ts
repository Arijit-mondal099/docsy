import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ── Enums ──

export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'processing',
  'ready',
  'error',
]);

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

// ── Users (mirror of BetterAuth for Drizzle type safety) ──

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Documents ──

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cloudinaryUrl: text('cloudinary_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  status: documentStatusEnum('status').default('pending').notNull(),
  pageCount: integer('page_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Chats ──

export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Messages ──

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});