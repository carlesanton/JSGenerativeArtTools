import { 
  create_number_input_slider_and_number,
  create_daisyui_expandable_card,
  createToggleButton,
  indentDiv,
} from '../ui.js'

export class Mask {
    static defaultMinBrightness = .0;
    static defaultMaxBrightness = .30;
    static defaultMaskColor = [1., 1., 1., 1.];
    static defaultEnable = true;
    static defaultDisplay = false;
    static defaultOpacity = 30;

    constructor() {
        // Init Defaults
        this.maxBrightness = Mask.defaultMaxBrightness;
        this.minBrightness = Mask.defaultMinBrightness;
        this.maskColor = Mask.defaultMaskColor;
        this.mask = null;
        this.previousImage = null;
        this.MaskInputs = null;
        this.enable = Mask.defaultEnable;
        this.display = Mask.defaultDisplay;
        this.opcaity = Mask.defaultOpacity;

        this.width = width;
        this.height = height;

        // Load Shader Code
        this.loadShaderCode();
    }

    loadShaderCode() {
        this.mask_src = loadStrings('./lib/JSGenerativeArtTools/mask/mask_shader.frag');
        this.unmask_src = loadStrings('./lib/JSGenerativeArtTools/mask/unmask_shader.frag');
    }

    initializeShader() {
        this.MaskShader = createFilterShader(this.mask_src.join('\n'));
        this.MaskShader.setUniform('maskColor', this.maskColor);
        this.MaskShader.setUniform('maxBrightness', this.maxBrightness);
        this.MaskShader.setUniform('minBrightness', this.minBrightness);

        this.UnmaskShader = createFilterShader(this.unmask_src.join('\n'));
        this.UnmaskShader.setUniform('maskColor', this.maskColor);

        this.mask_buffer_otions = {
            width: this.width,
            height: this.height,
            textureFiltering: NEAREST,
            antialias: false,
            desity: 1,
            format: UNSIGNED_BYTE,
            depth: false,
            channels: RGBA,
        };
        this.mask = createFramebuffer(this.mask_buffer_otions)
        this.unmasked = createFramebuffer(this.mask_buffer_otions)
    }

    createMask(color_buffer) {
        this.MaskShader.setUniform('inputImage', color_buffer);
        this.previousImage = color_buffer;

        this.mask.begin();
        filter(this.MaskShader);
        this.mask.end();

        return this.mask;
    }

    displayMask() {
        tint(255, this.opcaity);
        // image(this.mask, 0, 0-height/2, width/2, height/2)
        image(this.mask, 0-width/2, 0-height/2, width, height)
    }

    getPreviousUsedImage() {
        return this.previousImage;
    }

    setEnable(enable) {
        this.enable = enable;
    }

    getEnable() {
        return this.enable;
    }

    isDisplayEnabled() {
        return this.display;
    }

    setDisplay(display) {
        this.display = display;
        const displayOpacitySlider = this.MaskInputs['displayOpacity']
        if (this.display) {
          console.log('Overlaying Mask');
          displayOpacitySlider.style.display = "";
        } else {
          console.log('Hiding Mask');
          displayOpacitySlider.style.display = "none";
        }
    }

    setOpacity(opcaity) {
        opcaity = map(opcaity, 0, 100, 0, 255);
        this.opcaity = opcaity;
    }

    setMaxBirghtness(newMaxBrightness) {
        this.maxBrightness = newMaxBrightness;
        this.MaskShader.setUniform('maxBrightness', this.maxBrightness);
    }

    setMinBirghtness(newMinBrightness) {
        this.minBrightness = newMinBrightness;
        this.MaskShader.setUniform('minBrightness', this.minBrightness);
    }

    setRecomputeMask(recomputeMask) {
        this.recomputeMask = recomputeMask;
    }

    createMaskSettings() {
        const elements_dict = {};
        
        // Create Main Card
        const card = create_daisyui_expandable_card('MaskSettings', 'Mask');
        const cardBody = card.getElementsByClassName('collapse-content')[0];
        
        const enable = createToggleButton('Enable', (a) => {
            this.setEnable(a.target.checked)
          },
          Mask.defaultEnable,
        );
        elements_dict['enable'] = enable.getElementsByTagName('button')[0];

        // Add Min / Max
        const minBrightnes = create_number_input_slider_and_number(
            'MaskMinBrightnes',
            'Min Brightness',
            this.minBrightness,
            0,
            1,
            (value) => this.setMinBirghtness(value),
            0.01,
        );
        elements_dict['MaskMinBrightnes'] = minBrightnes.getElementsByTagName('input')[0];

        const maxBrightnes = create_number_input_slider_and_number(
            'MaskMaxBrightnes',
            'Max Brightness',
            this.maxBrightness,
            0,
            1,
            (value) => this.setMaxBirghtness(value),
            0.01,
        );
        elements_dict['MaskMaxBrightnes'] = maxBrightnes.getElementsByTagName('input')[0];

        // Overlay
        const enableDisplayButton = createToggleButton('Overlay Mask', (a) => {
            this.setDisplay(a.target.checked)
          },
          Mask.defaultDisplay,
        );
        elements_dict['DisplayEnable'] = enableDisplayButton.getElementsByTagName('button')[0];

        const displayOpacity = create_number_input_slider_and_number(
            'maskDisplayOpacity',
            'Opacity',
            Mask.defaultOpacity,
            0,
            100,
            (e) => {this.setOpacity(e)},
        );
        indentDiv(displayOpacity, '30px');
        elements_dict['displayOpacity'] = displayOpacity.getElementsByTagName('input')[0];
        displayOpacity.style.display = Mask.defaultDisplay ? "": "none"; // Hide at first if must be hiden
        elements_dict['displayOpacity'] = displayOpacity;

        cardBody.appendChild(enable);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(minBrightnes);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(maxBrightnes);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(enableDisplayButton);
        cardBody.appendChild(displayOpacity);

        elements_dict['main-toolbar'] = card;
        this.MaskInputs = elements_dict;
        return elements_dict;
    }
}

export default Mask;
