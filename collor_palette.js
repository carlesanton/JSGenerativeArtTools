
function extractCollorPaletteFromImage(img) {
    let resized_image = img.get();  // Duplicate the image
    resized_image.resize(10,10)
    resized_image.loadPixels();
    const colors = new Map();
    for (let i = 0; i < resized_image.pixels.length; i += 4) {
      const r = resized_image.pixels[i];
      const g = resized_image.pixels[i + 1];
      const b = resized_image.pixels[i + 2];
      const colorString = `${r},${g},${b}`;
      if (colors.has(colorString)) {
        colors.set(colorString, colors.get(colorString) + 1);
      } else {
        colors.set(colorString, 1);
      }
    }
  
    const sortedColors = Array.from(colors).sort((a, b) => b[1] - a[1]);
  
    return sortedColors.slice(0, 100).map(c => color(...c[0].split(',').map(Number)));
  }
  