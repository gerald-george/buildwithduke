// Portability boundary. Implement this interface with @supabase/supabase-js when migrating.
export interface SupabaseLeadAdapterConfig { url: string; serviceRoleKey: string }
export function createSupabaseLeadRepository(_config: SupabaseLeadAdapterConfig): never {
  throw new Error("Supabase adapter is intentionally inactive until migration.");
}
