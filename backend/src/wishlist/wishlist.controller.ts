import { Controller, Get, Post, Delete, Param, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  add(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.add(req.user.id, productId);
  }

  @Delete(':productId')
  remove(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.id, productId);
  }
}
