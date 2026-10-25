// Regenerates public/og-default.png from scripts/og-default.svg.
// Run manually after changing the SVG: node scripts/generate-og.mjs
import sharp from 'sharp';

await sharp('scripts/og-default.svg').png({ compressionLevel: 9 }).toFile('public/og-default.png');
console.log('Wrote public/og-default.png');
