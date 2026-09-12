import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateTrackingStatusDto } from '../common/dto/order.dto';
import { AdminGuard } from '../common/admin.guard';
import { OptionalAuthGuard } from '../common/optional-auth.guard';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.ordersService.findAll(user?.id, user?.email);
  }

  @Get('confirmed-count')
  @UseGuards(OptionalAuthGuard)
  async getConfirmedCount(@Req() req: Request) {
    const user = (req as any).user;
    return this.ordersService.findConfirmedCount(user?.id, user?.email);
  }

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(@Body() body: CreateOrderDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.ordersService.create(body, user?.id, user?.email);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(parseInt(id), body.status);
  }

  @Patch(':id/tracking')
  @UseGuards(AdminGuard)
  async updateTracking(@Param('id') id: string, @Body() body: UpdateTrackingStatusDto) {
    return this.ordersService.updateTracking(parseInt(id), body.tracking_status, body.note);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(parseInt(id));
  }
}
