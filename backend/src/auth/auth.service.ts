import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {

  constructor(
    private supabase: SupabaseService,
  ) {}

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
