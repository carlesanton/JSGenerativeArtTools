import { 
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    create_subtitle,
    createSmallBreak,
    create_expandable_subtitle,
    create_input_file_button,
  } from '../ui.js'
  
  export class PixelCam {
    static defaultPixelSize = 9;
    static defaultBGOpacity = 0.;
    static defaultColorLevels = 14;
    static defaultCellSize = 400;
    static defaultGridSideSize = null;
    static defaultASCIIString = '';
    static defaultUseCustomSymbols = true;
    static defaultNumberOfFrames = 4;

    constructor() {
        this.PCShader = null;
        this.PCInputs = null;

        // Initialize with defaults
        this.pixelSize = PixelCam.defaultPixelSize;
        this.colorLevels = PixelCam.defaultColorLevels;
        this.cellSize = PixelCam.defaultCellSize;
        this.gridSideSize = PixelCam.defaultGridSideSize;
        this.ASCIIString = PixelCam.defaultASCIIString;
        this.asciiTexture = null;
        this.spritesheets = null;
        this.spritesheets_atlas = null;
        this.frame_count = 0;
        this.frameGridSideSize = null;
        this.numberOfFrames = PixelCam.defaultNumberOfFrames;
        this.bgOpacity = PixelCam.defaultBGOpacity
        this.useCustomSymbols = PixelCam.defaultUseCustomSymbols;

        // Load Shader Code
        this.loadShaderCode();
    }
  
    loadShaderCode() {
        this.pc_src = loadStrings('./lib/JSGenerativeArtTools/pixelCam/pixel_cam_shader.frag');
    }

    initializeShader() {
        this.PCShader = createFilterShader(this.pc_src.join('\n'));

        this.PCShader.setUniform('pixel_size', this.pixelSize);
        this.PCShader.setUniform('bg_opacity', this.bgOpacity);
        this.PCShader.setUniform('color_levels', this.colorLevels);
        this.PCShader.setUniform('grid_side_size', this.gridSideSize);
    }
  
    pixelCamGPU(color_buffer) {
        this.PCShader.setUniform('ascii_texture', this.asciiTexture);
        this.PCShader.setUniform('spritesheets_atlas_texture', this.spritesheets_atlas);
        this.PCShader.setUniform('frame_count', this.frame_count);

        color_buffer.begin();

        filter(this.PCShader);

        color_buffer.end();
        return color_buffer;
    }

    setSingleSpritesheet(new_spritesheet, new_index) {
        this.spritesheets[new_index]['img'] = new_spritesheet;
        this.useSpritesheets(this.spritesheets)
        // this.updateUISymbols()
    }

    reorderSpritesheets(oldIndex, newIndex) {
        const movedItem = this.spritesheets.splice(oldIndex, 1)[0];
        this.spritesheets.splice(newIndex, 0, movedItem);

        this.useSpritesheets(this.spritesheets)
    }

    useSpritesheets(spritesheets) {
        var mm_ = millis()
        this.spritesheets = spritesheets;

        // Set color levels and grid size
        let colorLevels = Object.keys(this.spritesheets).length;
        this.setColorLevels(colorLevels);

        let gridSideSize = ceil(sqrt(colorLevels));
        this.setGridSideSize(gridSideSize);

        let frameGridSideSize = Math.ceil(Math.sqrt(this.numberOfFrames));
        this.setFrameGridSideSize(frameGridSideSize);

        // Set atlas
        const spritesheetImages = this.spritesheets.map(item => item.img);
        let spritesheets_atlas = this.joinImagesIntoGrid(spritesheetImages);
        this.setSpritesheetsAtlas(spritesheets_atlas);
        console.log('Took', millis() - mm_, 'ms to setup spritesheets')
    }

    createASCIITexture(asciiString) {
        this.ASCIIString = asciiString;

        const buffer_width = this.gridSideSize * this.cellSize;
        const buffer_height = this.gridSideSize * this.cellSize;

        let buffer_otions = {
            width: buffer_width,
            height: buffer_width,
            textureFiltering: NEAREST,
            antialias: false,
            desity: 1,
            format: UNSIGNED_BYTE,
            depth: false,
            channels: RGBA,
        }

        let buffer = createFramebuffer(buffer_otions);

        buffer.begin();
        background(255); // White background
        textAlign(CENTER, CENTER);
        textSize(this.cellSize);
        fill(0); // Black text

        for (let i = 0; i < asciiString.length; i++) {
            let row = floor(i / this.gridSideSize);
            let col = i % this.gridSideSize;

            if (row >= this.gridSideSize) break; // Stop if we exceed the grid size

            let x = col * this.cellSize + this.cellSize / 2;
            let y = row * this.cellSize + this.cellSize / 2;

            text(asciiString[i], x-buffer_width/2, y-buffer_height/2);
        }

        buffer.end();

        return buffer;
    }

    joinImagesIntoGrid(imageArray) {
        let cellSize = Math.max(...imageArray.map(img => img.width));;
        let gridSideSize = Math.ceil(Math.sqrt(imageArray.length));

        const buffer_width = gridSideSize * cellSize;
        const buffer_height = gridSideSize * cellSize;

        let buffer_otions = {
            width: buffer_width,
            height: buffer_width,
            textureFiltering: NEAREST,
            antialias: false,
            desity: 1,
            format: UNSIGNED_BYTE,
            depth: false,
            channels: RGBA,
        }

        let buffer = createFramebuffer(buffer_otions);

        buffer.begin();
        clear()
        background(255, 255, 255); // White background

        for (let i = 0; i < imageArray.length; i++) {
            let row = floor(i / gridSideSize);
            let col = i % gridSideSize;

            if (row >= gridSideSize) break; // Stop if we exceed the grid size

            let x = col * cellSize;
            let y = row * cellSize;

            image(imageArray[i], x-buffer_width/2, y-buffer_height/2, cellSize, cellSize);
        }

        buffer.end();

        return buffer;
    }

    setPixelSize(new_pixel_size) {
        const old_pixel_size = this.pixelSize;
        this.pixelSize = parseInt(new_pixel_size);

        this.PCShader.setUniform('pixel_size', this.pixelSize);

        return old_pixel_size;
    }

    getPixelSize() {
        return this.pixelSize;
    }

    setBGOpacity(new_bg_opacity) {
        const old_bg_opacity = this.bgOpacity;
        this.bgOpacity = new_bg_opacity;

        this.PCShader.setUniform('bg_opacity', this.bgOpacity);

        return old_bg_opacity;
    }

    setColorLevels(new_color_levels) {
        const old_color_levels = this.colorLevels;
        this.colorLevels = new_color_levels;

        this.PCShader.setUniform('color_levels', this.colorLevels);

        return old_color_levels;
    }

    setGridSideSize(newGirdSideSize) {
        this.gridSideSize = newGirdSideSize;
        this.PCShader.setUniform('grid_side_size', this.gridSideSize);
    }

    setASCIITexture(new_ascii_texture) {
        this.asciiTexture = new_ascii_texture;

        this.PCShader.setUniform('ascii_texture', this.asciiTexture);
    }
    
    setSpritesheetsAtlas(spritesheets_atlas) {
        this.spritesheets_atlas = spritesheets_atlas;
    }
    
    setNumberOfFrames(numberOfFrames) {
        this.numberOfFrames = numberOfFrames;
        this.PCShader.setUniform('number_of_frames', this.numberOfFrames);
    }

    setFrameGridSideSize(frameGridSideSize) {
        this.frameGridSideSize = frameGridSideSize;
        this.PCShader.setUniform('frame_grid_size', this.frameGridSideSize);
    }

    setUseCustomSymbols(newUseCustomSymbols) {
        this.useCustomSymbols = newUseCustomSymbols;
    }

    increaseFrame() {
        this.frame_count+=1;
    }

    updateUISymbols() {
        const container = this.PCInputs['customSymbolsList'];
        console.log('Updating UI Symbols')

        function create_spritesheet_img_id(key) {
            return `spritesheet-image-${key}`
        }

        this.spritesheets.forEach((item, index) => {
            const p5img = item['img'];
            const id = item['id'];
            // Convert p5.Image → base64 URL
            const dataURL = p5img.canvas.toDataURL();
            
            const itemDiv = document.createElement('div');
            itemDiv.setAttribute('class', 'spritesheet-item flex items-center gap-0 h-12 mb-5');
            
            const existingImg = document.getElementById(create_spritesheet_img_id(id));
            if (existingImg) {
                return;
            }

            // Drag Handle
            const handle = document.createElement('div');
            handle.className = 'drag-handle cursor-grab p-2 opacity-30 hover:opacity-100';
            handle.innerHTML = '⋮⋮';

            // Image
            const img = createImg(dataURL, create_spritesheet_img_id(id));
            img.addClass('spritesheet-image');
            img.id(create_spritesheet_img_id(id));
            img.addClass('h-12 mr-4');

            // File input button
            const input_file = create_input_file_button(
                (user_file, file_name) => {
                    const parent = input_file.parentElement; 
                    const allItems = Array.from(container.querySelectorAll('.spritesheet-item'));
                    const currentIndex = allItems.indexOf(parent);
                    console.log('Changing spritesheet', currentIndex, 'to', file_name)
                    loadImage(user_file,
                        (loadedImage)=>{this.setSingleSpritesheet(loadedImage, currentIndex)},
                    );
                    const imgElement = parent.querySelector('.spritesheet-image');
                    if (imgElement) {
                        imgElement.src = user_file;
                    }
                    image.src = dataURL;
                },
                'Load Image',
                'No file chosen',
                'Loaded Image: ',
            )

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-ghost btn-xs text-neutral';
            delBtn.innerHTML = '✕';
            delBtn.onclick = () => {
                const parent = input_file.parentElement; 
                const allItems = Array.from(container.querySelectorAll('.spritesheet-item'));
                const currentIndex = allItems.indexOf(parent);
                console.log('Removing spritesheet', currentIndex)
                this.spritesheets.splice(currentIndex, 1);
                this.useSpritesheets(this.spritesheets)
                parent.remove();
            };

            input_file.getElementsByTagName('input')[0].className = "file-input file-input-xs bg-primary text-content dark:text-gray-800 file-input-bordered file-input-content file:px-1 max-w-[12rem]"
            input_file.getElementsByTagName('input')[0].innerHTML = ''

            itemDiv.appendChild(handle);
            img.parent(itemDiv);
            itemDiv.appendChild(input_file)
            itemDiv.appendChild(delBtn)
            container.appendChild(itemDiv);
        });
    }

    createPixelCamSettings() {
        const elements_dict = {};

        // Create Main Card
        const card = create_daisyui_expandable_card('PixelCamgSettings', 'Pixel Cam');
        const cardBody = card.getElementsByClassName('collapse-content')[0];

        // Add input fields and labels
        // Pixel Size
        const pixelSize = create_number_input_slider_and_number(
            'PCpixelSize',
            'Pixel Size',
            this.pixelSize,
            5,
            150,
            (value) => this.setPixelSize(value),
        );
        elements_dict['PCpixelSize'] = pixelSize.getElementsByTagName('input')[0];
        // BG Opacity
        const bgOpacity = create_number_input_slider_and_number(
            'PCbgOpacity',
            'BG Opacity',
            this.bgOpacity,
            0,
            1.0,
            (value) => this.setBGOpacity(parseFloat(value)),
            0.01
        );
        elements_dict['PCbgOpacity'] = bgOpacity.getElementsByTagName('input')[0];

        const numFrames = create_number_input_slider_and_number(
            'PCnumFrames',
            'Frames per spritesheet',
            this.numberOfFrames,
            1,
            24,
            (value) => {
                const newNumberOfFrames = parseInt(value);
                this.setNumberOfFrames(newNumberOfFrames)
                let frameGridSideSize = Math.ceil(Math.sqrt(newNumberOfFrames));
                this.setFrameGridSideSize(frameGridSideSize);
            },
            1,
        );
        elements_dict['PCnumFrames'] = numFrames.getElementsByTagName('input')[0];

        const customSymbolsSubtitle = create_expandable_subtitle('customSymbolsDiv', 'Used Symbols', false);
        const customSymbolsDiv = customSymbolsSubtitle.getElementsByClassName('collapse-content')[0]
        const customSymbolsList = document.createElement('div');

        const addBtn = document.createElement('button');
        addBtn.className = "btn btn-outline btn-dashed btn-block btn-sm mt-4";
        addBtn.innerHTML = "+ Add Level";
        addBtn.onclick = () => {
            console.log('Adding new spritesheet')
            const newImg = createGraphics(this.pixelSize || 32, this.pixelSize || 32);
            this.spritesheets.push({ id: `lvl-${Date.now()}`, img: newImg });
            this.useSpritesheets(this.spritesheets)
            this.updateUISymbols(); // Re-render
        };

        customSymbolsDiv.appendChild(customSymbolsList)
        customSymbolsDiv.appendChild(addBtn);

        elements_dict['customSymbolsDiv'] = customSymbolsDiv
        elements_dict['customSymbolsList'] = customSymbolsList
        new Sortable(customSymbolsList, {
            animation: 150,
            handle: '.drag-handle', 
            draggable: ".spritesheet-item",
            filter: '.btn', // Don't drag the buttons
            forceFallback: true, // This fixes the "cloning" / "ghosting" issue in many browsers
            fallbackClass: "sortable-fallback",
            ghostClass: 'opacity-0', // Makes the 'original' item invisible while you drag
            onEnd: (evt) => {
                console.log('Moving spritesheet from', evt.oldIndex, 'to', evt.newIndex)
                this.reorderSpritesheets(evt.oldIndex, evt.newIndex);
            }
        });

        cardBody.appendChild(pixelSize);
        cardBody.appendChild(bgOpacity);
        cardBody.appendChild(create_subtitle());
        cardBody.appendChild(numFrames);
        cardBody.appendChild(customSymbolsSubtitle);

        elements_dict['main-toolbar'] = card;
        this.PCInputs = elements_dict;
        return elements_dict;
    }
}
  
export default PixelCam;
