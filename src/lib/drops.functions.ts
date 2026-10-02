import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BUCKET, purgeExpired } from "./drops.server";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export type DropView = {
  pin: string;
  type: "text" | "code" | "file";
  content: string | null;
  language: string;
  fileName: string | null;
  fileSize: number | null;
  downloadUrl: string | null;
  createdAt: string;
  expiresAt: string;
};

const getAdmin = async () =>
  (await import("@/integrations/supabase/client.server")).supabaseAdmin;

export const prepareUpload = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ fileName: z.string().min(1).max(200), size: z.number().int().positive().max(MAX_FILE_BYTES) }).parse(d),
  )
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `uploads/${crypto.randomUUID()}/${safe}`;
    const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !signed) throw new Error("Could not prepare upload");
    return { path, token: signed.token };
  });

export const createDrop = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        type: z.enum(["text", "code", "file"]),
        content: z.string().max(200_000).optional(),
        language: z.string().max(30).optional(),
        filePath: z.string().startsWith("uploads/").max(300).optional(),
        fileName: z.string().max(200).optional(),
        fileSize: z.number().int().nonnegative().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    await purgeExpired(admin);
    if (data.type === "file" && !data.filePath) throw new Error("Missing file");
    if (data.type !== "file" && !data.content?.trim()) throw new Error("Nothing to drop");

    for (let i = 0; i < 12; i++) {
      const pin = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
      const { data: row, error } = await admin
        .from("drops")
        .insert({
          pin,
          type: data.type,
          content: data.type === "file" ? null : data.content!,
          language: data.language || "plaintext",
          file_path: data.filePath ?? null,
          file_name: data.fileName ?? null,
          file_size: data.fileSize ?? null,
        })
        .select("pin, expires_at")
        .single();
      if (!error && row) return { pin: row.pin, expiresAt: row.expires_at };
      if (error && error.code !== "23505") {
        console.error(error);
        throw new Error("Could not create drop");
      }
    }
    throw new Error("All PINs are busy, try again shortly");
  });

export const getDrop = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ pin: z.string().regex(/^\d{4}$/) }).parse(d))
  .handler(async ({ data }): Promise<DropView | null> => {
    const admin = await getAdmin();
    const { data: row } = await admin.from("drops").select("*").eq("pin", data.pin).maybeSingle();
    if (!row) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await purgeExpired(admin);
      return null;
    }
    let downloadUrl: string | null = null;
    if (row.file_path) {
      const { data: s } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(row.file_path, 3600, { download: row.file_name ?? true });
      downloadUrl = s?.signedUrl ?? null;
    }
    return {
      pin: row.pin,
      type: row.type as DropView["type"],
      content: row.content,
      language: row.language,
      fileName: row.file_name,
      fileSize: row.file_size,
      downloadUrl,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  });

export const burnDrop = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ pin: z.string().regex(/^\d{4}$/) }).parse(d))
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const { data: row } = await admin.from("drops").select("id, file_path").eq("pin", data.pin).maybeSingle();
    if (!row) return { ok: true };
    if (row.file_path) await admin.storage.from(BUCKET).remove([row.file_path]);
    await admin.from("drops").delete().eq("id", row.id);
    return { ok: true };
  });
