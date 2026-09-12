import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminEmail = 'rehanilyas20196@gmail.com';

  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Access denied');
    }

    const token = authHeader.split(' ')[1];

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error || !user) {
        throw new ForbiddenException('Access denied');
      }
      if (user.email !== this.adminEmail) {
        throw new ForbiddenException('Admin access required');
      }
      request.user = user;
      return true;
    } catch {
      throw new ForbiddenException('Access denied');
    }
  }
}
