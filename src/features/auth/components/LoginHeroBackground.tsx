import { type ReactElement } from 'react';

/** Bileşen içi CSS — index.css yüklenmesine bağlı kalmadan animasyon garanti */
const AUTH_BG_STYLES = `
  @keyframes auth-bg-wander {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    25% { transform: translate3d(120px, -80px, 0) scale(1.12); }
    50% { transform: translate3d(-80px, -140px, 0) scale(0.9); }
    75% { transform: translate3d(-140px, 70px, 0) scale(1.08); }
    100% { transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes auth-bg-wander-alt {
    0% { transform: translate3d(0, 0, 0) rotate(0deg); }
    33% { transform: translate3d(-100px, 90px, 0) rotate(120deg); }
    66% { transform: translate3d(110px, -60px, 0) rotate(240deg); }
    100% { transform: translate3d(0, 0, 0) rotate(360deg); }
  }
  @keyframes auth-bg-glow-drift {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.55; }
    50% { transform: translate3d(12vw, -8vh, 0) scale(1.2); opacity: 0.9; }
  }
  @keyframes auth-bg-rise {
    0% { transform: translate3d(0, 100vh, 0); opacity: 0; }
    10% { opacity: 0.9; }
    90% { opacity: 0.9; }
    100% { transform: translate3d(40px, -10vh, 0); opacity: 0; }
  }
  @keyframes auth-bg-orbit {
    from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
  }
  .auth-bg-wander {
    animation: auth-bg-wander 14s ease-in-out infinite;
    will-change: transform;
  }
  .auth-bg-wander-alt {
    animation: auth-bg-wander-alt 18s ease-in-out infinite;
    will-change: transform;
  }
  .auth-bg-glow-drift {
    animation: auth-bg-glow-drift 10s ease-in-out infinite;
    will-change: transform, opacity;
  }
  .auth-bg-rise {
    animation: auth-bg-rise linear infinite;
    will-change: transform, opacity;
  }
  .auth-bg-orbit {
    animation: auth-bg-orbit 16s linear infinite;
    will-change: transform;
  }
`;

type AnimClass = 'auth-bg-wander' | 'auth-bg-wander-alt';

const SHAPES: Array<{
  kind: 'circle' | 'square' | 'ring';
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  anim: AnimClass;
}> = [
  { kind: 'circle', top: '6%', left: '8%', size: 100, delay: '0s', duration: '12s', anim: 'auth-bg-wander' },
  { kind: 'square', top: '14%', left: '68%', size: 64, delay: '-3s', duration: '15s', anim: 'auth-bg-wander-alt' },
  { kind: 'circle', top: '48%', left: '4%', size: 140, delay: '-6s', duration: '16s', anim: 'auth-bg-wander-alt' },
  { kind: 'square', top: '62%', left: '52%', size: 80, delay: '-1s', duration: '13s', anim: 'auth-bg-wander' },
  { kind: 'circle', top: '72%', left: '78%', size: 56, delay: '-4s', duration: '11s', anim: 'auth-bg-wander' },
  { kind: 'square', top: '28%', left: '32%', size: 48, delay: '-8s', duration: '17s', anim: 'auth-bg-wander-alt' },
  { kind: 'ring', top: '38%', left: '84%', size: 110, delay: '-2s', duration: '20s', anim: 'auth-bg-wander-alt' },
  { kind: 'ring', top: '10%', left: '44%', size: 72, delay: '-5s', duration: '14s', anim: 'auth-bg-wander-alt' },
  { kind: 'circle', top: '85%', left: '22%', size: 90, delay: '-3s', duration: '15s', anim: 'auth-bg-wander' },
  { kind: 'circle', top: '52%', left: '92%', size: 44, delay: '-7s', duration: '12s', anim: 'auth-bg-wander-alt' },
  { kind: 'circle', top: '20%', left: '88%', size: 160, delay: '-9s', duration: '22s', anim: 'auth-bg-wander' },
  { kind: 'ring', top: '65%', left: '35%', size: 130, delay: '-1s', duration: '24s', anim: 'auth-bg-wander-alt' },
];

