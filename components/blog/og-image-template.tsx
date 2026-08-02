import { ImageResponse } from 'next/og';

export function BlogOGImageTemplate({
  title,
  summary,
  author,
  coverImage,
}: {
  title: string;
  summary: string;
  author: string;
  coverImage?: string | null;
}) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: 20,
            letterSpacing: 2,
          }}
        >
          BALIKIN
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 50 ? 42 : title.length > 30 ? 48 : 56,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: 24,
            maxWidth: 1000,
            wordBreak: 'break-word',
          }}
        >
          {title}
        </div>

        {/* Summary */}
        {summary && (
          <div
            style={{
              fontSize: 18,
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 800,
            }}
          >
            {summary.length > 150 ? summary.substring(0, 147) + '...' : summary}
          </div>
        )}

        {/* Author */}
        <div
          style={{
            fontSize: 16,
            color: '#94a3b8',
            marginBottom: 40,
          }}
        >
          Oleh {author}
        </div>

        {/* CTA Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              fontSize: 14,
              color: '#3b82f6',
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            BLOG BALIKIN
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 60,
          fontSize: 12,
          color: '#64748b',
        }}
      >
        balikin.online
      </div>
    </div>
  );
}
