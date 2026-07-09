'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/media';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function ImageUpload({
  bucket = 'images',
  value,
  onChange,
}: {
  bucket?: 'images' | 'avatars' | 'audio';
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const preview = mediaUrl(value, bucket);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { signedUrl, publicUrl } = await api.storage.signedUpload({ bucket, filename: file.name });
      const put = await fetch(signedUrl, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
      if (!put.ok) throw new Error('Falha no upload para o Storage');
      onChange(publicUrl);
      toast.success('Imagem enviada');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-16 w-16 rounded-md border object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col items-start gap-1.5">
          <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}>
            {uploading ? 'Enviando…' : 'Enviar imagem'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-xs text-muted-foreground hover:text-destructive">
              Remover
            </button>
          )}
        </div>
      </div>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="ou cole uma URL" className="text-xs" />
    </div>
  );
}
