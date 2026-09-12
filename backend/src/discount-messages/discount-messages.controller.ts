import { Controller, Get, Post, Patch, Delete, Body, Req, UseGuards, Param } from '@nestjs/common';
import { DiscountMessagesService } from './discount-messages.service';
import { AdminGuard } from '../common/admin.guard';
import { OptionalAuthGuard } from '../common/optional-auth.guard';
import { Request } from 'express';

@Controller('discount-messages')
export class DiscountMessagesController {
  constructor(private readonly discountMessagesService: DiscountMessagesService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.discountMessagesService.findAll(user?.id, user?.email);
  }

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(@Body() body: { user_email: string; user_name: string; message: string }, @Req() req: Request) {
    const user = (req as any).user;
    return this.discountMessagesService.create(body, user?.id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; admin_reply?: string }) {
    return this.discountMessagesService.updateStatus(parseInt(id), body.status, body.admin_reply);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    return this.discountMessagesService.remove(parseInt(id));
  }
}
