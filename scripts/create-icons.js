// اسکریپت ساده برای ساخت آیکون‌های موقت SVG
const fs = require('fs');
const path = require('path');

const createSvgIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-size="${size * 0.4}" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">ش</text>
</svg>
`;

// ساخت فایل‌های SVG
const publicDir = path.join(__dirname, '..', 'public');

// ذخیره آیکون‌ها
fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), createSvgIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), createSvgIcon(512));
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), createSvgIcon(32));

console.log('✅ آیکون‌های SVG با موفقیت ساخته شدند!');
console.log('📝 توجه: برای بهترین کیفیت، آیکون‌های PNG واقعی را با ابزارهای گرافیکی ایجاد کنید.');
