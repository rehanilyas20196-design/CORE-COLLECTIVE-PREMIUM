import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error || !user) {
        // Surface the real reason (invalid, expired, network, etc.) instead of
        // masking it behind a generic message.
        throw new UnauthorizedException(
          error?.message || 'Invalid or expired token',
        );
      }
      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      // Non-HTTP errors (network/timeout) keep the generic message.
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
