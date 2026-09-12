import { Controller, Get, Post, Patch, Delete, Body, Req, UseGuards, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../common/auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.notificationsService.findAll(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const user = (req as any).user;
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Post()
  async create(@Body() body: { type: string; title: string; message: string; data?: any }, @Req() req: Request) {
    const user = (req as any).user;
    return this.notificationsService.create(user.id, body.type, body.title, body.message, body.data);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(parseInt(id));
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const user = (req as any).user;
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.notificationsService.remove(parseInt(id));
  }
}
