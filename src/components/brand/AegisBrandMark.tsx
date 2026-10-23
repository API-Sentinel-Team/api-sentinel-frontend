import { Shield } from 'lucide-react';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
};

export function AegisBrandMark({ size = 'md', variant = 'dark', showTagline = true }: Props) {
  const box =
    size === 'lg' ? 'h-11 w-11' : size === 'md' ? 'h-10 w-10' : 'h-9 w-9';
  const titleSize = size === 'lg' ? 17 : size === 'md' ? 15 : 14;
  const titleColor = variant === 'light' ? '#F8FAFC' : '#0F172A';
  const subColor = variant === 'light' ? 'rgba(148,163,184,0.85)' : '#64748B';

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${box} flex items-center justify-center rounded-lg text-white`}
        style={{
          background: 'linear-gradient(145deg, #1E3A8A 0%, #2563EB 45%, #38BDF8 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 10px 24px rgba(37,99,235,0.35)',
        }}
        aria-hidden
      >
        <Shield size={size === 'sm' ? 18 : 22} strokeWidth={2.25} />
      </div>
      <div>
        <div
          className="font-bold tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            color: titleColor,
            fontSize: titleSize,
            letterSpacing: '0.06em',
          }}
        >
          AEGIS
          <span className="font-semibold opacity-70" style={{ fontSize: titleSize - 2, letterSpacing: '0.02em' }}>
            {' '}
            API Security
          </span>
        </div>
        {showTagline && (
          <div
            className="font-medium uppercase"
            style={{
              fontSize: 10.5,
              letterSpacing: '0.16em',
              color: subColor,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            discover · test · defend
          </div>
        )}
      </div>
    </div>
  );
}