const DRIFT_PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  left: `${2 + (i * 3.2) % 96}%`,
  size: 5 + (i % 4),
  delay: `${-(i * 1.8) % 18}s`,
  duration: `${8 + (i % 6) * 2}s`,
}));

export function LoginHeroBackground({ animated = true }: { animated?: boolean }): ReactElement {
  if (!animated) {
    return (
      <div
        className="pointer-events-none absolute inset-0 bg-[#0f0b06]"
        aria-hidden
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <style>{AUTH_BG_STYLES}</style>

      {/* Sıcak altın zemin — lacivert/mavi ton yok */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(251,191,36,0.22),transparent_45%),radial-gradient(ellipse_at_85%_15%,rgba(245,158,11,0.16),transparent_42%),radial-gradient(ellipse_at_50%_100%,rgba(217,119,6,0.14),transparent_50%),linear-gradient(165deg,#0f0b06_0%,#1a1208_38%,#120e07_68%,#0f0b06_100%)]" />

      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(251,191,36,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_85%)]" />

      {SHAPES.map((shape, index) => {
        const animStyle = {
          top: shape.top,
          left: shape.left,
          width: shape.size,
          height: shape.size,
          animationDelay: shape.delay,
          animationDuration: shape.duration,
        } as const;

        if (shape.kind === 'circle') {
          return (
            <div
              key={`shape-${index}`}
              className={`${shape.anim} absolute rounded-full border border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.14)] shadow-[0_0_70px_rgba(251,191,36,0.35)]`}
              style={animStyle}
            />
          );
        }

        if (shape.kind === 'ring') {
          return (
            <div
              key={`shape-${index}`}
              className={`${shape.anim} absolute rounded-full border-2 border-[rgba(251,191,36,0.5)] bg-transparent shadow-[inset_0_0_32px_rgba(251,191,36,0.25),0_0_50px_rgba(245,158,11,0.22)]`}
              style={animStyle}
            />
          );
        }

        return (
          <div
            key={`shape-${index}`}
            className={`${shape.anim} absolute rotate-12 rounded-2xl border border-[color-mix(in_srgb,#f59e0b_35%,transparent)] bg-[color-mix(in_srgb,#f59e0b_14%,transparent)] shadow-[0_0_36px_color-mix(in_srgb,#d97706_20%,transparent)]`}
            style={animStyle}
          />
        );
      })}

      {DRIFT_PARTICLES.map((particle, index) => (
        <div
          key={`drift-${index}`}
          className="auth-bg-rise absolute rounded-full bg-[#fbbf24] shadow-[0_0_16px_#fbbf24]"
          style={{
            left: particle.left,
            bottom: 0,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <div className="auth-bg-glow-drift absolute -left-32 top-[-10%] h-[420px] w-[420px] rounded-full bg-[rgba(251,191,36,0.28)] blur-[120px]" />
      <div
        className="auth-bg-glow-drift absolute bottom-[-15%] right-[-8%] h-[480px] w-[480px] rounded-full bg-[rgba(217,119,6,0.24)] blur-[140px]"
        style={{ animationDelay: '-5s', animationDuration: '12s' }}
      />
      <div className="auth-bg-orbit absolute left-1/2 top-1/3 h-5 w-5 -translate-x-1/2 rounded-full bg-[#fde68a] shadow-[0_0_28px_#fbbf24]" />
      <div
        className="auth-bg-orbit absolute left-[28%] top-[58%] h-4 w-4 rounded-full bg-[#fbbf24] shadow-[0_0_20px_#f59e0b]"
        style={{ animationDelay: '-4s', animationDuration: '20s' }}
      />
    </div>
  );
}
