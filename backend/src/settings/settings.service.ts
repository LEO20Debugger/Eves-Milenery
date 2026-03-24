import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../db/drizzle.constants';
import { siteSettings } from '../db/schema';

// Default values used when no DB row exists yet
const DEFAULTS: Record<string, string> = {
  hero_image_url: '',
  hero_headline: 'The Occasion Anthology',
  hero_subtext: 'New Collection Available',
};

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: any) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.db.select().from(siteSettings);
    const result = { ...DEFAULTS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async upsert(key: string, value: string): Promise<void> {
    await this.db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }

  async updateMany(data: Record<string, string>): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(data)) {
      await this.upsert(key, value);
    }
    return this.getAll();
  }
}
