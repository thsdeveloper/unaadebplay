/** Resolve a Storage path or full URL to a displayable image URL. */
export function mediaUrl(pathOrUrl: string | null | undefined, bucket = 'images'): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${pathOrUrl}`;
}
