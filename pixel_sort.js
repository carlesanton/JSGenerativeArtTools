export let defaultPixelSortInitialSteps = 50; //50
export let defaultPixelSortMaxSteps = -1;
export let defaultPixelSortingPasses = 8;
export let defaultSortNoiseScale = 360
export let defaultNoiseDirectionChangeRate = 45;

function sort_step(sorted){
    sorted.loadPixels();
    for (let w = 0; w < sorted.width; w ++) {
      for (let h = 0; h < sorted.height; h ++) {
        let off1 = (h * sorted.width + w) * 4;
        let colorOne = [sorted.pixels[off1], sorted.pixels[off1 + 1], sorted.pixels[off1 + 2], 255];
        let off2 = ((h-0) * sorted.width + w-1) * 4;
        if (h==0 || w==0){
          off2 = off1
        }
        let colorTwo = [sorted.pixels[off2], sorted.pixels[off2 + 1], sorted.pixels[off2 + 2], 255];
        if (hue(colorOne) < hue(colorTwo)) {
          if (hue(colorOne)<50){
            sorted.pixels[off1] = colorTwo[0];
            sorted.pixels[off1+1] = colorTwo[1];
            sorted.pixels[off1+2] = colorTwo[2];
            sorted.pixels[off2] = colorOne[0];
            sorted.pixels[off2+1] = colorOne[1];
            sorted.pixels[off2+2] = colorOne[2];
          }
        }
      }
      sorted.updatePixels()
    }
    return sorted
  } 

function sort_step_random(sorted, n_iterations, direction = {x:1,y:0}){
  let sorted_img = sorted.get()
  sorted_img.loadPixels();
  for(let i = 0; i<n_iterations; i++){
    let w = Math.floor(random(sorted.width));
    let h = Math.floor(random(sorted.height));
    let off1 = (h * sorted.width + w) * 4;
    // console.log('w: ' + w + ' h: ' + h + ' off: ' +off)
    let colorOne = [sorted.pixels[off1], sorted.pixels[off1 + 1], sorted.pixels[off1 + 2], 255];
    let off2 = ((h-direction.y) * sorted.width + w+direction.x) * 4;
    if (h>=sorted.height || w>=sorted.width || w==0 || h==0){
      off2 = off1
    }
    let colorTwo = [sorted.pixels[off2], sorted.pixels[off2 + 1], sorted.pixels[off2 + 2], 255];
    if (brightness(colorOne) < brightness(colorTwo)) {
      // if (brightness(colorOne)>10){ 
        sorted.pixels[off1] = colorTwo[0];
        sorted.pixels[off1+1] = colorTwo[1];
        sorted.pixels[off1+2] = colorTwo[2];
        sorted.pixels[off2] = colorOne[0];
        sorted.pixels[off2+1] = colorOne[1];
        sorted.pixels[off2+2] = colorOne[2];
      // }
    }
  }
  sorted_img.updatePixels()
  return sorted
}

function angleToCoordinates(angleInDegrees, radius = 100) {
  // Normalize the angle to be between 0 and 360
  let normalizedAngle = ((angleInDegrees % 360) + 360) % 360;

  // Convert the angle to radians
  let angleInRadians = normalizedAngle * Math.PI / 180;

  // Calculate the x and y coordinates
  let x = radius * Math.cos(angleInRadians);
  let y = radius * Math.sin(angleInRadians);

  return { x: Math.round(x), y: Math.round(y) };
}

function createPixelSortingSettings() {
  var elements_dict = {};

  // Create Main Card
  const card = create_expandable_card('PixelSortingSettings', 'Pixel Sorting');
  const cardBody = card.getElementsByClassName('card-body')[0];

  // Add input fields and labels
  const initialSteps = create_number_input_text('PSinitialSteps', 'Initial Steps', defaultPixelSortInitialSteps);
  elements_dict['PSinitialSteps'] = initialSteps.getElementsByTagName('input')[0];

  const maxSteps = create_number_input_text('PSMaxSteps', 'Max Steps', defaultPixelSortMaxSteps);
  elements_dict['PSMaxSteps'] = maxSteps.getElementsByTagName('input')[0];

  const passesPerFrame = create_number_input_text('PSPassesPerFrame', 'Passes Per Frame', defaultPixelSortingPasses);
  elements_dict['PSPassesPerFrame'] = passesPerFrame.getElementsByTagName('input')[0];

  const noiseTitle = create_subtitle('Noise');

  const noiseScale = create_number_input_text('PSnoiseScale', 'Scale', defaultSortNoiseScale);
  elements_dict['PSnoiseScale'] = noiseScale.getElementsByTagName('input')[0];

  const noiseDirection = create_number_input_text('PSnoiseDirectionChangeRate', 'Direction Change Rate', defaultNoiseDirectionChangeRate);
  elements_dict['PSnoiseDirectionChangeRate'] = noiseDirection.getElementsByTagName('input')[0];

  cardBody.appendChild(initialSteps);
  cardBody.appendChild(document.createElement('br'));
  cardBody.appendChild(maxSteps);
  cardBody.appendChild(document.createElement('br'));
  cardBody.appendChild(passesPerFrame);
  cardBody.appendChild(document.createElement('br'));
  cardBody.appendChild(noiseTitle);
  cardBody.appendChild(document.createElement('br'));
  cardBody.appendChild(noiseScale);
  cardBody.appendChild(document.createElement('br'));
  cardBody.appendChild(noiseDirection);

  elements_dict['main-toolbar'] = card;

  return elements_dict;
}

export {
  sort_step,
  sort_step_random,
  angleToCoordinates,
  createPixelSortingSettings
}
