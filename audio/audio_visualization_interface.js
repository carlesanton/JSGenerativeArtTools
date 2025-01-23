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

  setupVisualizations() {
    let yTop = this.topLeftCorner.y;
    let yHeight = this.bottomRightCorner.y - this.topLeftCorner.y;
    let xWidth = this.bottomRightCorner.x - this.topLeftCorner.x;
    let scrollingWaveform = new soundvis.ScrollingWaveform(
      this.topLeftCorner.x, yTop, parseInt(2 * xWidth / 3), yHeight / 3, 
      this.backgroundColor, this.options.showLengthInSeconds, this.beatDetectLevel,
      this.options.levelMappingMethod, this.options.levelScale,
    );

    let beatDetectorVisualizer = new soundvis.BeatDetectorVisualizer(
      this.topLeftCorner.x + parseInt(2 * xWidth / 3), yTop, parseInt(1 * xWidth / 3), yHeight / 3, 
      this.backgroundColor, this.beatDetectLevel,
      this.options.levelMappingMethod, this.options.levelScale,
    );

    yTop = scrollingWaveform.getBottom();
    let scrollingSpectrogram = new soundvis.Spectrogram(
      this.topLeftCorner.x, yTop, parseInt(2 * xWidth / 3), yHeight / 3, 
      this.backgroundColor, this.options.showLengthInSeconds, this.beatDetectLevel,
    );

    let xBottomWidth = xWidth / 3;
    let xBottom = this.topLeftCorner.x;

    let lengthOfOneWaveformBufferInSecs = this.options.numFftBins / this.options.sampleRate;
    yTop = scrollingSpectrogram.getBottom();
    let instantWaveFormVis = new soundvis.InstantWaveformVis(
      xBottom, yTop, xBottomWidth, yHeight / 3, 
      this.backgroundColor, lengthOfOneWaveformBufferInSecs, this.beatDetectLevel,
      this.options.levelMappingMethod, this.options.levelScale,
    );
    xBottom += xBottomWidth;
    let spectrumVis = new soundvis.SpectrumVisualizer(
      xBottom, yTop, xBottomWidth, yHeight / 3, 
      this.backgroundColor
    );
    xBottom += xBottomWidth;
    let spectrumBarGraph = new soundvis.SpectrumBarGraph(
      xBottom, yTop, xBottomWidth, yHeight / 3, 
      this.backgroundColor
    );

    this.visualizations['scrollingWaveform'] = scrollingWaveform;
    this.visualizations['beatDetectorVisualizer'] = beatDetectorVisualizer;
    this.visualizations['scrollingSpectrogram'] = scrollingSpectrogram;
    this.visualizations['instantWaveFormVis'] = instantWaveFormVis;
    this.visualizations['spectrumVis'] = spectrumVis;
    this.visualizations['spectrumBarGraph'] = spectrumBarGraph;

    this.applyColorScheme();
  }

  applyColorScheme() {
    let colorSchemes = Object.entries(soundvis.COLORSCHEME);
    if (this.options.colorSchemeIndex >= colorSchemes.length) {
      this.options.colorSchemeIndex = 0;
    }
    for (const [key, vis] of Object.entries(this.visualizations)) {
      if (vis.colorScheme) {
        let colorSchemeArray = colorSchemes[this.options.colorSchemeIndex];
        vis.colorScheme = colorSchemeArray[1];
      }
    }
  }

  update() {
    let waveform = this.fft.waveform(); 
    let spectrum = this.fft.analyze();
    let volLevel = this.mic.getLevel(this.options.smoothFactor)

    for (const [key, vis] of Object.entries(this.visualizations)) {
      if (vis.update) {
        if (Object.hasOwn(vis, 'spectrum')){
          vis.update(spectrum);
        }
        else if (Object.hasOwn(vis, 'waveform')){
          vis.update(waveform);
        }
        else if (Object.hasOwn(vis, 'volLevel')){
          vis.update(volLevel)
        }
      }
    }
  }

  draw() {
    // background(this.backgroundColor);

    for (const [key, vis] of Object.entries(this.visualizations)) {
      vis.draw();
    }

    fill(255);
  //   text("fps: " + nfc(frameRate(), 1), 6, 15);
  }

  start() {
    this.mic.start();
    if (this.options.playSong && this.options.song) {
      this.options.song.play();
      this.fft.setInput(this.options.song);
    }
  }

  stop() {
    this.mic.stop();
    if (this.options.playSong && this.options.song) {
      this.options.song.stop();
    }
  }

  changeColorScheme() {
    this.options.colorSchemeIndex++;
    this.applyColorScheme();
  }

}

export {
    AudioVisualizationModule
}
