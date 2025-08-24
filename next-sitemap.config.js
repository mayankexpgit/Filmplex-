/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://filmplex.space',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.9,
  exclude: ['/*'], // ignore default / admin pages
  additionalPaths: async (config) => [
    { loc: '/movie/Kj2ibCfJrvsugBKbLKCC', lastmod: new Date().toISOString() },
    { loc: '/movie/CNLFc8FYvnnCNbchwJlk', lastmod: new Date().toISOString() },
    { loc: '/movie/lv8S0ESp1OZn3h9dfXqO', lastmod: new Date().toISOString() },
    { loc: '/movie/QyXFRwTEldmeI7cvLOie', lastmod: new Date().toISOString() },
    { loc: '/movie/AZUrDX7n3fFclwLi12QT', lastmod: new Date().toISOString() },
    { loc: '/movie/35mBnKhTh6veq5QpIJvs', lastmod: new Date().toISOString() },
    { loc: '/movie/dcIU19URJOVHKqP2xZuH', lastmod: new Date().toISOString() },
    { loc: '/movie/lv8S0ESp1OZn3h9dfXqO', lastmod: new Date().toISOString() },
  ],
};
