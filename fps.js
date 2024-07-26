let lastFrameTime = 0; // Global variable to store the time of the last frame

function calculateFPS(currentTime) {
    let elapsedTime = currentTime - lastFrameTime; // Calculate the time elapsed since the last frame in ms
  
    let fps = 1000/elapsedTime; // Calculate the FPS (1000 because we are dividing elapsedTime by 1000)
    lastFrameTime = currentTime; // Update the time of the last frame
  
  return fps;
}

function displayFPS(fps) {
    let roundedFps = parseFloat(fps.toFixed(2));
    let fps_string = 'FPS: ' + roundedFps

    // // Save the original text size
    let originalTextSize = textSize();

    // // Set the text size to a temporary value for accurate width calculation
    textSize(32);
    // Calculate the width of the FPS text
    let fpsTextWidth = textWidth(fps_string);

    // Restore the original text size
    textSize(originalTextSize);

    // Style the text with white color, black borders
    fill(255); // White fill color
    stroke(0); // Black stroke color
    strokeWeight(2); // Thickness of the border

    textSize(32);
    text(fps_string, width - fpsTextWidth - 30, 50); // Adjust the y-coordinate as needed
    // text(roundedFps.toString(), 10, 50);
}

export {
    calculateFPS,
    displayFPS,
}
