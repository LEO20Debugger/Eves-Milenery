import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';

// ─── users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'),
  deleted: integer('deleted').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── categories ──────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  deleted: integer('deleted').notNull().default(0),
});

// ─── products ────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  initialStock: integer('initial_stock').notNull().default(0),
  categoryId: uuid('category_id').references(() => categories.id),
  images: jsonb('images').notNull().default([]),
  color: varchar('color', { length: 50 }),
  deleted: integer('deleted').notNull().default(0),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  reference: varchar('reference', { length: 100 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id),
  guestName: varchar('guest_name', { length: 255 }),
  guestPhone: varchar('guest_phone', { length: 20 }),
  deliveryAddress: text('delivery_address').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  paymentProvider: varchar('payment_provider', { length: 20 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  deleted: integer('deleted').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── order_items ─────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  deleted: integer('deleted').notNull().default(0),
});

// ─── reviews ─────────────────────────────────────────────────────────────────

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    approved: boolean('approved').notNull().default(true),
    deleted: integer('deleted').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserProduct: unique().on(table.productId, table.userId),
  }),
);

// ─── site_settings ───────────────────────────────────────────────────────────

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Schema object (for Drizzle migrations / introspection) ──────────────────

export const schema = {
  users,
  categories,
  products,
  orders,
  orderItems,
  reviews,
  siteSettings,
};

// ─── Inferred TypeScript types ────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
