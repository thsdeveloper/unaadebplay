'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Algo deu errado</h1>
          <p style={{ marginTop: 6, color: '#6b7280', fontSize: 14 }}>{error.message}</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: '#E51C44',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
