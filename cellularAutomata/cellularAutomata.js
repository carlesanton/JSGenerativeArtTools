import { 
    create_number_input_slider_and_number, 
    create_daisyui_expandable_card, 
    createToggleButton,
    indentDiv,
} from '../ui.js'

export class CellularAutomata {
    static defaultRandomColorChangeRate = 10;
    static defaultCAMaxSteps = 100;
    static defaultCAPassesPerFrame = 1;
    static defaultCellularAutomataInitialSteps = 0;
    static defaultCAEnabled = true;
    static defaultRunForever = true;
    static defaultFadeToNewImage = false; // set to false before commit
    static defaultFadeSpeed = 0.01;
    static defaultChromaColor = [0.,1.,0.,1.]
    
    constructor() {
        this.cellular_automata_step = 0;
        this.ca_src = '';
        this.CAShader = null;
        this.CAInputs = null;
        this.mask = null;
        this.newImage = null;
        
        // Initialize with defaults
        this.CARandomColorChangeRate = CellularAutomata.defaultRandomColorChangeRate;
        this.CAMaxSteps = CellularAutomata.defaultCAMaxSteps;
        this.CAPassesPerFrame = CellularAutomata.defaultCAPassesPerFrame;
        this.CellularAutomataInitialSteps = CellularAutomata.defaultCellularAutomataInitialSteps;
        this.enableCA = CellularAutomata.defaultCAEnabled;
        this.runForever = CellularAutomata.defaultRunForever;
        this.fadeToNewImage = CellularAutomata.defaultFadeToNewImage;
        this.fadeSpeed = CellularAutomata.defaultFadeSpeed;
        this.chromaColor = CellularAutomata.defaultChromaColor;

        // Load Shader Code
        this.loadShaderCode();
    }

    getMajorityColor(x, y, grid) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        const colors = new Map();
        let current_off = (y * grid.width + x) * 4;
        let current_color = [grid.pixels[current_off], grid.pixels[current_off + 1], grid.pixels[current_off + 2]];
        const currentColorString = `${current_color[0]},${current_color[1]},${current_color[2]}`;
        
        for (const [dx, dy] of directions) {
            const nx = (x + dx);
            const ny = (y + dy);
            let neighbour_color = [1,0,0,1];
            if (nx<grid.width && ny<grid.height && nx >= 0 && ny >= 0) {
                let off = (ny * grid.width + nx) * 4;
                neighbour_color = [grid.pixels[off], grid.pixels[off + 1], grid.pixels[off + 2]];
            }
            else {
                neighbour_color = current_color;
            }
            const colorString = `${neighbour_color[0]},${neighbour_color[1]},${neighbour_color[2]}`;
            if (colors.has(colorString)) {
                colors.set(colorString, colors.get(colorString) + 1);
            } else {
                colors.set(colorString, 1);
            }
        }
        
