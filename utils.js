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

const defaultPalette = [
    '#F87171', '#FB923C', '#FACC15', '#4ADE80', '#60A5FA', '#818CF8', '#A78BFA',
    '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#2563EB', '#4F46E5', '#7C3AED',
    '#991B1B', '#9A3412', '#854D0E', '#166534', '#1E40AF', '#3730A3', '#5B21B6',
    '#450A0A', '#431407', '#422006', '#052E16', '#172554', '#1E1B4B', '#2E1065',
    '#0F172A', '#111827', '#18181B', '#1C1917', '#F8FAFC', '#F9FAFB', '#FAF9F6',
];

function hexToGL(hex) {
    // Remove the '#' if it's there
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    
    // Convert to integers
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    
    // Return normalized 0.0 - 1.0 values
    return [r / 255, g / 255, b / 255];
}

export {
  scaleCanvasToFit,
  prepareP5Js,
  defaultPalette,
  hexToGL,
}
