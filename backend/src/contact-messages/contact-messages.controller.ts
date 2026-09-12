import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { AuthGuard } from '../common/auth.guard';
import { OptionalAuthGuard } from '../common/optional-auth.guard';
import { Request } from 'express';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Post()
  async create(@Body() body: { name: string; email: string; phone?: string; subject: string; message: string }) {
    return this.contactMessagesService.create(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query('status') status?: string) {
    return this.contactMessagesService.findAll(status);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.contactMessagesService.findOne(parseInt(id));
  }

  @Patch(':id/reply')
  @UseGuards(AuthGuard)
  async reply(
    @Param('id') id: string,
    @Body() body: { admin_reply: string },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.contactMessagesService.reply(parseInt(id), body.admin_reply, user.email);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.contactMessagesService.remove(parseInt(id));
  }
}
