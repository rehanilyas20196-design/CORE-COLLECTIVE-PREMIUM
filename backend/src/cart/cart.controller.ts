import { Controller, Get, Post, Patch, Delete, Body, Req, UseGuards, Param, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '../common/auth.guard';
import { Request } from 'express';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.cartService.findAll(user.id);
  }

  @Post('add')
  async add(@Body() body: { product_id: number; qty?: number; product_data?: any }, @Req() req: Request) {
    const user = (req as any).user;
    return this.cartService.addOrUpdate(user.id, body.product_id, body.qty || 1, body.product_data);
  }

  @Patch('update-qty')
  async updateQty(@Body() body: { product_id: number; qty: number }, @Req() req: Request) {
    const user = (req as any).user;
    return this.cartService.updateQty(user.id, body.product_id, body.qty);
  }

  @Delete(':productId')
  async remove(@Param('productId') productId: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.cartService.remove(user.id, parseInt(productId));
  }

  @Delete()
  async clear(@Req() req: Request) {
    const user = (req as any).user;
    return this.cartService.clear(user.id);
  }
}
