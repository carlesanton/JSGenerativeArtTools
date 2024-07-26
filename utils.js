function scaleCanvasToFit(artworkHeight, artworkWidth) {
  const artworkAspectRatio = artworkHeight / artworkWidth;
  const canvasElement = document.querySelector('#defaultCanvas0');

  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;

  // Landscape orientation
  if (innerHeight <= innerWidth * artworkAspectRatio) {
    canvasElement.style.height = '100%';
    canvasElement.style.width = 'auto';
  } else {
    canvasElement.style.width = '100%';
    canvasElement.style.height = 'auto';
  }
}

function prepareP5Js(artwork_seed) {
  let random_seed = artwork_seed
  if (random_seed == -1){
    random_seed = floor(random(10000000));
  }
  console.log('Using seed: ', random_seed)
  randomSeed(random_seed);
  noiseSeed(random_seed);
}

export {
  scaleCanvasToFit,
  prepareP5Js,
}
