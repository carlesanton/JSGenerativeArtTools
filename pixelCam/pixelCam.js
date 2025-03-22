import { 
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    createToggleButton,
    indentDiv,
  } from '../ui.js'
  
  export class PixelCam {
    static defaultPixelSize = 8;
    static defaultColorLevels = 10;

    constructor() {
        this.PCShader = null;
        this.PCInputs = null;

        // Initialize with defaults
        this.pixelSize = PixelCam.defaultPixelSize;
        this.colorLevels = PixelCam.defaultColorLevels;

        // Load Shader Code
        this.loadShaderCode();
    }
  
    loadShaderCode() {
        this.pc_src = loadStrings('./lib/JSGenerativeArtTools/pixelCam/pixel_cam_shader.frag');
    }

    initializeShader() {
        this.PCShader = createFilterShader(this.pc_src.join('\n'));

        this.PCShader.setUniform('pixel_size', this.pixelSize);
        this.PCShader.setUniform('color_levels', this.colorLevels);
    }
  
    pixelCamGPU(color_buffer) {
        color_buffer.begin();

        filter(this.PCShader);

        color_buffer.end();
        return color_buffer;
    }

    setPixelSize(new_pixel_size) {
        const old_pixel_size = this.pixelSize;
        this.pixelSize = new_pixel_size;

        this.PCShader.setUniform('pixel_size', this.pixelSize);

        return old_pixel_size;
    }

    setColorLevels(new_color_levels) {
        const old_color_levels = this.colorLevels;
        this.colorLevels = new_color_levels;

        this.PCShader.setUniform('color_levels', this.colorLevels);

        return old_color_levels;
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

        cardBody.appendChild(pixelSize);

        elements_dict['main-toolbar'] = card;
        this.PCInputs = elements_dict;
        return elements_dict;
    }
}
  
export default PixelCam;
