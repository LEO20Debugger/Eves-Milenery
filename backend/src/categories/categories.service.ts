import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { categories, Category } from '../db/schema';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: NodePgDatabase,
  ) {}

  findAll(): Promise<Category[]> {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.deleted, 0));
  }
}
