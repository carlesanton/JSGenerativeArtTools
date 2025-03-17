import { 
  create_number_input_slider_and_number,
  create_daisyui_expandable_card,
  createToggleButton,
  indentDiv,
} from '../ui.js'

export class PixelSort {
    static defaultPixelSortInitialSteps = 50; // 50
    static defaultPixelSortMaxSteps = 100;
    static defaultPixelSortingPasses = 8;
    static defaultSortNoiseScale = 360;
    static defaultNoiseDirectionChangeRate = 45;
    static defaultPSEnabled = true;
    static defaultRunForever = true;

    constructor() {
        this.pixel_sort_step = 0;
        this.noise_radius = 1.5;
        this.angle = -180;
        this.noise_coordinates = null;
        this.ps_src = '';
        this.PSShader = null;
        this.PSInputs = null;
        this.mask = null;

        // Initialize with defaults
        this.sortNoiseScale = PixelSort.defaultSortNoiseScale;
        this.noiseDirectionChangeRate = PixelSort.defaultNoiseDirectionChangeRate;
        this.pixelSortMaxSteps = PixelSort.defaultPixelSortMaxSteps;
        this.PixelSortInitialSteps = PixelSort.defaultPixelSortInitialSteps;
        this.pixelSortingPassesPerFrame = PixelSort.defaultPixelSortingPasses;
        this.enablePS = PixelSort.defaultPSEnabled;
        this.runForever = PixelSort.defaultRunForever;
        
        // Load Shader Code
        this.loadShaderCode();
    }

    sortStep(sorted) {
        sorted.loadPixels();
        for (let w = 0; w < sorted.width; w++) {
            for (let h = 0; h < sorted.height; h++) {
                let off1 = (h * sorted.width + w) * 4;
                let colorOne = [sorted.pixels[off1], sorted.pixels[off1 + 1], sorted.pixels[off1 + 2], 255];
                let off2 = ((h-0) * sorted.width + w-1) * 4;
                if (h==0 || w==0){
                    off2 = off1;
                }
                let colorTwo = [sorted.pixels[off2], sorted.pixels[off2 + 1], sorted.pixels[off2 + 2], 255];
                if (hue(colorOne) < hue(colorTwo)) {
                    if (hue(colorOne)<50) {
                        sorted.pixels[off1] = colorTwo[0];
                        sorted.pixels[off1+1] = colorTwo[1];
                        sorted.pixels[off1+2] = colorTwo[2];
                        sorted.pixels[off2] = colorOne[0];
                        sorted.pixels[off2+1] = colorOne[1];
                        sorted.pixels[off2+2] = colorOne[2];
                    }
                }
            }
            sorted.updatePixels();
        }
        return sorted;
    }

    sortStepRandom(sorted, n_iterations, direction = {x:1,y:0}) {
        let sorted_img = sorted.get();
        sorted_img.loadPixels();
        for(let i = 0; i<n_iterations; i++){
            let w = Math.floor(random(sorted.width));
            let h = Math.floor(random(sorted.height));
            let off1 = (h * sorted.width + w) * 4;
            let colorOne = [sorted.pixels[off1], sorted.pixels[off1 + 1], sorted.pixels[off1 + 2], 255];
            let off2 = ((h-direction.y) * sorted.width + w+direction.x) * 4;
            if (h>=sorted.height || w>=sorted.width || w==0 || h==0){
                off2 = off1;
            }
            let colorTwo = [sorted.pixels[off2], sorted.pixels[off2 + 1], sorted.pixels[off2 + 2], 255];
            if (brightness(colorOne) < brightness(colorTwo)) {
                sorted.pixels[off1] = colorTwo[0];
                sorted.pixels[off1+1] = colorTwo[1];
                sorted.pixels[off1+2] = colorTwo[2];
                sorted.pixels[off2] = colorOne[0];
                sorted.pixels[off2+1] = colorOne[1];
                sorted.pixels[off2+2] = colorOne[2];
            }
        }
        sorted_img.updatePixels();
        return sorted;
    }

    angleToCoordinates(angleInDegrees, radius = 100) {
        // Normalize the angle to be between 0 and 360
        let normalizedAngle = ((angleInDegrees % 360) + 360) % 360;
        // Convert the angle to radians
        let angleInRadians = normalizedAngle * Math.PI / 180;
        // Calculate the x and y coordinates
        let x = radius * Math.cos(angleInRadians);
        let y = radius * Math.sin(angleInRadians);
        return { x: Math.round(x), y: Math.round(y) };
    }

    loadShaderCode() {
        this.ps_src = loadStrings('./lib/JSGenerativeArtTools/pixelSorting/pixel_sort_shader.frag');
    }

