import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { orderItems, orders } from '../db/schema';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: NodePgDatabase,
  ) {}

  async findAll(
    requestingUser: { id: string; role: string },
    query: QueryOrdersDto,
  ) {
    const isAdmin = requestingUser.role === 'admin';
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    const conditions = [eq(orders.deleted, 0)];

    if (!isAdmin) {
      conditions.push(eq(orders.userId, requestingUser.id));
    }

    const where = and(...conditions);

    const [data, totalResult] = await Promise.all([
      this.db
        .select()
        .from(orders)
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(orders).where(where),
    ]);

    return {
      data,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    };
  }

  async findOne(id: string, requestingUser: { id: string; role: string }) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.deleted, 0)));

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const isAdmin = requestingUser.role === 'admin';
    if (!isAdmin && order.userId !== requestingUser.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const items = await this.db
      .select()
      .from(orderItems)
      .where(and(eq(orderItems.orderId, id), eq(orderItems.deleted, 0)));

    return { ...order, items };
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ) {
    const [existing] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.deleted, 0)));

    if (!existing) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const [updated] = await this.db
      .update(orders)
      .set({ status: dto.status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return updated;
  }
}
