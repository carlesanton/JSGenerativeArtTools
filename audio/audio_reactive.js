export class AudioReactive {
  static defaultAudioReactiveEnabled = false;
  static defaultDisplayVisualizationEnabled = true;
  static defaultBeatThreshold = 0.6;
  static defaultBeatDecayRate = 0.1;
  // static defaultBeatDecayRate = 0.02;
  static defaultLevelScale = 1;
  static level_scale = 1;
  static level_min_value = 0.001;
  static level_max_value = 1;
  static beatHoldFrames = 0;
  static smoothFactor = 0.7;
  static audioSourceIdx = 1;
  static LFPeakThreshold = 0.35;
  static MFPeakThreshold = 0.001;

  constructor() {
    this.audioReactiveEnabled = AudioReactive.defaultAudioReactiveEnabled;
    this.displayVisualizationEnabled = AudioReactive.defaultDisplayVisualizationEnabled;
    this.beatDetectLevel = AudioReactive.defaultBeatThreshold;
    this.beatCutoff = this.beatDetectLevel;
    this.beatDecayRate = AudioReactive.defaultBeatDecayRate;
    this.levelScale = AudioReactive.defaultLevelScale;
    this.framesSinceLastBeat = 0;
    this.audio = null;
    this.fft = null;
    this.LFpeakDetect = null;
    this.MFpeakDetect = null;
    this.onBeat = null;
    this.onLevelChange = null;
    this.onHMEnergyChange = null;
    this.onCentroidChange = null;
    this.onEnergyRatioChange = null;
    this.externalControllsDisableMethods = [];
    this.audioVisualizationModule = null;
    this.beatDetected = false;
  }

  initializeAudio() {
    this.audio = new p5.AudioIn();
    console.log('Available input sources:')
    this.audio.getSources().then((sources) => {
      sources.forEach(function(device) {
          console.log(device.kind + ": " + device.label);
          });
      let audioSourceIdx = AudioReactive.audioSourceIdx;
      var audioSource = sources[audioSourceIdx];
      if (audioSource){
          console.log('Connecting to audio source number ', audioSourceIdx, ' with name', audioSource.label);
          this.audio.setSource(audioSourceIdx)
      }
      else {
          console.log('No Audio Source with index', audioSourceIdx)
      }
    })
    
    this.fft = new p5.FFT(0, 512);
    this.audio.start();
    this.fft.setInput(this.audio);
    this.LFpeakDetect = new p5.PeakDetect(200, 1000, AudioReactive.LFPeakThreshold);
    this.MFpeakDetect = new p5.PeakDetect(4000, 6000, AudioReactive.MFPeakThreshold);

    this.audioVisualizationModule = new AudioVisualizationModule(
      this.audio,
      {x:0, y:0}, {x:640, y:360},
      this.beatDetectLevel,
      {
        levelMappingMethod: this.mapLevel,
        levelScale: this.levelScale,
        smoothFactor: AudioReactive.smoothFactor,
        colorSchemeIndex: 0,
      },
    )
  }

  getSpectrum(){
    return this.fft.analyze();
  }

  setLFonPeakCallback(onPeakCallback){
    this.LFpeakDetect.onPeak(onPeakCallback);
  }

  detectLFPeak(){
    this.LFpeakDetect.update(this.fft);
    return this.LFpeakDetect.isDetected;
  }

  setMFonPeakCallback(onPeakCallback){
    this.MFpeakDetect.onPeak(onPeakCallback);
  }

  detectMFPeak(){
    this.MFpeakDetect.update(this.fft);
    return this.MFpeakDetect.isDetected;
  }

  getCentroid(){
    const centroid = this.fft.getCentroid();
    if (this.onCentroidChange !== undefined && this.onCentroidChange !== null) {
      this.onCentroidChange(centroid);
    }
    return centroid;
  }

  setOnCentroidChange(callback){
    this.onCentroidChange = callback;
  }

  getAudioLevel(){
    var audioLevel = parseFloat(this.audio.getLevel(AudioReactive.smoothFactor))
    if (this.onLevelChange !== undefined && this.onLevelChange !== null) {
        this.onLevelChange(audioLevel);
    }
    return audioLevel;
  }

  setOnLevelChangeCallback(callback){
    this.onLevelChange = callback;
  }

  getLMEnergy(){
    this.fft.analyze();
    return this.fft.getEnergy('lowMid');
  }

  getHMEnergy(){
    this.fft.analyze();
    const energy = this.fft.getEnergy('treble');
    if (this.onHMEnergyChange !== undefined && this.onHMEnergyChange !== null) {
      this.onHMEnergyChange(energy);
    }
    return energy;
  }

  setOnHMEnergyChangeCallback(callback){
    this.onHMEnergyChange = callback;
  }

  getEnergyRatio(){
    this.fft.analyze();
    const hm_energy = this.fft.getEnergy('highMid');
    const low_energy = this.fft.getEnergy('bass');
    const energy_ratio = hm_energy / low_energy;
    if (this.onEnergyRatioChange !== undefined && this.onEnergyRatioChange !== null) {
      this.onEnergyRatioChange(energy_ratio);
    }
    return energy_ratio;
  }

  setOnEnergyRatioChangeCallback(callback){
    this.onEnergyRatioChange = callback;
  }

  setOnBeatCallback(onBeatCallback){
    this.onBeat = onBeatCallback;
  }

  setBeatDetectLevel(beatDetectLevel){
    this.beatDetectLevel = beatDetectLevel;
    this.audioVisualizationModule.setBeatDetectLevel(beatDetectLevel)
  }

  setBeatDecayRate(beatDecayRate){
    this.beatDecayRate = beatDecayRate;
  }

  setLevelScale(levelScale){
    this.levelScale = levelScale;
    this.audioVisualizationModule.setLevelScale(this.levelScale)
  }

  detectBeat(level) {
    let waveformMax = max(this.fft.waveform())
    level = waveformMax;
    level = this.mapLevel(level, this.levelScale);
    if (level > this.beatCutoff && level > this.beatDetectLevel) {
      this.onBeat();
      this.beatCutoff = level * 1.2;
      this.framesSinceLastBeat = 0;
    } else {
      if (this.framesSinceLastBeat <= AudioReactive.beatHoldFrames) {
        this.framesSinceLastBeat++;
      } else {
        this.beatCutoff *= (1 - this.beatDecayRate);
        this.beatCutoff = Math.max(this.beatCutoff, this.beatDetectLevel);
      }
    }

    // Set beatDetected
    this.beatDetected = this.beatCutoff > this.beatDetectLevel ? true: false;

    // Send beat cutoff and beatDetected to audio visualization
    this.audioVisualizationModule.setBeatDetectLevel(this.beatCutoff)
    this.audioVisualizationModule.setBeatDetected(this.beatDetected)

  }

  mapLevel(level, levelScale) {
    level = levelScale * level;
    let sign = 1;
    if (level<0){
      sign = -1;
    }
    return level;
  }

  toggleEnableAudio() {
    this.audioReactiveEnabled = !this.audioReactiveEnabled;
    if (this.audioReactiveEnabled) {
      console.log('Enabling audio');
      this.AudioInputs['AudioEnable'].textContent = 'Disable';
    } else {
      console.log('Disabling audio');
      this.AudioInputs['AudioEnable'].textContent = 'Enable';
    }
  }

  isAudioEnabled() {
    return this.audioReactiveEnabled;
  }

  toggleDisplayVisualization() {
    this.displayVisualizationEnabled = !this.displayVisualizationEnabled;
    if (this.displayVisualizationEnabled) {
      console.log('Showing Sound Visualization');
      this.AudioInputs['VisualizationEnable'].textContent = 'Hide Visualization';
    } else {
      console.log('Hiding Sound Visualization');
      this.AudioInputs['VisualizationEnable'].textContent = 'Show Visualization';
    }
  }

  isDisplayVisualizationEnabled() {
    return this.displayVisualizationEnabled;
  }


  addControllToTakeOver(controllToTakeOver){
    this.externalControllsDisableMethods.push(controllToTakeOver)
  }

  takeOverControlls(){
    this.externalControllsDisableMethods.forEach(method => {
      method();
    });    
  }

}