    initializeShader() {
        this.PSShader = createFilterShader(this.ps_src.join('\n'));
    }

    pixelSortingGPU(color_buffer, apply_direction_change = false) {
        if (!this.enablePS) {
            return color_buffer;
        }

        color_buffer.begin();
        if (this.pixel_sort_step < this.pixelSortMaxSteps || this.runForever) {
            if(apply_direction_change && this.pixel_sort_step%this.noiseDirectionChangeRate==1) {
                this.changeDirection();
            }
            for (let i = 0; i < this.pixelSortingPassesPerFrame; i++) {
                if (this.mask !== undefined && this.mask !== null) { // pass only mask if not null
                    this.PSShader.setUniform('mask', this.mask);
                }
                this.PSShader.setUniform('iFrame', (this.PixelSortInitialSteps + this.pixel_sort_step) * this.pixelSortingPassesPerFrame + i);
                filter(this.PSShader);
            }
            this.pixel_sort_step++;
        }
        color_buffer.end();
        return color_buffer;
    }

    changeDirection() {
        let oldCoordinates = {x:12321, y:123123};
        if (this.noise_coordinates) {
            oldCoordinates = {...this.noise_coordinates}; // Clone the current coordinates
        }
        do {
            this.angle = noise(random(1000)) * this.sortNoiseScale;
            this.noise_coordinates = this.angleToCoordinates(this.angle, this.noise_radius);
            this.PSShader.setUniform('direction', [this.noise_coordinates.x, this.noise_coordinates.y]);
        } while (oldCoordinates.x == this.noise_coordinates.x && oldCoordinates.y == this.noise_coordinates.y);
    }

    setInitialSteps(new_initial_steps) {
        const old_initial_steps = this.PixelSortInitialSteps;
        this.PixelSortInitialSteps = new_initial_steps;
        return old_initial_steps;
    }

    setMaxSteps(new_max_steps) {
        const old_max_steps = this.pixelSortMaxSteps;
        this.pixelSortMaxSteps = new_max_steps;
        return old_max_steps;
    }

    setPassesPerFrame(new_passes_per_frame) {
        const old_passes_per_frame = this.pixelSortingPassesPerFrame;
        this.pixelSortingPassesPerFrame = new_passes_per_frame;
        return old_passes_per_frame;
    }

    setPassesPerFrameFromSlider(new_passes_per_frame) {
        var inputElement = this.PSInputs.PSPassesPerFrame;
        if (!inputElement) return null;

        var old_passes_per_frame = inputElement.value;
        inputElement.value = new_passes_per_frame;

        var event = new Event('input');
        inputElement.dispatchEvent(event);
        return old_passes_per_frame;
    }

    disablePassesPerFrame(enable) {
        this.enableParametter('PSPassesPerFrame', !enable);
    }

    togglePassesPerFrameAudioControlled(audioControlled) {
        this.toggleParameterToAudioReactiveTakenControls('PSPassesPerFrame', audioControlled)
    }

    setDirectionChangeRate(new_direction_change_rate) {
        const old_direction_change_rate = this.noiseDirectionChangeRate;
        this.noiseDirectionChangeRate = new_direction_change_rate;
        return old_direction_change_rate;
    }

    setDirectionChangeRateFromSlider(new_direction_change_rate) {
        var inputElement = this.PSInputs?.PSnoiseDirectionChangeRate;
        if (!inputElement) return null;

        var old_direction_change_rate = inputElement.value;
        inputElement.value = new_direction_change_rate;

        var event = new Event('input');
        inputElement.dispatchEvent(event);
        return old_direction_change_rate;
    }

    setDirectionChangeRateFromSliderToDefault() {
        var inputElement = this.PSInputs?.PSnoiseDirectionChangeRate;
        if (!inputElement) return null;

        var old_direction_change_rate = inputElement.value;
        inputElement.value = PixelSort.defaultNoiseDirectionChangeRate;

        var event = new Event('input');
        inputElement.dispatchEvent(event);
        return old_direction_change_rate;
    }

    enableParametter(parameter, enable) {
        var inputElement = this.PSInputs[parameter];
        if (!inputElement) return;

        if (!this.enablePS && enable) return; // Dont enable parametter if we are disabled
        inputElement.linkedDisabled = !enable;
        var event = new Event('input');
        inputElement.dispatchEvent(event);
    }

    disableDirectionChangeRate(enable) {
        this.enableParametter('PSnoiseDirectionChangeRate', !enable);
    }

    toggleDirectionChangeRateAudioControlled(audioControlled) {
        this.toggleParameterToAudioReactiveTakenControls('PSnoiseDirectionChangeRate', audioControlled)
    }

