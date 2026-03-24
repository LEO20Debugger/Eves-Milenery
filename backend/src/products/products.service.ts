import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, lte, desc, asc, sql, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { products, categories, reviews, Product } from '../db/schema';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: NodePgDatabase,
  ) {}

  async findAll(query: QueryProductsDto) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    const conditions = [eq(products.deleted, 0)];

    if (query.categoryId) {
      conditions.push(eq(products.categoryId, query.categoryId));
    }
    if (query.minPrice) {
      conditions.push(gte(products.price, query.minPrice));
    }
    if (query.maxPrice) {
      conditions.push(lte(products.price, query.maxPrice));
    }
    if (query.color) {
      conditions.push(eq(products.color, query.color));
    }
    if (query.slug) {
      conditions.push(eq(products.slug, query.slug));
    }

    const where = and(...conditions);

    let orderBy;
    if (query.sort === 'price_asc') {
      orderBy = asc(products.price);
    } else if (query.sort === 'price_desc') {
      orderBy = desc(products.price);
    } else {
      orderBy = desc(products.createdAt);
    }

    const [data, totalResult] = await Promise.all([
      this.db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          stock: products.stock,
          initialStock: products.initialStock,
          categoryId: products.categoryId,
          images: products.images,
          color: products.color,
          deleted: products.deleted,
          deletedAt: products.deletedAt,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(products)
        .where(where),
    ]);

    return {
      data,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.deleted, 0)));

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const productReviews = await this.db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.productId, id),
          eq(reviews.approved, true),
          eq(reviews.deleted, 0),
        ),
      );

    return { ...product, reviews: productReviews };
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(dto.name);

    const [created] = await this.db
      .insert(products)
      .values({
        name: dto.name,
        slug,
        description: dto.description,
        price: String(dto.price),
        stock: dto.stock,
        initialStock: dto.initialStock,
        categoryId: dto.categoryId,
        images: dto.images,
        color: dto.color,
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.deleted, 0)));

    if (!existing) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const updateData: Partial<typeof products.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = this.generateSlug(dto.name);
    }
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = String(dto.price);
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.initialStock !== undefined) updateData.initialStock = dto.initialStock;
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.color !== undefined) updateData.color = dto.color;

    const [updated] = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.deleted, 0)));

    if (!existing) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await this.db
      .update(products)
      .set({ deleted: 1, deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(products.id, id));

    return { message: 'Product deleted successfully' };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
  }
}
