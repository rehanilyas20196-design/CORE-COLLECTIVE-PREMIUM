import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { AuthGuard } from '../common/auth.guard';
import { Request } from 'express';

@Controller('contact-messages')
@UseGuards(AuthGuard)
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.contactMessagesService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contactMessagesService.findOne(parseInt(id));
  }

  @Patch(':id/reply')
  async reply(
    @Param('id') id: string,
    @Body() body: { admin_reply: string },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.contactMessagesService.reply(parseInt(id), body.admin_reply, user.email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contactMessagesService.remove(parseInt(id));
  }
}
