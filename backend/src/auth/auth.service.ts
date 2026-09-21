import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  private get adminEmail(): string {
    return (this.configService.get<string>('ADMIN_EMAIL') || 'hinata4020196@gmail.com').toLowerCase();
  }

  private get adminPassword(): string | undefined {
    return this.configService.get<string>('ADMIN_PASSWORD');
  }

  async ensureAdmin() {
    const adminClient = this.supabase.admin;
    if (!adminClient) throw new InternalServerErrorException('Server not configured for admin operations');

    const adminEmail = this.adminEmail;
    const adminPassword = this.adminPassword;

    const { data: { users }, error: listError } = await (adminClient.auth as any).admin.listUsers({});
    if (listError) throw new InternalServerErrorException(listError.message);

    const existing = (users || []).find((u: any) => u.email?.toLowerCase() === adminEmail);
    if (existing) {
      const updates: Record<string, any> = {};
      if (!existing.email_confirmed_at) updates.email_confirm = true;
      // Keep the stored admin password in lockstep with ADMIN_PASSWORD (the
      // environment variable is the source of truth, not source code).
      if (adminPassword) updates.password = adminPassword;
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await (adminClient.auth as any).admin.updateUserById(existing.id, updates);
        if (updateError) throw new InternalServerErrorException(updateError.message);
      }
      return { exists: true, confirmed: true };
    }

    if (!adminPassword) {
      throw new InternalServerErrorException(
        'ADMIN_PASSWORD environment variable is not set — configure ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap the admin account',
      );
    }

    const { data, error } = await (adminClient.auth as any).admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Admin', role: 'admin', is_admin: true },
      app_metadata: { role: 'admin' },
    });
    if (error) {
      if (error.message?.includes('already registered')) {
        return { exists: true, confirmed: true };
      }
      throw new InternalServerErrorException(error.message);
    }

    try {
      await this.supabase.from('profiles').upsert({
        id: data.user.id,
        email: adminEmail,
        full_name: 'Admin',
        role: 'admin',
        status: 'active',
      }, { onConflict: 'id' });
    } catch {
      // profile upsert is best-effort
    }

    return { exists: false, created: true };
  }

  async getAdminUsers() {
    const adminClient = this.supabase.admin;
    if (!adminClient) throw new InternalServerErrorException('Server not configured for admin operations');

    const { data: { users }, error } = await (adminClient.auth as any).admin.listUsers({});
    if (error) throw new InternalServerErrorException(error.message);

    const ids = (users || []).map((u: any) => u.id);
    let profiles: any[] = [];
    if (ids.length > 0) {
      const { data: profileRows, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .in('id', ids);
      if (!profileError) profiles = profileRows || [];
    }

    const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

    return (users || []).map((u: any) => {
      const profile = profileMap.get(u.id) || {};
      return {
        id: u.id,
        email: u.email,
        phone: u.phone,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        confirmed: !!u.email_confirmed_at,
        full_name: profile.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
        role: profile.role || u.user_metadata?.role || 'user',
        is_supplier: !!u.user_metadata?.is_supplier || profile.role === 'supplier',
        status: profile.status || 'active',
        is_admin: u.email?.toLowerCase() === this.adminEmail,
        metadata: u.user_metadata || {},
      };
    });
  }

  async signUp(email: string, password: string, metadata?: { full_name?: string; joiningDate?: string; phone?: string; date_of_birth?: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata || {} },
    });

    if (error) throw new ConflictException(error.message);
    return data;
  }

  async supplierSignUp(dto: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    company_name: string;
    company_website?: string;
    business_type?: string;
    product_categories?: string;
  }) {
    const adminClient = this.supabase.admin;
    if (!adminClient) throw new InternalServerErrorException('Server not configured for admin operations');

    const { data, error } = await (adminClient.auth as any).admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        full_name: dto.full_name,
        phone: dto.phone || null,
        company_name: dto.company_name,
        company_website: dto.company_website || null,
        business_type: dto.business_type || null,
        product_categories: dto.product_categories || null,
        is_supplier: true,
        role: 'supplier',
      },
    });

    if (error) {
      if (error.message?.includes('already registered')) {
        throw new ConflictException('An account with this email already exists');
      }
      throw new InternalServerErrorException(error.message);
    }

    const userId = data.user.id;

    const upsertProfile = async () => {
      try {
        await this.supabase.from('profiles').upsert({
          id: userId,
          email: dto.email,
          full_name: dto.full_name,
          phone: dto.phone || '',
          role: 'supplier',
          status: 'active',
        }, { onConflict: 'id' });
      } catch {
        // profile insert is best-effort (trigger may have created it already)
      }
    };

    const insertSupplierProfile = async () => {
      try {
        await this.supabase.from('supplier_profiles').insert({
          user_id: userId,
          business_name: dto.company_name,
          business_type: dto.business_type || null,
          website: dto.company_website || null,
          status: 'pending',
        });
      } catch {
        // supplier_profile insert is best-effort
      }
    };

    await Promise.all([upsertProfile(), insertSupplierProfile()]);

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException(error.message);
    return data;
  }

  async signOut(accessToken: string) {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
