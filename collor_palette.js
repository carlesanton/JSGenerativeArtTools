import { RgbQuant } from './external_libraries/RgbQuant/rgbquant.js';

function extractCollorPaletteFromImage(img) {
    let resized_image = img.get();
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
  
    // return sortedColors.slice(0, 100).map(c => color(...c[0].split(',').map(Number)));
    let palette = sortedColors.slice(0, 100).map(c => color(...c[0].split(',').map(Number)));
    return palette.map(c=>c.levels)
  }

function buildPaletteIndexDict(palette){
  let palette_dictionary =  {};
  for (let i=0; i<palette.length; i++) {
    const colorString = `${palette[i][0]},${palette[i][1]},${palette[i][2]}`;
    palette_dictionary[colorString] = i;
  }
  return palette_dictionary
}

function displayPalette(colorPallete, palleteWidth, palleteHeight){
  const vertical = palleteHeight > palleteWidth;
  const squareSize = Math.sqrt(palleteWidth * palleteHeight / colorPallete.length);
  let numberOfColumns = palleteWidth / squareSize;
  let numberOfRows = palleteHeight / squareSize;
  if (vertical){
    numberOfColumns = Math.ceil(numberOfColumns);
    numberOfRows = Math.floor(numberOfRows);
  }
  else{
    numberOfColumns = Math.floor(numberOfColumns);
    numberOfRows = Math.ceil(numberOfRows);
  }

  let xOffset = 0;
  let yOffset = 0;

  // Change coords if using WEBGL
  let usingWEBGL = _renderer['GL']
  if (usingWEBGL){
    xOffset-=width/2
    yOffset-=height/2
  }

  strokeWeight(2); // Thickness of the border
  for (let row = 0; row < numberOfRows; row++) {
    for (let col = 0; col < numberOfColumns; col++) {
      let i = row * numberOfColumns + col;
      if (vertical){
        i = col * numberOfRows + row;
      }
      if (i < colorPallete.length) {
        fill(colorPallete[i]);
        square(xOffset + col * squareSize, yOffset + row * squareSize, squareSize);
      }
    }
  }
}

function colorQuantize(img_to_reduce, number_of_colors){
  let out = createImage(img_to_reduce.width, img_to_reduce.height);
  out.loadPixels()
  img_to_reduce.loadPixels()

  var opts = {
    colors: number_of_colors ,               // desired palette size
    method: 1,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
    boxSize: [64,64],        // subregion dims (if method = 2)
    // boxPxls: 2,              // min-population threshold (if method = 2)
    // initColors: 256,        // # of top-occurring colors  to start with (if method = 1)
    // minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
    // dithKern: null,          // dithering kernel name, see available kernels in docs below
    // dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
    // dithSerp: false,         // enable serpentine pattern dithering
    // palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
    reIndex: false,             // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
    // useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
    // cacheFreq: 10,           // min color occurance count needed to qualify for caching
    // colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
  };

  var q = new RgbQuant(opts); // option 2 of sublib

  q.sample(img_to_reduce.canvas, img_to_reduce.pixels[0].length);
  let reduced_image = new Uint8ClampedArray(q.reduce(img_to_reduce.canvas, 1))
  for (let w = 0; w < img_to_reduce.width; w ++) {
    for (let h = 0; h < img_to_reduce.height; h ++) {
      let off1 = (h * img_to_reduce.width + w) * 4;    
      out.pixels[off1] = reduced_image[off1];
      out.pixels[off1+1] = reduced_image[off1+1];
      out.pixels[off1+2] = reduced_image[off1+2];
      out.pixels[off1+3] = 255;
    }
  }
  out.updatePixels()
  return out
}

export {
  extractCollorPaletteFromImage,
  buildPaletteIndexDict,
  displayPalette,
  colorQuantize,
};
