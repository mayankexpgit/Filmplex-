'use client';

import { useEffect } from 'react';
import { useMovieStore } from '@/store/movieStore';
import { IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

const COIN_COUNT = 3;
const ANIMATION_DURATION = 1500; // in ms

export default function CoinAnimation() {
  const { isCoinAnimationActive, stopCoinAnimation } = useMovieStore(state => ({
    isCoinAnimationActive: state.isCoinAnimationActive,
    stopCoinAnimation: state.stopCoinAnimation,
  }));

  useEffect(() => {
    if (isCoinAnimationActive) {
      const timer = setTimeout(() => {
        stopCoinAnimation();
      }, ANIMATION_DURATION + 500); // Give it a little extra time to finish

      return () => clearTimeout(timer);
    }
  }, [isCoinAnimationActive, stopCoinAnimation]);

  if (!isCoinAnimationActive) {
    return null;
  }

  // Get coordinates
  const startElement = document.getElementById('upload-confirm-button');
  const endElement = document.getElementById('admin-wallet-button');

  if (!startElement || !endElement) {
    return null;
  }

  const startRect = startElement.getBoundingClientRect();
  const endRect = endElement.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = endRect.left + endRect.width / 2;
  const endY = endRect.top + endRect.height / 2;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {Array.from({ length: COIN_COUNT }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${startX}px`,
            top: `${startY}px`,
            animation: `fly ${ANIMATION_DURATION}ms cubic-bezier(0.5, -0.5, 0.5, 1.5) forwards`,
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center border-2 border-amber-600 shadow-lg shadow-amber-500/50">
            <IndianRupee className="w-5 h-5 text-amber-900" />
          </div>
          <style jsx>{`
            @keyframes fly {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${endX - startX}px, ${endY - startY}px) scale(0.2);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}
