import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, eq, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { reviews, users, products } from '../db/schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: NodePgDatabase,
  ) {}

  async findAll() {
    return this.db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        approved: reviews.approved,
        createdAt: reviews.createdAt,
        userName: users.name,
        userEmail: users.email,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(eq(reviews.deleted, 0))
      .orderBy(desc(reviews.createdAt));
  }

  async findByProduct(productId: string) {
    return this.db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.productId, productId),
          eq(reviews.approved, true),
          eq(reviews.deleted, 0),
        ),
      )
      .orderBy(desc(reviews.createdAt));
  }

  async create(dto: CreateReviewDto, userId: string) {
    const existing = await this.db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.productId, dto.productId),
          eq(reviews.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('You have already reviewed this product');
    }

    const [review] = await this.db
      .insert(reviews)
      .values({
        productId: dto.productId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      })
      .returning();

    return review;
  }
}
