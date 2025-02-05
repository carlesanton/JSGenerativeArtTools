import {create_number_input_slider_and_number, create_daisyui_expandable_card, createToggleButton} from './ui.js'

export let defaultRandomColorChangeRate = 3;
export let defaultCAMaxSteps = -1;
export let defaultCAPassesPerFrame = 1;
export let defaultCellularAutomataInitialSteps = 0;
export let defaultCAEnabled = true;

let CARandomColorChangeRate;
let CAMaxSteps;
let CAPassesPerFrame;
let CellularAutomataInitialSteps;

let CAInputs;

let cellular_automata_step = 0
let CAShader; // variable for the shader
let ca_src = '';
let enableCA = defaultCAEnabled;

function getMajorityColor(x, y, grid) {
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
        let neighbour_color = [1,0,0,1]
        if (nx<grid.width && ny<grid.height && nx >= 0 && ny >= 0) {
            let off = (ny * grid.width + nx) * 4;
            neighbour_color = [grid.pixels[off], grid.pixels[off + 1], grid.pixels[off + 2]];
        }
        else {
            neighbour_color = current_color;
            // neighbour_color = grid.get(x, y)
        }
        const colorString = `${neighbour_color[0]},${neighbour_color[1]},${neighbour_color[2]}`;
        // console.log(colorString)
        if (colors.has(colorString)) {
            colors.set(colorString, colors.get(colorString) + 1);
        } else {
            colors.set(colorString, 1);
        }
    }
    // Determine the majority color
    const sortedColors = Array.from(colors).sort((a, b) => b[1] - a[1]);

    // console.log(sortedColors)
    let output_color = sortedColors[0][0]
    if (currentColorString == output_color && sortedColors.length>1){
        output_color = sortedColors[1][0]
    }
    // return [255,0,0,255];
    return output_color.split(',').map(Number);
}

function getAverageColor(x, y, grid) {
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

    // Calculate the average color
    const averageColor = [(totalSumR / totalCount), (totalSumG / totalCount), (totalSumB / totalCount)];

    return color(averageColor);
}

// Update the grid based on majority color
function cellular_automata(grid) {
    let newGrid = grid.get();
    newGrid.loadPixels();
    grid.loadPixels();
    for (let h = 0; h < grid.height; h++) {
        for (let w = 0; w < grid.width; w++) {
            let off = (h * grid.height + w) * 4;
            let new_color = getMajorityColor(w, h, grid)
            newGrid.pixels[off] = new_color[0]
            newGrid.pixels[off+1] = new_color[1] 
            newGrid.pixels[off+2] = new_color[2]
            // grid.set(w, h, color(getMajorityColor(w, h, grid)))
        }
    }
    newGrid.updatePixels()
    return newGrid;
}

function getNextColor(palette, index){
    // console.log(index)
    if (index < palette.length - 1) {
        return palette[index + 1];
    } else {
        return palette[0]; // Return null or throw an error if the next key does not exist
    }
}

function countNeighboursWithColor(x, y, grid, color) {
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
        let neighbour_color_string = ``
        if (nx<grid.width && ny<grid.height && nx >= 0 && ny >= 0) {
            let off = (ny * grid.width + nx) * 4;
            neighbour_color_string = `${grid.pixels[off]},${grid.pixels[off+1]},${grid.pixels[off+2]}`;;
        }
        else {
            neighbour_color_string = color_string;
        }
        if (neighbour_color_string == color_string){
            neighbouts_with_color+=1;
        }
    }

    return neighbouts_with_color;
}

// Update the grid based on majority color
function cellular_automata_multicolor_cicle(grid, palette, new_random_color_index) {
    // console.log(palette)
    let newGrid = grid.get();
    newGrid.loadPixels();
    grid.loadPixels();
    for (let h = 0; h < grid.height; h++) {
        for (let w = 0; w < grid.width; w++) {
            let off = (h * grid.height + w) * 4;
            const current_color = [newGrid.pixels[off],newGrid.pixels[off+1],newGrid.pixels[off+2]];
            let neighboursWithSameColor = countNeighboursWithColor(w, h, grid, current_color)
            let nextMajorityColor = getMajorityColor(w, h, grid)
            let neighboursWithNextColor = countNeighboursWithColor(w, h, grid, nextMajorityColor)

            let new_color = [255,0,0]
            if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
                new_color = current_color;
            }
            else if ((neighboursWithSameColor < 2  || neighboursWithNextColor == 3)){
                new_color = nextMajorityColor 
            }else if ((neighboursWithNextColor < 3 && neighboursWithSameColor == 5)){
                new_color = palette[new_random_color_index]
            } else {
                new_color = current_color;
            }
            // Working, good version
            // if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
            //     new_color = current_color;
            // }
            // else if ((neighboursWithSameColor < 2  || neighboursWithNextColor == 3)) {
            //     new_color = nextMajorityColor
            // } else {
            //     new_color = current_color;
            // }

            newGrid.pixels[off] = new_color[0]
            newGrid.pixels[off+1] = new_color[1] 
            newGrid.pixels[off+2] = new_color[2]
        }
    }
    newGrid.updatePixels()
    return newGrid;
} 

function load_cellular_automata_code(){
    ca_src = loadStrings('./lib/JSGenerativeArtTools/cellular_automata_shader.frag');
}

function initialize_cellular_automata_shader(){
  CAShader = createFilterShader(ca_src.join('\n'));
}

function cellular_automata_gpu(color_buffer){
    if (!enableCA){
        return color_buffer;
    }

    color_buffer.begin();
    if (cellular_automata_step < CAMaxSteps || CAMaxSteps ==-1) {
        for (let i = 0; i < CAPassesPerFrame; i++) {
            filter(CAShader)
        }
        cellular_automata_step+=1
    }
    color_buffer.end();

    return color_buffer;
}

