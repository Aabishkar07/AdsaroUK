/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.adsaro.com',
  generateRobotsTxt: true,
  // Put all URLs directly in sitemap.xml instead of using an index (sitemap-0.xml)
  generateIndexSitemap: false,
  sitemapSize: 7000,
  exclude: [],
  transform: async (config, path) => {
    let priority = 0.7;

    if (path === '/') priority = 1.0;
    if (path === '/blog') priority = 0.8;
    if (path === '/contact') priority = 0.8;
    if (path === '/advertising') priority = 0.8;
    if (path === '/signup') priority = 0.6;
    if (path === '/login') priority = 0.6;

    return {
      loc: path,
      changefreq: 'daily',
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const extraPaths = [];
    const blogSlugs = await getAllBlogSlugs();
    for (const slug of blogSlugs) {
      extraPaths.push({
        loc: `/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      });
    }

    return extraPaths;
  },
};
async function getAllBlogSlugs() {
  try {
    const res = await fetch('https://www.adsaro.com/api/blog-slugs');

    if (!res.ok) return [];

    const data = await res.json();
    const posts = data?.posts || [];
    return posts.map((post) => post.slug).filter(Boolean);
  } catch (e) {
    console.error('Error fetching blog slugs', e);
    return [];
  }
}
