import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";

export async function uploadAvatar(
  uri: string,
  userId: string,
): Promise<string> {
  const ext = (uri.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${userId}/avatar.${ext}`;
  const buffer = await new File(uri).arrayBuffer();
  const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
