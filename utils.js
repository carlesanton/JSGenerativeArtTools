function scaleCanvasToFit(canvas, artworkHeight, artworkWidth) {
  var canvas_parent_ref = "#"+canvas.parent().id
  var parent_element = select(canvas_parent_ref)

  let scaleFactor = Math.min(
    parent_element.width / artworkWidth,
    parent_element.height / artworkHeight
  );
  let scaledWidth_ = artworkWidth * scaleFactor;
  let scaledHeight_ = artworkHeight * scaleFactor;

  // Change only display style so its still the desired resolution for when saving
  canvas.style('width', scaledWidth_+'px');
  canvas.style('height', scaledHeight_+'px');
}

function prepareP5Js(artwork_seed) {
  let random_seed = artwork_seed
  if (random_seed == -1){
    random_seed = floor(random(10000000));
  }
  console.log('Using seed: ', random_seed)
  randomSeed(random_seed);
  noiseSeed(random_seed);

  return random_seed
}

export {
  scaleCanvasToFit,
  prepareP5Js,
}
