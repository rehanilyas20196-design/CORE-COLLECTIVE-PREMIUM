import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null;
  private supabaseAdmin: SupabaseClient | null;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase env vars (SUPABASE_URL, SUPABASE_ANON_KEY) not set — running without DB');
      this.supabase = null;
      this.supabaseAdmin = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.supabaseAdmin = serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
        : this.supabase;
    }
  }

  get client(): SupabaseClient {
    if (!this.supabase) throw new Error('Supabase not initialized — check SUPABASE_URL and SUPABASE_ANON_KEY env vars');
    return this.supabase;
  }

  get admin(): SupabaseClient {
    if (!this.supabaseAdmin) throw new Error('Supabase not initialized — check SUPABASE_URL and SUPABASE_ANON_KEY env vars');
    return this.supabaseAdmin;
  }

  get auth() {
    if (!this.supabase) throw new Error('Supabase not initialized — check SUPABASE_URL and SUPABASE_ANON_KEY env vars');
    return this.supabase.auth;
  }

  from(table: string) {
    if (!this.supabaseAdmin) throw new Error('Supabase not initialized — check SUPABASE_URL and SUPABASE_ANON_KEY env vars');
    return this.supabaseAdmin.from(table);
  }

  storage() {
    if (!this.supabaseAdmin) throw new Error('Supabase not initialized — check SUPABASE_URL and SUPABASE_ANON_KEY env vars');
    return this.supabaseAdmin.storage;
  }
}
