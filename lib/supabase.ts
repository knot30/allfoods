// Supabase 서버 클라이언트 (service role, 서버 전용).
// admin 1인 프로토타입이라 클라이언트 인증 대신 서버(Route Handler/Server Action/
// Server Component)에서만 service role 로 접근. service role 키는 절대 클라이언트 노출 금지.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function hasSupabase(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_SERVICE_ROLE_KEY.length > 0;
}

let _client: SupabaseClient | null = null;

/** 서버 전용 Supabase 클라이언트. 미설정이면 null (호출부에서 seed 폴백). */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
