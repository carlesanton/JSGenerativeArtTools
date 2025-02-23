import { 
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    createToggleButton,
    indentDiv,
    createRecordStopButton,
    createDropDownMenu,
  } from '../ui.js'

// Disable Default UI to create our own
P5Capture.setDefaultOptions({
    disableUi: true,
    quality: 1,
});

export class Recorder {
    static defaultFPS = 30;
    static defaultFormat = 'webm'
    static defaultRecordForSetDuration = false;
    static defaultDuration = 2;
    static defaultAutoSaveDuration = null;
    static defaultUseCustomFPS = false;
    static defaultSketchFPSMethod = () => {return frameRate()};
    static supportedFormats = ['webm', 'gif', 'png', 'jpg', 'webp'];

    constructor () {
        this.recorderInputs = null;
        this.recorder = P5Capture.getInstance();
        
        // defaults
        this.fps = Recorder.defaultFPS;
        this.customFPS = this.fps;
        this.recordForSetDuration = Recorder.defaultRecordForSetDuration;
        this.duration = Recorder.defaultDuration;
        this.useCustomFPS = Recorder.defaultUseCustomFPS;
        this.format = Recorder.defaultFormat;
        this.sketchFPSMethod = Recorder.defaultSketchFPSMethod;
    }

    setRecord(record){
        if (record) {
            this.fps = this.getSketchFPS();
            const fps = this.useCustomFPS ? this.customFPS: this.fps;

            let duration = this.recordForSetDuration ? this.duration : null;
            duration *= fps;

            console.log('Recording:')
            console.log('   FPS:', fps)
            console.log('   format:', this.format)
            console.log('   duration (frames):', duration)
            console.log('   quality:', this.quality)

            this.recorder.start(
                {
                    duration: duration,
                    quality: this.quality,
                    framerate: fps,
                    format: this.format,
                    baseFilename: (a) => {return this.customBaseFilename(a)},
                }
            )
        }
        else {
            this.recorder.stop()
        }

    }

    setUseCustomFPS (value) {
        this.useCustomFPS = value;
        const fpsSlider = this.recorderInputs['fpsDiv']

        if (!this.useCustomFPS) {
            console.log('Record: Using same FPS as main artwork');
            fpsSlider.style.display = "none";
        } else {
            console.log('Record: Not using same FPS as main artwork');
            fpsSlider.style.display = "";
        }
    }
    
    setFPS(fps) {
        this.fps = parseInt(fps);
    }

    setCustomFPS(fps) {
        this.customFPS = parseInt(fps);
    }

    getSketchFPS() {
        let fps = this.fps;
        if (this.sketchFPSMethod !== undefined && this.sketchFPSMethod !== null){ // check if we have a method
            fps = parseInt(this.sketchFPSMethod());
        }
        else {
            console.log('Recorder: sketchFPSMethod not defined, using previous fps')
        }
        return fps;
    }

    setSketchFPSMethod(method) {
        // Set the method used to compute the sketch fps
        // by default its frameRate() but can be set to something like () => {return fps.getFPS()}
        // in the main sketch to more acurately set the fps to the same ones set by the fps module
        this.sketchFPSMethod = method;
    }

    setQuality(quality) {
        this.quality = parseFloat(quality);
        this.recorder.quality = this.quality;
    }

    setRecordForSetDuration (value) {
        this.recordForSetDuration = value;
        const durationSlider = this.recorderInputs['durationDiv']

        if (!this.recordForSetDuration) {
            console.log('Record: Recording Forever');
            durationSlider.style.display = "none";
        } else {
            console.log('Record: Recording for set duration');
            durationSlider.style.display = "";
        }
    }
    
    setDuration(duration) {
        this.duration = duration;
        this.recorder.duration = this.duration;
    }

    getProgress() {
        let progress = this.recorder.recorder?.count;
        if (!progress) {
            progress = 0;
        }
        return progress;
    }

    framesToMSM(frames) {
        // Use right fps
        const fps = this.useCustomFPS ? this.customFPS: this.fps;

        // Calculate total milliseconds
        const totalMilliseconds = (frames / fps) * 1000;
        
        // Extract minutes, seconds, and milliseconds
        const minutes = Math.floor(totalMilliseconds / 60000);
        const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
        let milliseconds = ((totalMilliseconds % 60000) / 1000) - seconds;
        milliseconds = parseFloat(milliseconds.toFixed(2).toString().split('.')[1]);

        // Format numbers with leading zeros
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    }

