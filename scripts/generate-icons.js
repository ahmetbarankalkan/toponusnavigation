const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000"/>
  <path d="M 80 256 Q 160 106, 256 256 T 432 256" stroke="#00ffff" stroke-width="64" fill="none" stroke-linecap="round"/>
</svg>
`;

const sizes = [192, 512];

async function generateIcons() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(assetsDir, `icon-${size}x${size}.png`);
    
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${size}x${size} icon`);
  }
  
  console.log('✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
