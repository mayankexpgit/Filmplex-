import React from 'react';

const StreamingLogos = () => {
  const logos = [
    { name: 'Netflix', svg: <svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30"><path fill="#E50914" d="M90.38 2.3s-5.74.1-8.2.1c-1.7 0-3.32.1-4.8.1v23.4c1.5 0 3.2.1 4.8.1 2.45 0 8.2.1 8.2.1V2.3zm-20.6 0s-5.73.1-8.2.1c-1.7 0-3.32.1-4.8.1v23.4c1.5 0 3.2.1 4.8.1 2.45 0 8.2.1 8.2.1V2.3zM54.08 2.3s-5.74.1-8.2.1c-1.7 0-3.32.1-4.8.1v23.4c1.5 0 3.2.1 4.8.1 2.45 0 8.2.1 8.2.1V2.3zm-20.6 0s-5.74.1-8.2.1c-1.7 0-3.32.1-4.8.1v23.4c1.5 0 3.2.1 4.8.1 2.45 0 8.2.1 8.2.1V2.3zM17.78 2.3s-5.74.1-8.2.1C7.88 2.4 6.26 2.4 4.76 2.4v23.4c1.5 0 3.2.1 4.8.1 2.45 0 8.2.1 8.2.1V2.3z"/><path fill="#FFF" d="M10.43 2.4v23.3l12.4-11.65zM36.13 2.4v23.3l12.4-11.65zM61.83 2.4v23.3l12.4-11.65zM87.53 2.4v23.3l12.4-11.65z"/></svg> },
    { name: 'Prime Video', svg: <svg xmlns="http://www.w3.org/2000/svg" width="120" height="30" viewBox="0 0 120 30"><path fill="#00A8E1" d="M60 15c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z"/><path fill="#FFF" d="M71.8 19.6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/><path fill="#FFF" d="M10 2h100v26H10z"/><path fill="#000" d="M15 7h12v16H15zM32 7h12v16H32zM49 7h12v16H49zM66 7h12v16H66zM83 7h12v16H83z"/><text x="10" y="22" fontFamily="Amazon Ember, sans-serif" fontSize="18" fill="#000000" fontWeight="bold">prime video</text></svg> },
    { name: 'Crunchyroll', svg: <svg xmlns="http://www.w3.org/2000/svg" width="150" height="30" viewBox="0 0 150 30"><text x="5" y="22" fontFamily="Gibson, sans-serif" fontSize="22" fill="#F47521" fontWeight="bold">crunchyroll</text></svg> },
    { name: 'SonyLIV', svg: <svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30"><text x="5" y="22" fontFamily="Sony, sans-serif" fontSize="20" fill="#000000" fontWeight="bold">SONY</text><text x="55" y="22" fontFamily="LIV, sans-serif" fontSize="20" fill="#E31F26" fontWeight="bold">LIV</text></svg> },
    { name: 'ZEE5', svg: <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30" viewBox="0 0 80 30"><text x="5" y="22" fontFamily="ZEE, sans-serif" fontSize="24" fill="#753ECF" fontWeight="bold">ZEE</text><text x="50" y="22" fontFamily="5, sans-serif" fontSize="24" fill="#753ECF" fontWeight="bold">5</text></svg> },
    { name: 'Viki', svg: <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30" viewBox="0 0 80 30"><text x="5" y="22" fontFamily="Viki, sans-serif" fontSize="24" fill="#00A0E9" fontWeight="bold">viki</text></svg> },
  ];

  return (
    <div className="py-4">
      <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
        {logos.map((logo) => (
          <div key={logo.name} className="grayscale hover:grayscale-0 transition-all duration-300 ease-in-out transform hover:scale-105">
            {logo.svg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamingLogos;