    toggleParameterToAudioReactiveTakenControls(parameter, add){
        if (add) {
            this.PSInputs[parameter].audioReactiveControlled = true;
        }
        else {
            this.PSInputs[parameter].audioReactiveControlled = false;
        }
    }

    resetSteps() {
        this.pixel_sort_step = 0;
    }

    getInitialSteps() {
        return this.PixelSortInitialSteps;
    }

    setEnable(enable) {
        this.enablePS = enable;
        if (this.enablePS) {
            console.log('Enabling PS');
        } else {
            console.log('Disabling PS');
        }
        this.enableParametters(this.enablePS)
    }

    enableParametters(enable) {
        for (const [key, par] of Object.entries(this.PSInputs)) {
            if (!par?.audioReactiveControlled) this.enableParametter(key, enable);
        }
    }

    setRunForever(runForever){
        this.runForever = runForever;
        const maxStepsSlider = this.PSInputs['PSMaxStepsDiv']
        if (this.runForever) {
            console.log('PS: Running Forever');
            maxStepsSlider.style.display = "none";
        } else {
            console.log('PS: Not Running for ever');
            maxStepsSlider.style.display = "";
        }
    }

    setMask(maskImage) {
        this.mask = maskImage;
    }

    createPixelSortingSettings() {
        const elements_dict = {};
        
        // Create Main Card
        const card = create_daisyui_expandable_card('PixelSortingSettings', 'Pixel Sorting');
        const cardBody = card.getElementsByClassName('collapse-content')[0];
        
        // Enable Disable Button
        const enablePSButton = createToggleButton('Enable', (a) => {
            this.setEnable(a.target.checked);
        }, this.enablePS);
        elements_dict['PSEnable'] = enablePSButton.getElementsByTagName('button')[0];

        // Add input fields and labels
        const initialSteps = create_number_input_slider_and_number(
            'PSinitialSteps',
            'Initial Steps',
            this.PixelSortInitialSteps,
            0,
            150,
            (value) => this.setInitialSteps(value),
        );
        elements_dict['PSinitialSteps'] = initialSteps.getElementsByTagName('input')[0];

        // Run Forever Button
        const maxStepsPSButton = createToggleButton('Run Forever', (a) => {
            this.setRunForever(a.target.checked);
        }, this.runForever);
        elements_dict['maxStepsPSButton'] = maxStepsPSButton.getElementsByTagName('button')[0];
        
        const maxSteps = create_number_input_slider_and_number(
            'PSMaxSteps',
            'Max Steps',
            this.pixelSortMaxSteps,
            1,
            1000,
            (value) => this.setMaxSteps(value),
        );
        indentDiv(maxSteps, '30px');
        maxSteps.style.display =  "" ? this.enablePS: "none"; // Hide at first if must be hiden
        elements_dict['PSMaxSteps'] = maxSteps.getElementsByTagName('input')[0];
        elements_dict['PSMaxStepsDiv'] = maxSteps;

        const passesPerFrame = create_number_input_slider_and_number(
            'PSPassesPerFrame',
            'Speed',
            this.pixelSortingPassesPerFrame,
            0,
            25,
            (value) => this.setPassesPerFrame(value),
        );
        elements_dict['PSPassesPerFrame'] = passesPerFrame.getElementsByTagName('input')[0];

        const noiseDirection = create_number_input_slider_and_number(
            'PSnoiseDirectionChangeRate',
            'Direction Change Rate',
            this.noiseDirectionChangeRate,
            0,
            150,
            (value) => this.setDirectionChangeRate(value),
        );
        elements_dict['PSnoiseDirectionChangeRate'] = noiseDirection.getElementsByTagName('input')[0];

        cardBody.appendChild(enablePSButton);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(initialSteps);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(maxStepsPSButton);
        cardBody.appendChild(maxSteps);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(passesPerFrame);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(noiseDirection);

        elements_dict['main-toolbar'] = card;
        this.PSInputs = elements_dict;
        return elements_dict;
    }

    updateAllParameters() {
        if (!this.PSInputs) return;
        
        this.noiseDirectionChangeRate = parseInt(this.PSInputs['PSnoiseDirectionChangeRate'].value);
        this.pixelSortMaxSteps = parseInt(this.PSInputs['PSMaxSteps'].value);
        this.PixelSortInitialSteps = parseInt(this.PSInputs['PSinitialSteps'].value);
        this.pixelSortingPassesPerFrame = parseInt(this.PSInputs['PSPassesPerFrame'].value);
    }
}

export default PixelSort;
