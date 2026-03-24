import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import Stripe from 'stripe';
import { firstValueFrom } from 'rxjs';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { orderItems, orders } from '../db/schema';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;
  private readonly paystackSecretKey: string;
  private readonly stripeWebhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(DRIZZLE_CLIENT) private readonly db: NodePgDatabase,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY') ?? '';
    this.stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });
    this.paystackSecretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') ?? '';
    this.stripeWebhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
  }

  private generateReference(): string {
    return (
      'PAY-' +
      Date.now() +
      '-' +
      Math.random().toString(36).slice(2, 8).toUpperCase()
    );
  }

  async initializePayment(dto: InitializePaymentDto): Promise<{ paymentUrl: string }> {
    const total = dto.cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    if (dto.provider === 'paystack') {
      const email = dto.email ?? `guest-${Date.now()}@fascinator.store`;
      const amountKobo = Math.round(total * 100);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.paystack.co/transaction/initialize',
          {
            amount: amountKobo,
            email,
            metadata: {
              name: dto.name,
              phone: dto.phone,
              deliveryAddress: dto.deliveryAddress,
              cart: dto.cart,
              userId: dto.userId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const paymentUrl: string = response.data?.data?.authorization_url;
      return { paymentUrl };
    }

    // Stripe
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: dto.cart.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.productName },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      metadata: {
        name: dto.name,
        phone: dto.phone,
        deliveryAddress: dto.deliveryAddress,
        cart: JSON.stringify(dto.cart),
        userId: dto.userId ?? '',
      },
    });

    return { paymentUrl: session.url! };
  }

  async verifyPayment(reference: string): Promise<{ orderId: string }> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
        },
      ),
    );

    const data = response.data?.data;

    if (!data || data.status !== 'success') {
      throw new HttpException('Payment verification failed', HttpStatus.PAYMENT_REQUIRED);
    }

    const meta = data.metadata ?? {};
    const cart: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }> =
      meta.cart ?? [];

    const total = cart.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0,
    );

    const ref = this.generateReference();

    const [order] = await this.db
      .insert(orders)
      .values({
        reference: ref,
        userId: meta.userId ?? null,
        guestName: meta.name ?? null,
        guestPhone: meta.phone ?? null,
        deliveryAddress: meta.deliveryAddress ?? '',
        status: 'paid',
        paymentProvider: 'paystack',
        totalAmount: String(total),
      })
      .returning();

    if (cart.length > 0) {
      await this.db.insert(orderItems).values(
        cart.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
        })),
      );
    }

    return { orderId: order.id };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.stripeWebhookSecret,
      );
    } catch {
      throw new HttpException('Invalid Stripe signature', HttpStatus.BAD_REQUEST);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};

      const cart: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }> =
        meta.cart ? JSON.parse(meta.cart) : [];

      const total = cart.reduce(
        (sum: number, item: { unitPrice: number; quantity: number }) =>
          sum + item.unitPrice * item.quantity,
        0,
      );

      const ref = this.generateReference();

      const [order] = await this.db
        .insert(orders)
        .values({
          reference: ref,
          userId: meta.userId || null,
          guestName: meta.name ?? null,
          guestPhone: meta.phone ?? null,
          deliveryAddress: meta.deliveryAddress ?? '',
          status: 'paid',
          paymentProvider: 'stripe',
          totalAmount: String(total),
        })
        .returning();

      if (cart.length > 0) {
        await this.db.insert(orderItems).values(
          cart.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
          })),
        );
      }

      this.logger.log(`Stripe order created: ${order.id}`);
    }
  }
}
