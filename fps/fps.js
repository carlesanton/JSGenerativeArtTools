import { create_daisyui_expandable_card, create_number_input_slider_and_number, createToggleButton } from '../ui.js';

export class FPS{
    static defaultFPS = 15;
    static defaultDisplayFPS = false;
    static numberOfAverageFPS = 10;
    static defaultFillColor = [255, 255, 255];

    constructor(){
        this.fps = FPS.defaultFPS;
        this.averageFPS = this.fps; // There is a difference between the desired FPS and actual FPS
                                   // mainly if the program cannot go faster or it reaches the display refresh rate
        this.fillColor = FPS.defaultFillColor;
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

        this.lastFPS.push(fps); // Add computed FPS to array of fps
        if (this.lastFPS.length > FPS.numberOfAverageFPS) { // loop around if needed
          this.lastFPS.shift();
        }

        this.averageFPS = this.computeAverageFPS();
    }

    computeAverageFPS(){
        return this.lastFPS.reduce((a, b) => a + b) / this.lastFPS.length;
    }

    isDisplayEnabled(){
        return this.show;
    }

    setFillColor(fillColor) {
      this.fillColor = fillColor;
    }

    displayFPS(x, y, inputFps) {
        let fps = this.averageFPS
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
        fill(this.fillColor); // fill color

        textSize(32);
        x -= (fpsTextWidth + leftMargin)
        y += topMargin

        text(fps_string, x, y); // Adjust the y-coordinate as needed

        this.lastDisplayX = x;
        this.lastDisplayY = y;
    }

    setFPS(newFPS){
        let fps = parseInt(newFPS);
        this.fps = fps;
        frameRate(this.fps);
    }

    getFPS() {
      return this.fps;
    }

    setDisplay(show) {
        this.show = show;
        if (this.show) {
          console.log('Displaying FPS');
        } else {
          console.log('Hiding FPS');
        }
    }

    createFPSSettingsCard() {
        const elements_dict = {};
    
        const card = create_daisyui_expandable_card('FPSSettings', 'FPS');
        const cardBody = card.getElementsByClassName('collapse-content')[0];
        
        const enableVisButton = createToggleButton('Display', (a) => {
          this.setDisplay(a.target.checked)
          },
          FPS.defaultDisplayFPS,
        );
        elements_dict['show'] = enableVisButton.getElementsByTagName('button')[0];
    
        const fps = create_number_input_slider_and_number(
          'FPS',
          'FPS',
          FPS.defaultFPS,
          1,
          300,
          (e) => {this.setFPS(e)},
        );
        elements_dict['fps'] = fps.getElementsByTagName('input')[0];
    
        cardBody.appendChild(enableVisButton);
        cardBody.appendChild(fps);
    
        elements_dict['main-toolbar'] = card;
    
        this.FPSInputs = elements_dict;
    
        return elements_dict;
      }
}
