import { RgbQuant } from './RgbQuant/rgbquant.js';
import { create_daisyui_expandable_card, create_number_input_slider_and_number, createToggleButton } from '../ui.js';

export class ColorPalette{
  // Pallete display variables
  static defaultPalleteWidth = 36
  static defaultPalleteHeight = 720;
  static defaultShowPallete = false;
  static defaultNumberOfColors = 20;

  constructor(){
    this.palette = null;
    this.palette_dictionary = null;
    this.ColorPaletteInputs = null;
    this.width = ColorPalette.defaultPalleteWidth;
    this.heigh = ColorPalette.defaultPalleteHeight;
    this.show = ColorPalette.defaultShowPallete;
    this.numberOfColors = ColorPalette.defaultNumberOfColors;
  }

  extractFromImage(img) {
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
    this.palette = palette.map(c=>c.levels)
  }

  display(x, y){
    const vertical = this.heigh > this.width;
    const squareSize = Math.sqrt(this.width * this.heigh / this.palette.length);
    let numberOfColumns = this.width / squareSize;
    let numberOfRows = this.heigh / squareSize;
    if (vertical){
      numberOfColumns = Math.ceil(numberOfColumns);
      numberOfRows = Math.ceil(numberOfRows);
    }
    else{
      numberOfColumns = Math.ceil(numberOfColumns);
      numberOfRows = Math.ceil(numberOfRows);
    }
  
    strokeWeight(2); // Thickness of the border
    for (let row = 0; row < numberOfRows; row++) {
      for (let col = 0; col < numberOfColumns; col++) {
        let i = row * numberOfColumns + col;
        if (vertical){
          i = col * numberOfRows + row;
        }
        if (i < this.palette.length) {
          fill(this.palette[i]);
          square(x + col * squareSize, y + row * squareSize, squareSize);
        }
      }
    }
  }

  colorQuantize(img_to_reduce){
    let out = createImage(img_to_reduce.width, img_to_reduce.height);
    out.loadPixels()
    img_to_reduce.loadPixels()

    var opts = {
      colors: this.numberOfColors ,               // desired palette size
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

  setDisplay(display) {
    this.show = display;
    if (this.show) {
      console.log('Showing Palette Visualization');
      this.ColorPaletteInputs['displayPalette'].textContent = 'Hide';
    } else {
      console.log('Hiding Palette Visualization');
      this.ColorPaletteInputs['displayPalette'].textContent = 'Show';
    }
  }

  setDisplay(show) {
    this.show = show;
    if (this.show) {
      console.log('Showing Palette Visualization');
    } else {
      console.log('Hiding Palette Visualization');
    }
  }

  get(){
    return this.palette;
  }

  getRandomColor(){
    let new_random_color_index = Math.round(random(0,this.palette.length-1))
    let randomColor =  this.palette[new_random_color_index];

    return randomColor;
  }

  isDisplayEnabled(){
    return this.show;
  }

  setWidth(width){
    this.width = width;
  }

  setHeight(heigh){
    this.heigh = heigh;
  }

  setNumberOfColors(numberOfColors){
    this.numberOfColors = numberOfColors;
  }

  createColorPaletteControlsCard() {
    const elements_dict = {};

    const card = create_daisyui_expandable_card('colorPaletteSettings', 'Color Palette');
    const cardBody = card.getElementsByClassName('collapse-content')[0];
    
    const enableVisButton = createToggleButton('Display', (a) => {
        this.setDisplay(a.target.checked)
      },
      ColorPalette.defaultShowPallete
    );
    elements_dict['displayPalette'] = enableVisButton.getElementsByTagName('button')[0];

    const displayHeight = create_number_input_slider_and_number(
      'colorPaletteHeight',
      'Height',
      ColorPalette.defaultPalleteHeight,
      10,
      4000,
      (e) => {this.setHeight(e)},
    );
    elements_dict['height'] = displayHeight.getElementsByTagName('input')[0];

    const displayWidth = create_number_input_slider_and_number(
      'colorPaletteWidth',
      'Width',
      ColorPalette.defaultPalleteWidth,
      10,
      4000,
      (e) => {this.setWidth(e)},
    );
    elements_dict['width'] = displayWidth.getElementsByTagName('input')[0];

    const numberOfColorsInput = create_number_input_slider_and_number(
      'paletteNumberOfColors',
      'Number of colors',
      ColorPalette.defaultNumberOfColors,
      2,
      200,
      (e) => {this.setNumberOfColors(e)},
    );
    elements_dict['numberOfColors'] = numberOfColorsInput.getElementsByTagName('input')[0];
  
    cardBody.appendChild(enableVisButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(displayHeight);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(displayWidth);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(numberOfColorsInput);

    elements_dict['main-toolbar'] = card;

    this.ColorPaletteInputs = elements_dict;

    return elements_dict;
  }
}
