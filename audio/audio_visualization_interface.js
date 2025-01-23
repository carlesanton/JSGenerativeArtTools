import * as soundvis from './soundvis.js'

class AudioVisualizationModule {
  constructor(audioInput, topLeftCorner, bottomRightCorner, beatDetectLevel, options = {}) {
    this.audioInput = audioInput;
    this.topLeftCorner = topLeftCorner;
    this.bottomRightCorner = bottomRightCorner;
    this.beatDetectLevel = beatDetectLevel;
    this.options = Object.assign({
      numFftBins: 1024,
      showLengthInSeconds: 2,
      // showLengthInSeconds: 10,
      // showLengthInSeconds: 15,
      colorSchemeIndex: 0,
      backgroundColor: color(0,0,0,0),
      playSong: false,
      song: null,
      sampleRate: 44100,
      levelMappingMethod: (e) => {return e},
      levelScale: 1,
      smoothFactor: 0.0,
    }, options);

    this.mic = audioInput;
    this.fft = new p5.FFT(0, this.options.numFftBins);
    this.fft.setInput(this.mic);

    this.visualizations = {};

    this.backgroundColor = this.options.backgroundColor;

    this.setupVisualizations();
  }
}

export {
    AudioVisualizationModule
}
