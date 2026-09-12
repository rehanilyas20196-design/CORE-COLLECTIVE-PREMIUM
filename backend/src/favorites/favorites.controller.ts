import { Controller, Get, Post, Delete, Body, Req, UseGuards, Param } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '../common/auth.guard';
import { Request } from 'express';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.favoritesService.findAll(user.id);
  }

  @Post('toggle')
  async toggle(@Body() body: { product_id: number; product_data?: any }, @Req() req: Request) {
    const user = (req as any).user;
    return this.favoritesService.toggle(user.id, body.product_id, body.product_data);
  }

  @Post('add')
  async add(@Body() body: { product_id: number; product_data?: any }, @Req() req: Request) {
    const user = (req as any).user;
    return this.favoritesService.add(user.id, body.product_id, body.product_data);
  }

  @Delete(':productId')
  async remove(@Param('productId') productId: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.favoritesService.remove(user.id, parseInt(productId));
  }
}
