
function sort_step(sorted){
    sorted.loadPixels();
    for (let w = 0; w < sorted.width; w += 1) {
      for (let h = 0; h < sorted.height; h += 1) {
        let colorOne = sorted.get(w, h); 
        let colorTwo = sorted.get(w+1, h) 
        if (hue(colorOne) < hue(colorTwo)) {
          if (hue(colorOne)<50){
            sorted.set(w, h, colorTwo); 
            sorted.set(w+1, h, colorOne);
          }
        }
      }
      sorted.updatePixels()
    }
    return sorted
  } 

function sort_step_random(sorted){
  // sorted = image.get()
  sorted.loadPixels();
  for(i = 0; i<iters_per_steps; i++){
    let w = random(sorted.width-1);
    let h = random(sorted.height);
    let colorOne = sorted.get(w, h);
    let colorTwo = sorted.get(w-1, h)
    if (brightness(colorOne) < brightness(colorTwo)) {
      if (brightness(colorOne)>35){
        sorted.set(w, h, colorTwo);
        sorted.set(w-1, h, colorOne);
      }
    }
  }
  sorted.updatePixels()
  return sorted
}
  