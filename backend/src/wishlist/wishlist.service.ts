import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { wishlists, products } from '../db/schema';

@Injectable()
export class WishlistService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: NodePgDatabase) {}

  async getWishlist(userId: string) {
    return this.db
      .select({
        id: wishlists.id,
        productId: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        images: products.images,
        stock: products.stock,
        createdAt: wishlists.createdAt,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId));
  }

  async add(userId: string, productId: string) {
    const [item] = await this.db
      .insert(wishlists)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning();
    return item ?? { userId, productId };
  }

  async remove(userId: string, productId: string) {
    await this.db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return { success: true };
  }
}
