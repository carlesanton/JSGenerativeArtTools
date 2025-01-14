// what amplitude level can trigger a beat?
// var beatThreshold = 0.11; 
var beatThreshold = 0.6;

// Vars for beat detection and PS Speed mapping
export var level_scale = 1;
export var level_min_value = 0.001;
export var level_max_value = 0.05;

// When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
// Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
var beatCutoff = 0;
var beatDecayRate = 0.98; // how fast does beat cutoff decay?
var framesSinceLastBeat = 0; // once this equals beatHoldFrames, beatCutoff starts to decay.
var beatHoldFrames = 0;
// var beatHoldFrames = 30;

let smoothFactor = 0.7;
let audio;
let fft;
let LFpeakDetect;
let LFPeakThreshold = 0.35;

let MFpeakDetect;
let MFPeakThreshold = 0.001;

let audioSourceIdx = 1;

// Initialize Dummy functions
let onBeat = function (){
    console.log('Beat detected')
}
let onLevelChange;
let onHMEnergyChange;
let onCentroidChange;
let onEnergyRatioChange;

function initializeAudio(){
    // Create an Audio input
    audio = new p5.AudioIn();
    fft = new p5.FFT(0, 512);

    if (audioSourceIdx != 0){
        // List available inputs
        audio.getSources().then((sources) => {
            console.log('Available input sources:')
            sources.forEach(function(device) {
                console.log(device.kind + ": " + device.label);
                });
            var audioSource = sources[audioSourceIdx];
            if (audioSource){
                console.log('Connecting to audio source number ', audioSourceIdx, ' with name', audioSource.label);
                audio.setSource(audioSourceIdx)
            }
            else {
                console.log('No Audio Source with index', audioSourceIdx)
            }
        })
    }
    
    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    audio.start();
    userStartAudio();

    fft.setInput(audio)
    LFpeakDetect = new p5.PeakDetect(200,1000, LFPeakThreshold);
    MFpeakDetect = new p5.PeakDetect(4000,6000, MFPeakThreshold);
}

function getAudioInput(){
    return audio;
}

function getSpectrum(){
    var spectrum = fft.analyze()
    return spectrum;
}

function setLFonPeakCallback(onPeakCallback){
    LFpeakDetect.onPeak(onPeakCallback)
}

function detectLFPeak(){
    LFpeakDetect.update(fft);
    return LFpeakDetect.isDetected
}

function setMFonPeakCallback(onPeakCallback){
    MFpeakDetect.onPeak(onPeakCallback)
}

function detectMFPeak(){
    MFpeakDetect.update(fft);
    return MFpeakDetect.isDetected
}

function getCentroid(){
    var centroid = fft.getCentroid()
    if (onCentroidChange !== undefined && onCentroidChange !== null) {
        onCentroidChange(centroid);
    }
    return centroid
}

function setOnCentroidChange(callback){
    onCentroidChange = callback;
}

function getAudioLevel(){
    var audioLevel = parseFloat(audio.getLevel(smoothFactor))
    if (onLevelChange !== undefined && onLevelChange !== null) {
        onLevelChange(audioLevel);
    }
    return audioLevel;
}

function setOnLevelChangeCallback(callback){
    onLevelChange = callback;
}

function getLMEnergy(){
    fft.analyze()
    var energy = fft.getEnergy('lowMid')
    return energy
}

function getHMEnergy(){
    fft.analyze()
    var energy = fft.getEnergy('treble')
    if (onHMEnergyChange !== undefined && onHMEnergyChange !== null) {
        onHMEnergyChange(energy);
    }
    return energy
}

function setOnHMEnergyChangeCallback(callback){
    onHMEnergyChange = callback;
}

function getEnergyRatio(){
    fft.analyze()
    var hm_energy = fft.getEnergy('highMid')
    var low_energy = fft.getEnergy('bass')
    var energy_ratio = hm_energy/low_energy;
    if (onEnergyRatioChange !== undefined && onEnergyRatioChange !== null) {
        onEnergyRatioChange(energy_ratio);
    }
    return energy_ratio
}

function setOnEnergyRatioChangeCallback(callback){
    onEnergyRatioChange = callback;
}

function setOnBeatCallback(onBeatCallback){
    onBeat = onBeatCallback;
}

function detectBeat(level) {
    level = map(level, 0, 0.1, 0, 1)
    level = level_scale * level;
    level = map(level, level_min_value, level_max_value, 1, 2.8)
    level = constrain(level, 1, 2.8)
    level = log(level)
    level = constrain(level, 0, 1)

    if (level  > beatCutoff && level > beatThreshold){
        onBeat();
        beatCutoff = level *1.2;
        framesSinceLastBeat = 0;
    } else{
        if (framesSinceLastBeat <= beatHoldFrames){
            framesSinceLastBeat ++;
        }
        else{
            beatCutoff *= beatDecayRate;
            beatCutoff = Math.max(beatCutoff, beatThreshold);
        }
    }
}

export {
    initializeAudio,
    getAudioInput,
    getAudioLevel,
    getSpectrum,
    detectBeat,
    setOnBeatCallback,
    setOnLevelChangeCallback,
    getCentroid,
    setOnCentroidChange,
    detectLFPeak,
    setLFonPeakCallback,
    setMFonPeakCallback,
    detectMFPeak,
    getLMEnergy,
    getHMEnergy,
    setOnHMEnergyChangeCallback,
    getEnergyRatio,
    setOnEnergyRatioChangeCallback,
}
