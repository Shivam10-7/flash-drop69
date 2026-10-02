import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "drops";

// Removes expired drops and their files. Safe to call often.
export async function purgeExpired(admin: SupabaseClient) {
  const { data } = await admin
    .from("drops")
    .select("id, file_path")
    .lt("expires_at", new Date().toISOString())
    .limit(200);
  if (!data || data.length === 0) return 0;
  const paths = data.map((d) => d.file_path).filter((p): p is string => !!p);
  if (paths.length) await admin.storage.from(BUCKET).remove(paths);
  await admin.from("drops").delete().in("id", data.map((d) => d.id));
  return data.length;
}
