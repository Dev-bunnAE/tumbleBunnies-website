import { NextApiRequest, NextApiResponse } from 'next';

// Next.js API route to generate sitemap.xml
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml');
  // You can dynamically generate URLs from your DB here
  const staticUrls = [
    '',
    'classes',
    'merchandise',
    'login',
    'register',
    'cart',
    'checkout',
    'account',
    'admin',
  ];
  const baseUrl = 'https://tumblebunnies.com';
  const urls = staticUrls.map(
    (path) => `<url><loc>${baseUrl}/${path}</loc></url>`
  ).join('');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;
  res.status(200).send(sitemap);
} 