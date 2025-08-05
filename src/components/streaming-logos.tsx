import React from 'react';
import Image from 'next/image';

const StreamingLogos = () => {
  const logos = [
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png' },
    { name: 'Prime Video', url: 'https://logos-world.net/wp-content/uploads/2021/04/Amazon-Prime-Video-Logo-2022.png' },
    { name: 'Crunchyroll', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Crunchyroll_2024_stacked.svg/1200px-Crunchyroll_2024_stacked.svg.png' },
    { name: 'SonyLIV', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/SonyLIV_2020.svg/2560px-SonyLIV_2020.svg.png' },
    { name: 'ZEE5', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnb14y5fJ733NdX0Czf_Y8WUEJ7Z5Mt-OoXpwTzberJ3kSeTD8N_GcGQ33&s=10' },
    { name: 'Viki', url: 'https://cdn.worldvectorlogo.com/logos/viki.svg' },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
        {logos.map((logo) => (
          <div key={logo.name} className={`transition-all duration-300 ease-in-out transform hover:scale-105 relative ${
            logo.name === 'Netflix' ? 'h-10 w-32 sm:h-12 sm:w-36' : 'h-12 w-36 sm:h-14 sm:w-40'
          }`}>
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
