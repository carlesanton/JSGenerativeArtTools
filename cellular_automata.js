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

function createCASettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_expandable_card('cellularAutomataSettings', 'Cellular Automata');
    const cardBody = card.getElementsByClassName('card-body')[0]

    // Add input fields and labels
    const initialSteps = create_number_input_text('CAInitialSteps', 'Initial Steps', defaultCellularAutomataInitialSteps);
    elements_dict['CAInitialSteps'] = initialSteps.getElementsByTagName('input')[0];
    
    const maxSteps = create_number_input_text('CAMaxSteps', 'Total Steps', defaultCAMaxSteps);
    elements_dict['CAMaxSteps'] = maxSteps.getElementsByTagName('input')[0];
        
    const randomColor = create_number_input_text('CARandomColorChangeRate', 'Random Color Change Rate', defaultRandomColorChangeRate);
    elements_dict['CARandomColorChangeRate'] = randomColor.getElementsByTagName('input')[0];

    cardBody.appendChild(initialSteps);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(maxSteps);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(randomColor);

    elements_dict['main-toolbar'] = card;
  
    return elements_dict;
}

export {
    cellular_automata_multicolor_cicle,
    cellular_automata,
    createCASettingsCard,
}
