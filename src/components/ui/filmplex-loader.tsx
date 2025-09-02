
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

const FilmpilexLoader: React.FC = () => {
  const logoText = "FILMPLEX";

  return (
    <div className={cn("filmplex-loader flex flex-col items-center justify-center gap-4 p-8 fetched")}>
      <div className="text-5xl font-bold flex items-center overflow-hidden">
        {logoText.split('').map((char, index) => {
          const isSpecial = char === 'F' || char === 'X';
          const style = { animationDelay: `${index * 0.1}s` };
          
          if (isSpecial) {
            return (
              <span
                key={index}
                className="loader-char text-6xl text-primary"
                style={style}
              >
                {char}
              </span>
            );
          }
          if (char === 'I' || char === 'L' || char === 'M' || char === 'P' || char === 'L' || char === 'E') {
             return (
              <span
                key={index}
                className="loader-char text-5xl text-primary tracking-tighter scale-y-110"
                style={style}
              >
                {char}
              </span>
            );
          }
          return null; // Should not happen with the current logoText
        })}
      </div>
      <div className="relative w-64 h-1 mt-2 bg-secondary rounded-full overflow-hidden">
        <div className="loader-line absolute left-0 top-0 h-full bg-primary rounded-full" />
      </div>
    </div>
  );
};

export default FilmpilexLoader;
