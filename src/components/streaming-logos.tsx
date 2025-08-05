import React from 'react';
import Image from 'next/image';

const StreamingLogos = () => {
  const logos = [
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png' },
    { name: 'Prime Video', url: 'https://logos-world.net/wp-content/uploads/2021/04/Amazon-Prime-Video-Logo-2022.png' },
    { name: 'Crunchyroll', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6y8NB0xWjoeM6yjpnG-erXDow5NID2-G1doADFcKmOFfoljuwS7mNlsdQ&s=10' },
    { name: 'SonyLIV', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/SonyLIV_2020.svg/2560px-SonyLIV_2020.svg.png' },
    { name: 'ZEE5', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Zee5-official-logo.svg/2560px-Zee5-official-logo.svg.png' },
    { name: 'Viki', url: 'https://cdn.worldvectorlogo.com/logos/viki.svg' },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
        {logos.map((logo) => (
          <div key={logo.name} className="transition-all duration-300 ease-in-out transform hover:scale-105 relative h-12 w-32 sm:h-16 sm:w-40 bg-white rounded-md p-2">
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
