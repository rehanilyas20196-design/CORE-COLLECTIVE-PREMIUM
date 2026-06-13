import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BuyRequestsService } from './buy-requests.service';
import { AdminGuard } from '../common/admin.guard';
import { OptionalAuthGuard } from '../common/optional-auth.guard';
import { Request } from 'express';

@Controller('buy-requests')
export class BuyRequestsController {
  constructor(private readonly buyRequestsService: BuyRequestsService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Authentication required');
    return this.buyRequestsService.create(
      body,
      user.id,
      user.email,
      user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    );
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.buyRequestsService.findAll(user?.id, user?.email);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; admin_notes?: string },
  ) {
    return this.buyRequestsService.updateStatus(parseInt(id), body.status, body.admin_notes);
  }

  @Patch(':id/tracking')
  @UseGuards(AdminGuard)
  async updateTracking(
    @Param('id') id: string,
    @Body() body: { tracking_status: string; note?: string },
  ) {
    return this.buyRequestsService.updateTracking(parseInt(id), body.tracking_status, body.note);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    return this.buyRequestsService.remove(parseInt(id));
  }
}
