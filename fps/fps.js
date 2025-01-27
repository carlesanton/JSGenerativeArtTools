export class FPS{
    static defaultFPS = 15;
    static defaultDisplayFPS = false;
    static numberOfAverageFPS = 10;

    constructor(){
        this.fps = FPS.defaultFPS;
        this.averageFPS = this.fps; // There is a difference between the desired FPS and actual FPS
                                   // mainly if the program cannot go faster or it reaches the display refresh rate
        this.lastFPS = []
        this.show = FPS.defaultDisplayFPS;
        this.FPSInputs = {};
        this.lastFrameTime = 0;
        this.setFPS(this.fps);
    }

    calculateFPS(currentTime) {
        let elapsedTime = currentTime - this.lastFrameTime; // Calculate the time elapsed since the last frame in ms
    
        let fps = 1000/elapsedTime; // Calculate the FPS (1000 because we are dividing elapsedTime by 1000)
        this.lastFrameTime = currentTime; // Update the time of the last frame
    
        return fps;
    }

    displayFPS(x, y, inputFps) {
        let fps = this.fps
        if (inputFps !== undefined && inputFps !== null) { // inputFps to display another FPS other than the one in the instance
            fps = inputFps;
        }
        let roundedFps = parseInt(fps.toFixed(2));
        let fps_string = 'FPS: ' + roundedFps
        let leftMargin = 30
        let topMargin = 50

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

        textSize(32);
        x -= (fpsTextWidth + leftMargin)
        y += topMargin

        text(fps_string, x, y); // Adjust the y-coordinate as needed

        this.lastDisplayX = x;
        this.lastDisplayY = y;
    }

}
