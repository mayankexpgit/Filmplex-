import React from 'react';
import Image from 'next/image';

const StreamingLogos = () => {
  const logos = [
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'Prime Video', url: 'https://cdn.jim-nielsen.com/macos/512/amazon-prime-video-2022-07-27.png' },
    { name: 'Crunchyroll', url: 'https://cdn.jim-nielsen.com/macos/512/crunchyroll-2023-02-06.png' },
    { name: 'SonyLIV', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/SonyLIV_2020.svg/2560px-SonyLIV_2020.svg.png' },
    { name: 'ZEE5', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Zee5-official-logo.svg/2560px-Zee5-official-logo.svg.png' },
    { name: 'Viki', url: 'https://cdn.worldvectorlogo.com/logos/viki.svg' },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
        {logos.map((logo) => (
          <div key={logo.name} className="grayscale hover:grayscale-0 transition-all duration-300 ease-in-out transform hover:scale-105 relative h-8 w-24 sm:h-10 sm:w-32">
            <Image
              src={logo.url}
              alt={`${logo.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamingLogos;
