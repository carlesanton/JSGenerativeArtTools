import { 
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    createToggleButton,
    indentDiv,
  } from '../ui.js'
  
  export class PixelCam {
    static defaultPixelSize = 9;
    static defaultBGOpacity = 0.;
    static defaultColorLevels = 14;
    static defaultCellSize = 400;
    static defaultGridSideSize = null;
    static defaultASCIIString = '';

    constructor() {
        this.PCShader = null;
        this.PCInputs = null;

        // Initialize with defaults
        this.pixelSize = PixelCam.defaultPixelSize;
        this.colorLevels = PixelCam.defaultColorLevels;
        this.cellSize = PixelCam.defaultCellSize;
        this.gridSideSize = PixelCam.defaultGridSideSize;
        this.ASCIIString = PixelCam.defaultASCIIString;
        this.asciiTexture = null;
        this.spritesheets_atlas = null;
        this.frame_count = 0;
        this.frameGridSideSize = null;
        this.bgOpacity = PixelCam.defaultBGOpacity

        // Load Shader Code
        this.loadShaderCode();
    }
  
    loadShaderCode() {
        this.pc_src = loadStrings('./lib/JSGenerativeArtTools/pixelCam/pixel_cam_shader.frag');
    }

    initializeShader() {
        this.PCShader = createFilterShader(this.pc_src.join('\n'));

        this.PCShader.setUniform('pixel_size', this.pixelSize);
        this.PCShader.setUniform('bg_opacity', this.bgOpacity);
        this.PCShader.setUniform('color_levels', this.colorLevels);
        this.PCShader.setUniform('grid_side_size', this.gridSideSize);
    }
  
    pixelCamGPU(color_buffer) {
        this.PCShader.setUniform('ascii_texture', this.asciiTexture);
        this.PCShader.setUniform('spritesheets_atlas_texture', this.spritesheets_atlas);
        this.PCShader.setUniform('frame_count', this.frame_count);

        color_buffer.begin();

        filter(this.PCShader);

        color_buffer.end();
        return color_buffer;
    }

    createASCIITexture(asciiString) {
        this.ASCIIString = asciiString;

        const buffer_width = this.gridSideSize * this.cellSize;
        const buffer_height = this.gridSideSize * this.cellSize;

        let buffer_otions = {
            width: buffer_width,
            height: buffer_width,
            textureFiltering: NEAREST,
            antialias: false,
            desity: 1,
            format: UNSIGNED_BYTE,
            depth: false,
            channels: RGBA,
        }

        let buffer = createFramebuffer(buffer_otions);

        buffer.begin();
        background(255); // White background
        textAlign(CENTER, CENTER);
        textSize(this.cellSize);
        fill(0); // Black text

        for (let i = 0; i < asciiString.length; i++) {
            let row = floor(i / this.gridSideSize);
            let col = i % this.gridSideSize;

            if (row >= this.gridSideSize) break; // Stop if we exceed the grid size

            let x = col * this.cellSize + this.cellSize / 2;
            let y = row * this.cellSize + this.cellSize / 2;

            text(asciiString[i], x-buffer_width/2, y-buffer_height/2);
        }

        buffer.end();

        return buffer;
    }

    joinImagesIntoGrid(imageArray) {
        let cellSize = Math.max(...imageArray.map(img => img.width));;
        let gridSideSize = Math.ceil(Math.sqrt(imageArray.length));

        const buffer_width = gridSideSize * cellSize;
        const buffer_height = gridSideSize * cellSize;

        let buffer_otions = {
            width: buffer_width,
            height: buffer_width,
            textureFiltering: NEAREST,
            antialias: false,
            desity: 1,
            format: UNSIGNED_BYTE,
            depth: false,
            channels: RGBA,
        }

        let buffer = createFramebuffer(buffer_otions);

        buffer.begin();
        background(255, 255, 255); // White background

        for (let i = 0; i < imageArray.length; i++) {
            let row = floor(i / gridSideSize);
            let col = i % gridSideSize;

            if (row >= gridSideSize) break; // Stop if we exceed the grid size

            let x = col * cellSize;
            let y = row * cellSize;

            image(imageArray[i], x-buffer_width/2, y-buffer_height/2, cellSize, cellSize);
        }

        buffer.end();

        return buffer;
    }

    setPixelSize(new_pixel_size) {
        const old_pixel_size = this.pixelSize;
        this.pixelSize = new_pixel_size;

        this.PCShader.setUniform('pixel_size', this.pixelSize);

        return old_pixel_size;
    }

    setBGOpacity(new_bg_opacity) {
        const old_bg_opacity = this.bgOpacity;
        this.bgOpacity = new_bg_opacity;

        this.PCShader.setUniform('bg_opacity', this.bgOpacity);

        return old_bg_opacity;
    }

    setColorLevels(new_color_levels) {
        const old_color_levels = this.colorLevels;
        this.colorLevels = new_color_levels;

        this.PCShader.setUniform('color_levels', this.colorLevels);

        return old_color_levels;
    }

    setGridSideSize(newGirdSideSize) {
        this.gridSideSize = newGirdSideSize;
        this.PCShader.setUniform('grid_side_size', this.gridSideSize);
    }

    setASCIITexture(new_ascii_texture) {
        this.asciiTexture = new_ascii_texture;

        this.PCShader.setUniform('ascii_texture', this.asciiTexture);
    }
    
    setSpritesheetsAtlas(spritesheets_atlas) {
        this.spritesheets_atlas = spritesheets_atlas;
    }
    
    setNumberOfFrames(numberOfFrames) {
        this.numberOfFrames = numberOfFrames;
        this.PCShader.setUniform('number_of_frames', this.numberOfFrames);
    }

    setFrameGridSideSize(frameGridSideSize) {
        this.frameGridSideSize = frameGridSideSize;
        this.PCShader.setUniform('frame_grid_size', this.frameGridSideSize);
    }

    increaseFrame() {
        this.frame_count+=1;
    }

    createPixelCalSettings() {
        const elements_dict = {};

        // Create Main Card
        const card = create_daisyui_expandable_card('PixelCamgSettings', 'Pixel Cam');
        const cardBody = card.getElementsByClassName('collapse-content')[0];

        // Add input fields and labels
        // Pixel Size
        const pixelSize = create_number_input_slider_and_number(
            'PCpixelSize',
            'Pixel Size',
            this.pixelSize,
            5,
            150,
            (value) => this.setPixelSize(value),
        );
        elements_dict['PCpixelSize'] = pixelSize.getElementsByTagName('input')[0];
        // BG Opacity
        const bgOpacity = create_number_input_slider_and_number(
            'PCbgOpacity',
            'BG Opacity',
            this.bgOpacity,
            0,
            1.0,
            (value) => this.setBGOpacity(parseFloat(value)),
            0.01
        );
        elements_dict['PCbgOpacity'] = bgOpacity.getElementsByTagName('input')[0];

        cardBody.appendChild(pixelSize);
        cardBody.appendChild(bgOpacity);

        elements_dict['main-toolbar'] = card;
        this.PCInputs = elements_dict;
        return elements_dict;
    }
}
  
export default PixelCam;