function set_ca_initial_steps(new_initial_steps){
  const old_initial_steps = CellularAutomataInitialSteps;
  CellularAutomataInitialSteps = new_initial_steps;
  return old_initial_steps
}

function set_ca_max_steps(new_max_steps){
  const old_max_steps = CAMaxSteps;
  CAMaxSteps = new_max_steps;
  return old_max_steps
}

function set_ca_passes_per_frame(new_passes_per_frame){
  const old_passes_per_frame = CAPassesPerFrame;
  CAPassesPerFrame = new_passes_per_frame;
  return old_passes_per_frame
}

function set_ca_color_change_rate(new_change_rate){
    const old_change_rate = CARandomColorChangeRate;
    CARandomColorChangeRate = new_change_rate;
    return old_change_rate
}

function set_ca_color_change_rate_from_slider(new_color_change_rate){
  var inputElement = CAInputs.CARandomColorChangeRate
  var old_color_change_rate = inputElement.value
  inputElement.value = new_color_change_rate

  // Propagate change to slider and value by manualy triggering on change
  var event = new Event('input');
  inputElement.dispatchEvent(event);
  return old_color_change_rate
}

function disable_ca_color_change_rate(){
  var inputElement = CAInputs.CARandomColorChangeRate
  inputElement.linkedDisabled = !inputElement.disabled

  // Propagate change to slider and value by manualy triggering on change
  var event = new Event('input');
  inputElement.dispatchEvent(event);
}

function set_ca_passes_per_frame_from_slider(new_passes_per_frame){
  var inputElement = CAInputs.CAPassesPerFrame
  var old_passes_per_frame = inputElement.value
  inputElement.value = new_passes_per_frame

  // Propagate change to slider and value by manualy triggering on change
  var event = new Event('input');
  inputElement.dispatchEvent(event);
  return old_passes_per_frame
}

function disable_ca_passes_per_frame(enable){
  var inputElement = CAInputs.CAPassesPerFrame
  inputElement.linkedDisabled = enable;

  // Propagate change to slider and value by manualy triggering on change
  var event = new Event('input');
  inputElement.dispatchEvent(event);
}


function set_ca_new_random_color(new_random_color){
    CAShader.setUniform('next_random_color', new_random_color);
}

function reset_ca_steps(){
  cellular_automata_step = 0;
}

function get_CARandomColorChangeRate(){
    return CARandomColorChangeRate
}

function get_CellularAutomataInitialSteps(){
    return CellularAutomataInitialSteps
}

function setEnableCA(enable) {
    enableCA = enable;
    if (enableCA) {
        console.log('Enabling CA');
    } else {
        console.log('Disabling CA');
    }
}

function createCASettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('cellularAutomataSettings', 'Cellular Automata');
    const cardBody = card.getElementsByClassName('collapse-content')[0];

    // Enable Disable Button
    const enableCAButton = createToggleButton('Enable', (a) => {
            setEnableCA(a.target.checked);
        },
        defaultCAEnabled,
    );
    elements_dict['CAEnable'] = enableCAButton.getElementsByTagName('button')[0];

    // Add input fields and labels
    const initialSteps = create_number_input_slider_and_number(
        'CAInitialSteps',
        'Initial Steps',
        defaultCellularAutomataInitialSteps,
        0,
        150,
        set_ca_initial_steps,
    );
    elements_dict['CAInitialSteps'] = initialSteps.getElementsByTagName('input')[0];
    
    const maxSteps = create_number_input_slider_and_number(
        'CAMaxSteps',
        'Total Steps',
        defaultCAMaxSteps,
        -1,
        1000,
        set_ca_max_steps,
    );
    elements_dict['CAMaxSteps'] = maxSteps.getElementsByTagName('input')[0];

    const passesPerFrame = create_number_input_slider_and_number(
        'passesPerFrame',
        'Passes per Frame',
        defaultCAPassesPerFrame,
        0,
        5,
        set_ca_passes_per_frame,
    );
    elements_dict['CAPassesPerFrame'] = passesPerFrame.getElementsByTagName('input')[0];

    const randomColor = create_number_input_slider_and_number(
        'CARandomColorChangeRate',
        'Random Color Change Rate',
        defaultRandomColorChangeRate,
        0,
        100,
        set_ca_color_change_rate,
    );
    elements_dict['CARandomColorChangeRate'] = randomColor.getElementsByTagName('input')[0];

    cardBody.appendChild(enableCAButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(initialSteps);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(maxSteps);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(passesPerFrame);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(randomColor);

    elements_dict['main-toolbar'] = card;
  
    CAInputs = elements_dict

    return elements_dict;
}

function update_all_ca_parametters(){
    CARandomColorChangeRate = parseInt(CAInputs['CARandomColorChangeRate'].value)
    CAMaxSteps = parseInt(CAInputs['CAMaxSteps'].value)
    CAPassesPerFrame = parseInt(CAInputs['CAPassesPerFrame'].value)
    CellularAutomataInitialSteps = parseInt(CAInputs['CAInitialSteps'].value)
}

export {
    cellular_automata_multicolor_cicle,
    cellular_automata,
    load_cellular_automata_code,
    initialize_cellular_automata_shader,
    cellular_automata_gpu,
    set_ca_new_random_color,
    set_ca_max_steps,
    get_CARandomColorChangeRate,
    get_CellularAutomataInitialSteps,
    createCASettingsCard,
    update_all_ca_parametters,
    reset_ca_steps,
    set_ca_color_change_rate_from_slider,
    disable_ca_color_change_rate,
    set_ca_passes_per_frame_from_slider,
    disable_ca_passes_per_frame,
}