    setFormat(format) {
        console.log('Recorder.supportedFormats.includes(format)', Recorder.supportedFormats)
        if (Recorder.supportedFormats.includes(format)) {
            this.format = format;
            console.log('Format set to:', format);
            return true;
        }
        else {
            console.log('Unsupported format:', format);
            return false;
        }
    }

    updateUITimmer() {
        const uiTimmer = this.recorderInputs['timerText'];
        const currentProgress = this.getProgress();
        const currentTimer = this.framesToMSM(currentProgress);

        // console.log('currentTimer', currentTimer)
        uiTimmer.textContent = currentTimer;
    }

    defaultBaseFilename(date) {
        // From https://github.com/tapioca24/p5.capture?tab=readme-ov-file#base-filename-option
        const zeroPadding = (n) => n.toString().padStart(2, "0");
        const years = date.getFullYear();
        const months = zeroPadding(date.getMonth() + 1);
        const days = zeroPadding(date.getDate());
        const hours = zeroPadding(date.getHours());
        const minutes = zeroPadding(date.getMinutes());
        const seconds = zeroPadding(date.getSeconds());
        return `${years}${months}${days}-${hours}${minutes}${seconds}`;
    }

    customBaseFilename(date) {
        const defaultFilename = this.defaultBaseFilename(date);
        let filename = defaultFilename ; 
        if (this.sufix !== undefined && this.sufix !== null) { // add sufix to end of filename
            filename+= '-' + this.sufix;
        }

        return filename;
    }

    setFilenameSufix(sufix) {
        this.sufix = sufix
    }

    createSettingsCard() {
        const elements_dict = {};
        
        // Create Main Card
        const card = create_daisyui_expandable_card('recorderSettings', 'Record Video');
        const cardBody = card.getElementsByClassName('collapse-content')[0];

        // Record/Stop Button
        const recordButton = createRecordStopButton(
            this.framesToMSM(0),
            (a) => {
                this.setRecord(a);
            }
        );
        elements_dict['record'] = recordButton.getElementsByTagName('button')[0];
        elements_dict['timerText'] = recordButton.getElementsByTagName('text')[0];

        // Format
        const formatMenu = createDropDownMenu(
            'format',
            Recorder.supportedFormats,
            Recorder.defaultFormat,
            (a) => {return this.setFormat(a)},
            'Format',
        )
        elements_dict['formatMenu'] = formatMenu.getElementsByTagName('button')[0];

        // FPS
        const sameFPSButton = createToggleButton('Same FPS as Artwork', (a) => {
            this.setUseCustomFPS(!a.target.checked);
        }, !this.useCustomFPS);
        elements_dict['sameFPSButton'] = sameFPSButton.getElementsByTagName('button')[0];

        const fps = create_number_input_slider_and_number(
            'FPS',
            'FPS',
            Recorder.defaultFPS,
            1,
            300,
            (e) => {this.setCustomFPS(e)},
        );

        indentDiv(fps, '30px');
        fps.style.display =  "" ? this.useCustomFPS: "none"; // Hide at first if must be hiden
        elements_dict['fpsInput'] = fps.getElementsByTagName('input')[0];
        elements_dict['fpsDiv'] = fps;

        // Duration
        const recordForSetDuration = createToggleButton('Record For Set Duration', (a) => {
            this.setRecordForSetDuration(a.target.checked);
        }, this.recordForSetDuration);
        elements_dict['sameFPSButton'] = sameFPSButton.getElementsByTagName('button')[0];
        
        const duration = create_number_input_slider_and_number(
            'Duration',
            'Duration (s)',
            this.duration,
            1,
            300,
            (e) => {this.setDuration(e)},
        );

        indentDiv(duration, '30px');
        duration.style.display =  "" ? this.recordForSetDuration: "none"; // Hide at first if must be hiden
        elements_dict['durationInput'] = duration.getElementsByTagName('input')[0];
        elements_dict['durationDiv'] = duration;

        const quality = create_number_input_slider_and_number(
            'recordQuality',
            'Quality',
            Recorder.defaultQuality,
            0.,
            1.,
            (e) => {this.setQuality(e)},
            0.05,
        );
        elements_dict['quality'] = quality.getElementsByTagName('input')[0];

        cardBody.appendChild(recordButton);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(formatMenu);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(recordForSetDuration);
        cardBody.appendChild(duration);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(sameFPSButton);
        cardBody.appendChild(fps);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(quality);

        elements_dict['main-toolbar'] = card;
        this.recorderInputs = elements_dict;

        // Update Timmer every 10 milliseconds (0.1 second)
        this.updateUITask = setInterval(() => {
            this.updateUITimmer();
        }, 10);

        return elements_dict;
    }
}
