// scripts/generate-icons.js
// Script to generate placeholder PWA icons using jimp

const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const sizes = [192, 512];
  const iconsDir = path.join(__dirname, '../public/icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    console.log(`Generating ${size}x${size} icon...`);
    
    // Create a new image with blue background (#3b82f6)
    // Jimp 1.x uses hex numbers for colors: 0xRRGGBBAA
    const image = new Jimp({ 
        width: size, 
        height: size, 
        color: 0x3b82f6ff 
    });

    // Make it a circle
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    image.scan(0, 0, size, size, function(x, y, idx) {
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (distance > radius) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });

    // Save the image
    const outputPath = path.join(iconsDir, `icon-${size}.png`);
    await image.write(outputPath);
    console.log(`Saved: ${outputPath}`);
  }
  
  console.log('Icon generation complete!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
