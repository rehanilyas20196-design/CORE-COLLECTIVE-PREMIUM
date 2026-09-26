import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminEmail = 'hinata4020196@gmail.com';

  constructor(private supabase: SupabaseService) {}

  private async hasAdminRole(userId: string, email: string): Promise<boolean> {
    if (email.trim().toLowerCase() === this.adminEmail.trim().toLowerCase()) return true;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error(`[AdminGuard] profiles lookup failed for ${userId}: ${error.message}`);
      return false;
    }
    return data?.role === 'admin';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Access denied: missing bearer token');
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.warn(`[AdminGuard] getUser rejected the token: ${error?.message}`);
      throw new ForbiddenException('Access denied: invalid or expired session — sign in again');
    }

    const user = data.user;
    request.user = user;

    if (!(await this.hasAdminRole(user.id, user.email || ''))) {
      throw new ForbiddenException(
        `Admin access required (signed in as ${user.email}, profiles.role is not admin)`,
      );
    }
    return true;
  }
}
