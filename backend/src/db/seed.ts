import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { users, categories, products } from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  { name: 'Fascinators', slug: 'fascinators' },
  { name: 'Caps', slug: 'caps' },
  { name: 'Occasion Wear', slug: 'occasion-wear' },
];

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@fascinatorstore.com',
    phone: '+2348000000001',
    password: 'Admin@1234',
    role: 'admin',
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+2348000000002',
    password: 'Customer@1234',
    role: 'customer',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+2348000000003',
    password: 'Customer@1234',
    role: 'customer',
  },
];

// Products are defined after categories are resolved so we can attach real IDs.
// We use a factory that receives a map of slug → id.
function buildProducts(catIds: Record<string, string>) {
  return [
    // ── Fascinators (4) ──────────────────────────────────────────────────────
    {
      name: 'Ivory Feather Fascinator',
      slug: 'ivory-feather-fascinator',
      description: 'Elegant ivory fascinator adorned with soft feathers and a pearl pin. Perfect for weddings and garden parties.',
      price: '12500.00',
      stock: 15,
      initialStock: 20,
      categoryId: catIds['fascinators'],
      images: ['https://res.cloudinary.com/demo/image/upload/fascinator-ivory.jpg'],
      color: 'Ivory',
    },
    {
      name: 'Black Velvet Pillbox Fascinator',
      slug: 'black-velvet-pillbox-fascinator',
      description: 'Chic black velvet pillbox fascinator with a netted veil. A timeless statement piece for formal occasions.',
      price: '9800.00',
      stock: 8,
      initialStock: 15,
      categoryId: catIds['fascinators'],
      images: ['https://res.cloudinary.com/demo/image/upload/fascinator-black-velvet.jpg'],
      color: 'Black',
    },
    {
      name: 'Rose Gold Sinamay Fascinator',
      slug: 'rose-gold-sinamay-fascinator',
      description: 'Handcrafted sinamay fascinator in rose gold with a sculptural bow. Ideal for race days and cocktail events.',
      price: '15000.00',
      stock: 5,
      initialStock: 10,
      categoryId: catIds['fascinators'],
      images: ['https://res.cloudinary.com/demo/image/upload/fascinator-rose-gold.jpg'],
      color: 'Rose Gold',
    },
    {
      name: 'Navy Blue Floral Fascinator',
      slug: 'navy-blue-floral-fascinator',
      description: 'Delicate navy blue fascinator featuring hand-sewn fabric flowers and a comb attachment.',
      price: '11200.00',
      stock: 12,
      initialStock: 18,
      categoryId: catIds['fascinators'],
      images: ['https://res.cloudinary.com/demo/image/upload/fascinator-navy-floral.jpg'],
      color: 'Navy Blue',
    },
    // ── Caps (4) ─────────────────────────────────────────────────────────────
    {
      name: 'Classic Wool Beret',
      slug: 'classic-wool-beret',
      description: 'Soft 100% wool beret in a versatile neutral tone. Pairs effortlessly with casual and smart-casual outfits.',
      price: '7500.00',
      stock: 25,
      initialStock: 30,
      categoryId: catIds['caps'],
      images: ['https://res.cloudinary.com/demo/image/upload/cap-wool-beret.jpg'],
      color: 'Camel',
    },
    {
      name: 'Structured Peaked Cap',
      slug: 'structured-peaked-cap',
      description: 'Military-inspired structured peaked cap in deep burgundy. Features a gold-tone buckle at the back.',
      price: '8900.00',
      stock: 3,
      initialStock: 20,
      categoryId: catIds['caps'],
      images: ['https://res.cloudinary.com/demo/image/upload/cap-peaked-burgundy.jpg'],
      color: 'Burgundy',
    },
    {
      name: 'Straw Sun Cap',
      slug: 'straw-sun-cap',
      description: 'Wide-brim natural straw cap with a grosgrain ribbon trim. Lightweight and perfect for summer outings.',
      price: '6200.00',
      stock: 18,
      initialStock: 25,
      categoryId: catIds['caps'],
      images: ['https://res.cloudinary.com/demo/image/upload/cap-straw-sun.jpg'],
      color: 'Natural',
    },
    {
      name: 'Velvet Turban Cap',
      slug: 'velvet-turban-cap',
      description: 'Luxurious emerald green velvet turban cap with a jewelled brooch accent. A bold fashion statement.',
      price: '10500.00',
      stock: 7,
      initialStock: 12,
      categoryId: catIds['caps'],
      images: ['https://res.cloudinary.com/demo/image/upload/cap-velvet-turban.jpg'],
      color: 'Emerald',
    },
    // ── Occasion Wear (4) ────────────────────────────────────────────────────
    {
      name: 'Bridal Veil Headpiece',
      slug: 'bridal-veil-headpiece',
      description: 'Stunning bridal headpiece combining a cathedral-length veil with a crystal-encrusted comb. Made to order.',
      price: '45000.00',
      stock: 4,
      initialStock: 5,
      categoryId: catIds['occasion-wear'],
      images: ['https://res.cloudinary.com/demo/image/upload/occasion-bridal-veil.jpg'],
      color: 'White',
    },
    {
      name: 'Church Mother Hat',
      slug: 'church-mother-hat',
      description: 'Wide-brim church hat in royal purple with a satin ribbon and feather trim. A commanding presence for special services.',
      price: '22000.00',
      stock: 6,
      initialStock: 10,
      categoryId: catIds['occasion-wear'],
      images: ['https://res.cloudinary.com/demo/image/upload/occasion-church-hat.jpg'],
      color: 'Royal Purple',
    },
    {
      name: 'Ascot Race Day Hat',
      slug: 'ascot-race-day-hat',
      description: 'Show-stopping wide-brim hat in coral with a dramatic sculptural bow. Designed for race days and high-profile events.',
      price: '35000.00',
      stock: 2,
      initialStock: 8,
      categoryId: catIds['occasion-wear'],
      images: ['https://res.cloudinary.com/demo/image/upload/occasion-ascot-coral.jpg'],
      color: 'Coral',
    },
    {
      name: 'Cocktail Pillbox Hat',
      slug: 'cocktail-pillbox-hat',
      description: 'Retro-inspired pillbox hat in champagne with a half-veil. Elevates any cocktail or evening ensemble.',
      price: '18500.00',
      stock: 9,
      initialStock: 15,
      categoryId: catIds['occasion-wear'],
      images: ['https://res.cloudinary.com/demo/image/upload/occasion-pillbox-champagne.jpg'],
      color: 'Champagne',
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertCategories(): Promise<Record<string, string>> {
  const catIds: Record<string, string> = {};

  for (const cat of SEED_CATEGORIES) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    if (existing.length > 0) {
      catIds[cat.slug] = existing[0].id;
      console.log(`  ↳ Category already exists: ${cat.name}`);
    } else {
      const [inserted] = await db.insert(categories).values(cat).returning({ id: categories.id });
      catIds[cat.slug] = inserted.id;
      console.log(`  ✓ Created category: ${cat.name}`);
    }
  }

  return catIds;
}

async function upsertProducts(catIds: Record<string, string>): Promise<void> {
  const productList = buildProducts(catIds);

  for (const product of productList) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, product.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ↳ Product already exists: ${product.name}`);
    } else {
      await db.insert(products).values(product);
      console.log(`  ✓ Created product: ${product.name}`);
    }
  }
}

async function upsertUsers(): Promise<void> {
  for (const user of SEED_USERS) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ↳ User already exists: ${user.email}`);
    } else {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await db.insert(users).values({
        name: user.name,
        email: user.email,
        phone: user.phone,
        passwordHash,
        role: user.role,
      });
      console.log(`  ✓ Created user: ${user.email} (${user.role})`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Seeding database...\n');

  try {
    console.log('📂 Categories:');
    const catIds = await upsertCategories();

    console.log('\n🎩 Products:');
    await upsertProducts(catIds);

    console.log('\n👤 Users:');
    await upsertUsers();

    console.log('\n✅ Seed complete.\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
