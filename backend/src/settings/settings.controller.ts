import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public — home page fetches this server-side
  @Public()
  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  // Admin only
  @Roles('admin')
  @Patch()
  updateMany(@Body() body: Record<string, string>) {
    return this.settingsService.updateMany(body);
  }
}
