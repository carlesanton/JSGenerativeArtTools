import {
  create_daisyui_expandable_card,
  create_number_input_slider_and_number,
  createToggleButton,
} from '../ui.js';

export class ImageAdjustment {

    // Defaults
    static defaultGamma = 1.0;
    static defaultContrast = 1.0;
    static defaultBrightness = 0.0;
    static defaultExposure = 1.0;
    static defaultSaturation = 1.0;
    static defaultBlackLevel = 0.0;
    static defaultWhiteLevel = 1.0;
    static defaultInvert = false;

    constructor() {
        this.shader_src = null;
        this.shader = null;

        this.inputs = null;

        this.gamma = ImageAdjustment.defaultGamma;
        this.contrast = ImageAdjustment.defaultContrast;
        this.brightness = ImageAdjustment.defaultBrightness;
        this.exposure = ImageAdjustment.defaultExposure;
        this.saturation = ImageAdjustment.defaultSaturation;
        this.blackLevel = ImageAdjustment.defaultBlackLevel;
        this.whiteLevel = ImageAdjustment.defaultWhiteLevel;
        this.invert = ImageAdjustment.defaultInvert;

        this.loadShaderCode();
    }

    loadShaderCode() {
        this.shader_src = loadStrings('./lib/JSGenerativeArtTools/imageAdjustment/image_adjustment_shader.frag');
    }

    initializeShader() {
        this.shader = createFilterShader(this.shader_src.join('\n'));

        this.shader.setUniform('gamma', this.gamma);
        this.shader.setUniform('contrast', this.contrast);
        this.shader.setUniform('brightness', this.brightness);
        this.shader.setUniform('exposure', this.exposure);
        this.shader.setUniform('saturation', this.saturation);
        this.shader.setUniform('blackLevel', this.blackLevel);
        this.shader.setUniform('whiteLevel', this.whiteLevel);
        this.shader.setUniform('invert', this.invert);
    }

    imageAdjustmentGPU(color_buffer) {
        color_buffer.begin();
        filter(this.shader);
        color_buffer.end();

        return color_buffer;
    }

    // SETTERS
    setGamma(v) {
        const old = this.gamma;
        this.gamma = parseFloat(v);
        this.shader.setUniform('gamma', this.gamma);
        return old;
    }

    setContrast(v) {
        const old = this.contrast;
        this.contrast = parseFloat(v);
        this.shader.setUniform('contrast', this.contrast);
        return old;
    }

    setBrightness(v) {
        const old = this.brightness;
        this.brightness = parseFloat(v);
        this.shader.setUniform('brightness', this.brightness);
        return old;
    }

    setExposure(v) {
        const old = this.exposure;
        this.exposure = parseFloat(v);
        this.shader.setUniform('exposure', this.exposure);
        return old;
    }

    setSaturation(v) {
        const old = this.saturation;
        this.saturation = parseFloat(v);
        this.shader.setUniform('saturation', this.saturation);
        return old;
    }

    setBlackLevel(v) {
        const old = this.blackLevel;
        this.blackLevel = parseFloat(v);

        // Prevent divide by zero
        if (this.whiteLevel <= this.blackLevel) {
            this.whiteLevel = this.blackLevel + 0.001;
            this.shader.setUniform('whiteLevel', this.whiteLevel);
        }

        this.shader.setUniform('blackLevel', this.blackLevel);
        return old;
    }

    setWhiteLevel(v) {
        const old = this.whiteLevel;
        this.whiteLevel = parseFloat(v);

        // Prevent divide by zero
        if (this.whiteLevel <= this.blackLevel) {
            this.blackLevel = this.whiteLevel - 0.001;
            this.shader.setUniform('blackLevel', this.blackLevel);
        }

        this.shader.setUniform('whiteLevel', this.whiteLevel);
        return old;
    }

    setInvert(v) {
        const old = this.invert;
        this.invert = v ? 1.0 : 0.0;
        this.shader.setUniform('invert', this.invert);
        return old;
    }

    // UI
    createImageAdjustmentSettings() {
        const elements_dict = {};

        const card = create_daisyui_expandable_card(
            'imageAdjustmentSettings',
            'Image Adjustment'
        );

        const cardBody = card.getElementsByClassName('collapse-content')[0];

        const gammaInput = create_number_input_slider_and_number(
            'gamma',
            'Gamma',
            ImageAdjustment.defaultGamma,
            0.05,
            3.0,
            (e) => this.setGamma(e),
            0.05,
        );

        const contrastInput = create_number_input_slider_and_number(
            'contrast',
            'Contrast',
            ImageAdjustment.defaultContrast,
            0.0,
            3.0,
            (e) => this.setContrast(e),
            0.05,
        );

        const brightnessInput = create_number_input_slider_and_number(
            'brightness',
            'Brightness',
            ImageAdjustment.defaultBrightness,
            -1.0,
            1.0,
            (e) => this.setBrightness(e),
            0.05,
        );

        const exposureInput = create_number_input_slider_and_number(
            'exposure',
            'Exposure',
            ImageAdjustment.defaultExposure,
            0.0,
            3.0,
            (e) => this.setExposure(e),
            0.05,
        );

        const saturationInput = create_number_input_slider_and_number(
            'saturation',
            'Saturation',
            ImageAdjustment.defaultSaturation,
            0.0,
            2.0,
            (e) => this.setSaturation(e),
            0.05,
        );

        const blackLevelInput = create_number_input_slider_and_number(
            'blackLevel',
            'Black Level',
            ImageAdjustment.defaultBlackLevel,
            0.0,
            1.0,
            (e) => this.setBlackLevel(e),
            0.05,
        );

        const whiteLevelInput = create_number_input_slider_and_number(
            'whiteLevel',
            'White Level',
            ImageAdjustment.defaultWhiteLevel,
            0.0,
            1.0,
            (e) => this.setWhiteLevel(e),
            0.05,
        );
        const invertToggle = createToggleButton(
            'Invert',
            (a) => { this.setInvert(a.target.checked); },
            ImageAdjustment.defaultInvert
        );

        elements_dict['invert'] = invertToggle.getElementsByTagName('button')[0];

        cardBody.appendChild(gammaInput);
        cardBody.appendChild(contrastInput);
        cardBody.appendChild(brightnessInput);
        cardBody.appendChild(exposureInput);
        cardBody.appendChild(saturationInput);
        cardBody.appendChild(blackLevelInput);
        cardBody.appendChild(whiteLevelInput);
        cardBody.appendChild(invertToggle);

        elements_dict['main-toolbar'] = card;

        this.inputs = elements_dict;

        return elements_dict;
    }
}