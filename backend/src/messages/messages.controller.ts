import { Controller, Get, Post, Delete, Body, Req, UseGuards, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../common/auth.guard';
import { Request } from 'express';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.messagesService.findAll(user.id);
  }

  @Post()
  async create(@Body() body: { sender: string; message: string }, @Req() req: Request) {
    const user = (req as any).user;
    return this.messagesService.create(user.id, body.sender, body.message);
  }

  @Delete('clear')
  async clear(@Req() req: Request) {
    const user = (req as any).user;
    return this.messagesService.clear(user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.messagesService.remove(user.id, parseInt(id));
  }
}
