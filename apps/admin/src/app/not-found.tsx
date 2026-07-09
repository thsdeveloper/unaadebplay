import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 text-center">
      <div>
        <h1 className="text-3xl font-bold">404</h1>
        <p className="mt-1 text-sm text-muted-foreground">Página não encontrada.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
