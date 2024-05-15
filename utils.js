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
  