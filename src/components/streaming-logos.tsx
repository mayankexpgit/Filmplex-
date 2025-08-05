import React from 'react';
import Image from 'next/image';

const StreamingLogos = () => {
  const logos = [
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png' },
    { name: 'Prime Video', url: 'https://logos-world.net/wp-content/uploads/2021/04/Amazon-Prime-Video-Logo-2022.png' },
    { name: 'Crunchyroll', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Crunchyroll_2024_stacked.svg/1200px-Crunchyroll_2024_stacked.svg.png' },
    { name: 'Apple TV', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Apple_TV_logo_2022.svg/1024px-Apple_TV_logo_2022.svg.png' },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
        {logos.map((logo) => (
          <div key={logo.name} className="transition-all duration-300 ease-in-out transform hover:scale-105 relative h-16 w-44 sm:h-20 sm:w-52">
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
