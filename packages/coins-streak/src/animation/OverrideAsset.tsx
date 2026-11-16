import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useAnimation } from './useAnimation';

export interface OverrideAssetProps {
  /** Registry id, e.g. "achievement.unlock". */
  id: string;
  /** Native rendering used when no override is configured or the asset fails to load. */
  fallback: ReactNode;
  /** Play once (celebrations) or loop (idle states). */
  loop?: boolean;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  onComplete?: () => void;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Renders a customer-uploaded Lottie or Rive asset for a registry id. lottie-web and the Rive runtime are
 * imported lazily, only when an override exists, so the base bundle stays small. Any load error falls
 * back to the native animation.
 */
export function OverrideAsset({ id, fallback, loop = false, width = '100%', height = '100%', style, onComplete }: OverrideAssetProps) {
  const anim = useAnimation(id);
  const override = anim.override;
  const box = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    if (!override || anim.reduced || override.kind === 'image') return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    setStatus('loading');
    (async () => {
      try {
        if (override.kind === 'lottie') {
          const mod: any = await import(/* webpackChunkName: "lottie" */ 'lottie-web/build/player/lottie_light');
          const lottie = mod.default ?? mod;
          if (cancelled || !box.current) return;
          const inst = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop, autoplay: true, path: override.url });
          inst.addEventListener('complete', () => doneRef.current?.());
          inst.addEventListener('data_failed', () => !cancelled && setStatus('error'));
          inst.addEventListener('DOMLoaded', () => !cancelled && setStatus('ready'));
          cleanup = () => inst.destroy();
        } else if (override.kind === 'rive') {
          const mod: any = await import(/* webpackChunkName: "rive" */ '@rive-app/canvas');
          if (cancelled || !canvas.current) return;
          const r = new mod.Rive({
            src: override.url,
            canvas: canvas.current,
            autoplay: true,
            stateMachines: override.stateMachine,
            onLoad: () => {
              if (cancelled) return;
              r.resizeDrawingSurfaceToCanvas();
              setStatus('ready');
            },
            onLoadError: () => !cancelled && setStatus('error'),
            onStop: () => doneRef.current?.(),
          });
          cleanup = () => r.cleanup();
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [override, loop, anim.reduced]);

  if (!override || anim.reduced || status === 'error') return <>{fallback}</>;
  if (override.kind === 'image') {
    return <img src={override.url} alt="" style={{ width, height, objectFit: 'contain', ...style }} onError={() => setStatus('error')} />;
  }
  return (
    <div style={{ position: 'relative', width, height, ...style }} data-override={override.kind} data-status={status}>
      {status !== 'ready' && <div style={{ position: 'absolute', inset: 0 }}>{fallback}</div>}
      {override.kind === 'lottie' ? (
        <div ref={box} style={{ width: '100%', height: '100%', opacity: status === 'ready' ? 1 : 0 }} />
      ) : (
        <canvas ref={canvas} style={{ width: '100%', height: '100%', opacity: status === 'ready' ? 1 : 0 }} />
      )}
    </div>
  );
}
