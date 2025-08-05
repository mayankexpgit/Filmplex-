
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const StreamingLogos = () => {
  const logos = [
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png' },
    { name: 'Prime Video', url: 'https://logos-world.net/wp-content/uploads/2021/04/Amazon-Prime-Video-Logo-2022.png' },
    { name: 'Crunchyroll', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Crunchyroll_2024_stacked.svg/1200px-Crunchyroll_2024_stacked.svg.png' },
    { name: 'Apple TV', url: 'https://www.edigitalagency.com.au/wp-content/uploads/Apple-TV-logo-white-PNG-large-size.png' },
    { name: 'Disney+', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Disney_Plus_logo.svg' },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
        {logos.map((logo) => (
          <div key={logo.name} className="transition-all duration-300 ease-in-out transform hover:scale-105 h-14 w-auto flex items-center justify-center">
            {logo.name === 'Apple TV' ? (
              <div className="flex items-center gap-1 h-14 w-40 relative -ml-4">
                 <div className="relative h-12 w-32">
                    <Image
                      src={logo.url}
                      alt={`${logo.name} logo`}
                      fill
                      className="object-contain"
                    />
                 </div>
                <span className="text-5xl font-normal text-white -ml-4">+</span>
              </div>
            ) : (
              <div className="relative h-14 w-36 sm:h-16 sm:w-40">
                <Image
                  src={logo.url}
                  alt={`${logo.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamingLogos;