        const sortedColors = Array.from(colors).sort((a, b) => b[1] - a[1]);
        let output_color = sortedColors[0][0];
        if (currentColorString == output_color && sortedColors.length>1) {
            output_color = sortedColors[1][0];
        }
        return output_color.split(',').map(Number);
    }

    getAverageColor(x, y, grid) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [-1, -1], [1, 1]
        ];
        let totalSumR = 0, totalSumG = 0, totalSumB = 0, totalCount = 0;
        
        for (const [dx, dy] of directions) {
            const nx = (x + dx + grid.width) % grid.width;
            const ny = (y + dy + grid.height) % grid.height;
            let neighbour_color = [1,0,0,1];
            if (nx < grid.width && ny < grid.height && nx > 0 && ny > 0) {
                neighbour_color = grid.get(nx, ny);
            } else {
                neighbour_color = grid.get(x, y);
            }
            totalSumR += neighbour_color[0];
            totalSumG += neighbour_color[1];
            totalSumB += neighbour_color[2];
            totalCount++;
        }
        
        const averageColor = [(totalSumR / totalCount), (totalSumG / totalCount), (totalSumB / totalCount)];
        return color(averageColor);
    }

    cellularAutomata(grid) {
        let newGrid = grid.get();
        newGrid.loadPixels();
        grid.loadPixels();
        
        for (let h = 0; h < grid.height; h++) {
            for (let w = 0; w < grid.width; w++) {
                let off = (h * grid.height + w) * 4;
                let new_color = this.getMajorityColor(w, h, grid);
                newGrid.pixels[off] = new_color[0];
                newGrid.pixels[off+1] = new_color[1];
                newGrid.pixels[off+2] = new_color[2];
            }
        }
        newGrid.updatePixels();
        return newGrid;
    }

    cellularAutomataMulticolorCircle(grid, palette, new_random_color_index) {
        let newGrid = grid.get();
        newGrid.loadPixels();
        grid.loadPixels();
        
        for (let h = 0; h < grid.height; h++) {
            for (let w = 0; w < grid.width; w++) {
                let off = (h * grid.height + w) * 4;
                const current_color = [newGrid.pixels[off],newGrid.pixels[off+1],newGrid.pixels[off+2]];
                let neighboursWithSameColor = this.countNeighboursWithColor(w, h, grid, current_color);
                let nextMajorityColor = this.getMajorityColor(w, h, grid);
                let neighboursWithNextColor = this.countNeighboursWithColor(w, h, grid, nextMajorityColor);
                let new_color = [255,0,0];
                
                if (neighboursWithSameColor==8 || neighboursWithSameColor == 3) {
                    new_color = current_color;
                }
                else if ((neighboursWithSameColor < 2  || neighboursWithNextColor == 3)) {
                    new_color = nextMajorityColor;
                }
                else if ((neighboursWithNextColor < 3 && neighboursWithSameColor == 5)) {
                    new_color = palette[new_random_color_index];
                } else {
                    new_color = current_color;
                }
                
                newGrid.pixels[off] = new_color[0];
                newGrid.pixels[off+1] = new_color[1];
                newGrid.pixels[off+2] = new_color[2];
            }
        }
        newGrid.updatePixels();
        return newGrid;
    }

    countNeighboursWithColor(x, y, grid, color) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        let neighbouts_with_color = 0;
        const color_string = `${color[0]},${color[1]},${color[2]}`;
        
        for (const [dx, dy] of directions) {
            const nx = (x + dx);
            const ny = (y + dy);
            let neighbour_color_string = '';
            if (nx<grid.width && ny<grid.height && nx >= 0 && ny >= 0) {
                let off = (ny * grid.width + nx) * 4;
                neighbour_color_string = `${grid.pixels[off]},${grid.pixels[off+1]},${grid.pixels[off+2]}`;
            }
            else {
                neighbour_color_string = color_string;
            }
            if (neighbour_color_string == color_string) {
                neighbouts_with_color+=1;
            }
        }
        return neighbouts_with_color;
    }

    loadShaderCode() {
        this.ca_src = loadStrings('./lib/JSGenerativeArtTools/cellularAutomata/cellular_automata_shader.frag');
    }

    initializeShader() {
        this.CAShader = createFilterShader(this.ca_src.join('\n'));
    }

    cellularAutomataGPU(color_buffer) {
        if (!this.enableCA) {
            return color_buffer;
        }
        color_buffer.begin();
        if (this.cellular_automata_step < this.CAMaxSteps || this.runForever) {
            for (let i = 0; i < this.CAPassesPerFrame; i++) {
                if (this.mask !== undefined && this.mask !== null) { // pass only mask if not null
                    this.CAShader.setUniform('mask', this.mask);
                }
                filter(this.CAShader);
            }
            this.cellular_automata_step += 1;
        }
        color_buffer.end();
        return color_buffer;
    }

    setInitialSteps(new_initial_steps) {
        const old_initial_steps = this.CellularAutomataInitialSteps;
        this.CellularAutomataInitialSteps = new_initial_steps;
        return old_initial_steps;
    }

    setMaxSteps(new_max_steps) {
        const old_max_steps = this.CAMaxSteps;
        this.CAMaxSteps = new_max_steps;
        return old_max_steps;
    }

    setPassesPerFrame(new_passes_per_frame) {
        const old_passes_per_frame = this.CAPassesPerFrame;
        this.CAPassesPerFrame = new_passes_per_frame;
        return old_passes_per_frame;
    }

    setRandomColorChangeRate(new_change_rate) {
        const old_change_rate = this.CARandomColorChangeRate;
        this.CARandomColorChangeRate = new_change_rate;
        return old_change_rate;
    }

    setRandomColorChangeRateFromSlider(new_color_change_rate) {
        var inputElement = this.CAInputs?.CARandomColorChangeRate;
        if (!inputElement) return null;

        var old_color_change_rate = inputElement.value;
        inputElement.value = new_color_change_rate;
        
        var event = new Event('input');
        inputElement.dispatchEvent(event);
        return old_color_change_rate;
    }

    enableParametter(parameter, enable) {
        var inputElement = this.CAInputs[parameter];
        if (!inputElement) return;

        if (!this.enableCA && enable) return; // Dont enable parametter if we are disabled
        inputElement.linkedDisabled = !enable;
        var event = new Event('input');
        inputElement.dispatchEvent(event);
    }

    disableRandomColorChangeRate(enable) {
        this.enableParametter('CARandomColorChangeRate', !enable);
    }

    setPassesPerFrameFromSlider(new_passes_per_frame) {
        var inputElement = this.CAInputs?.CAPassesPerFrame;
        if (!inputElement) return null;

        var old_passes_per_frame = inputElement.value;
        inputElement.value = new_passes_per_frame;
        
        var event = new Event('input');
        inputElement.dispatchEvent(event);
        return old_passes_per_frame;
    }

    disablePassesPerFrame(enable) {
        this.enableParametter('CAPassesPerFrame', !enable);
    }

    togglePassesPerFrameRateAudioControlled(audioControlled) {
        this.toggleParameterToAudioReactiveTakenControls('CAPassesPerFrame', audioControlled)
    }

    toggleParameterToAudioReactiveTakenControls(parameter, add){
        if (add) {
            this.CAInputs[parameter].audioReactiveControlled = true;
        }
        else {
            this.CAInputs[parameter].audioReactiveControlled = false;
        }
    }

    setNewRandomColor(new_random_color) {
        this.CAShader.setUniform('next_random_color', new_random_color);
    }

    resetSteps() {
        this.cellular_automata_step = 0;
    }

    getRandomColorChangeRate() {
        return this.CARandomColorChangeRate;
    }

    getInitialSteps() {
        return this.CellularAutomataInitialSteps;
    }

    setEnable(enable) {
        this.enableCA = enable;
        if (this.enableCA) {
            console.log('Enabling CA');
        } else {
            console.log('Disabling CA');
        }
        this.enableParametters(this.enableCA)
    }

    enableParametters(enable) {
        for (const [key, par] of Object.entries(this.CAInputs)) {
            if (!par?.audioReactiveControlled) this.enableParametter(key, enable);
        }
    }

    setRunForever(runForever){
        this.runForever = runForever;
        const maxStepsSlider = this.CAInputs['CAMaxStepsDiv']
        if (this.runForever) {
            console.log('CA: Running Forever');
            maxStepsSlider.style.display = "none";
        } else {
            console.log('CA: Not Running for ever');
            maxStepsSlider.style.display = "";
        }
    }

    setMask(maskImage) {
        this.mask = maskImage;
    }

    createSettingsCard() {
        const elements_dict = {};
        
        const card = create_daisyui_expandable_card('cellularAutomataSettings', 'Cellular Automata');
        const cardBody = card.getElementsByClassName('collapse-content')[0];
        
        const enableCAButton = createToggleButton('Enable', (a) => {
            this.setEnable(a.target.checked);
        }, this.enableCA);
        elements_dict['CAEnable'] = enableCAButton.getElementsByTagName('button')[0];

        const initialSteps = create_number_input_slider_and_number(
            'CAInitialSteps',
            'Initial Steps',
            this.CellularAutomataInitialSteps,
            0,
            150,
            (value) => this.setInitialSteps(value),
        );
        elements_dict['CAInitialSteps'] = initialSteps.getElementsByTagName('input')[0];

        // Run Forever Button
        const maxStepsCAButton = createToggleButton('Run Forever', (a) => {
            this.setRunForever(a.target.checked);
        }, this.runForever);
        elements_dict['maxStepsCAButton'] = maxStepsCAButton.getElementsByTagName('button')[0];

        const maxSteps = create_number_input_slider_and_number(
            'CAMaxSteps',
            'Max Steps',
            this.CAMaxSteps,
            1,
            1000,
            (value) => this.setMaxSteps(value),
        );
        indentDiv(maxSteps, '30px');
        maxSteps.style.display =  "" ? this.enableCA: "none"; // Hide at first if must be hiden
        elements_dict['CAMaxSteps'] = maxSteps.getElementsByTagName('input')[0];
        elements_dict['CAMaxStepsDiv'] = maxSteps;

        const passesPerFrame = create_number_input_slider_and_number(
            'CAPassesPerFrame',
            'Speed',
            this.CAPassesPerFrame,
            0,
            5,
            (value) => this.setPassesPerFrame(value),
        );
        elements_dict['CAPassesPerFrame'] = passesPerFrame.getElementsByTagName('input')[0];

        const randomColor = create_number_input_slider_and_number(
            'CARandomColorChangeRate',
            'Random Color Change Rate',
            this.CARandomColorChangeRate,
            0,
            100,
            (value) => this.setRandomColorChangeRate(value),
        );
        elements_dict['CARandomColorChangeRate'] = randomColor.getElementsByTagName('input')[0];

        cardBody.appendChild(enableCAButton);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(initialSteps);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(maxStepsCAButton);
        cardBody.appendChild(maxSteps);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(passesPerFrame);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(randomColor);
        elements_dict['main-toolbar'] = card;
        this.CAInputs = elements_dict;
        return elements_dict;
    }

    updateAllParameters() {
        if (!this.CAInputs) return;
        
        this.CARandomColorChangeRate = parseInt(this.CAInputs['CARandomColorChangeRate'].value);
        this.CAMaxSteps = parseInt(this.CAInputs['CAMaxSteps'].value);
        this.CAPassesPerFrame = parseInt(this.CAInputs['CAPassesPerFrame'].value);
        this.CellularAutomataInitialSteps = parseInt(this.CAInputs['CAInitialSteps'].value);
    }
}

export default CellularAutomata;
