import { supabase } from "@/lib/supabase";
import {
  type Action,
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";
import { File } from "expo-file-system";
import { Image } from "react-native";

const AVATAR_MAX_EDGE = 512;
const AVATAR_QUALITY = 0.85;
const POST_IMAGE_MAX_EDGE = 2048;
const POST_IMAGE_QUALITY = 0.82;

type OptimizedImage = {
  uri: string;
  extension: "jpg";
  contentType: "image/jpeg";
};

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}

function getResizeActions(
  size: { width: number; height: number },
  maxEdge: number,
): Action[] {
  const longestEdge = Math.max(size.width, size.height);
  if (longestEdge <= maxEdge) return [];

  return size.width >= size.height
    ? [{ resize: { width: maxEdge } }]
    : [{ resize: { height: maxEdge } }];
}

async function optimizeLocalImage(
  uri: string,
  options: { maxEdge: number; quality: number },
): Promise<OptimizedImage> {
  let actions: Action[] = [];

  try {
    const size = await getImageSize(uri);
    actions = getResizeActions(size, options.maxEdge);
  } catch {
    actions = [];
  }

  const result = await manipulateAsync(uri, actions, {
    compress: options.quality,
    format: SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    extension: "jpg",
    contentType: "image/jpeg",
  };
}

export async function uploadAvatar(
  uri: string,
  userId: string,
): Promise<string> {
  const optimized = await optimizeLocalImage(uri, {
    maxEdge: AVATAR_MAX_EDGE,
    quality: AVATAR_QUALITY,
  });
  const path = `${userId}/avatar.${optimized.extension}`;
  const buffer = await new File(optimized.uri).arrayBuffer();

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType: optimized.contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function uploadPostImage(
  uri: string,
  userId: string,
  postId: string,
  ordinal: number = 0,
): Promise<string> {
  const optimized = await optimizeLocalImage(uri, {
    maxEdge: POST_IMAGE_MAX_EDGE,
    quality: POST_IMAGE_QUALITY,
  });
  const path = `${userId}/${postId}/${ordinal}.${optimized.extension}`;
  const buffer = await new File(optimized.uri).arrayBuffer();

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, buffer, { contentType: optimized.contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}
