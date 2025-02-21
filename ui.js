function create_card(id) {
    // Create the main card container
    const card = document.createElement('div');
    card.setAttribute('class', 'card');
    card.setAttribute('id', id);

    // Create the card body
    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');
    card.appendChild(cardBody);

    return card;
}

function create_expandable_card(id, title) {
    // Create the main card container
    const card = document.createElement('div');
    card.setAttribute('class', 'card');
  
    // Add the card header
    const cardHeader = document.createElement('div');
    cardHeader.setAttribute('class', 'card-header');
    cardHeader.setAttribute('id', id);
    
    const headerButton = document.createElement('button');
    headerButton.setAttribute('class', 'btn btn-link');
    headerButton.setAttribute('type', 'button');
    headerButton.setAttribute('data-bs-toggle', 'collapse');
    headerButton.setAttribute('data-bs-target', '#collapse'+id);
    headerButton.setAttribute('aria-expanded', 'true');
    headerButton.setAttribute('aria-controls', 'collapseOne');
    headerButton.innerHTML = title;
    
    cardHeader.appendChild(headerButton);
    card.appendChild(cardHeader);
  
    // Create the collapsible content
    const collapseContent = document.createElement('div');
    collapseContent.setAttribute('id', 'collapse'+id);
    collapseContent.setAttribute('class', 'collapse show');
    collapseContent.setAttribute('aria-labelledby', id);
  
    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');

    collapseContent.appendChild(cardBody);
    card.appendChild(collapseContent);
    return card;
}
  
function create_daisyui_expandable_card(id, title) {
    // Create the main card container
    const card = document.createElement('div');
    card.setAttribute('id', id);
    card.className = 'collapse collapse-arrow border-base-300 bg-base-200 border shadow-xl transition-none' // better with or without animation?
    // card.className = 'collapse collapse-arrow border-base-300 bg-base-200 border shadow-xl' // better with or without animation?

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.checked="true" // set checkd for it to be open

    const cardTitle = document.createElement('h2');
    cardTitle.setAttribute('class', 'collapse-title text-xl font-medium');
    cardTitle.innerHTML = title;

    const cardBody = document.createElement('div');
    cardBody.className = 'collapse-content'
    cardBody.id = id+'card-body'

    card.appendChild(checkbox);
    card.appendChild(cardTitle);
    card.appendChild(cardBody);

    return card;
}

function create_subtitle(title){
    var div = document.createElement('div');
    div.className = 'divider'
    
    if (title !== undefined && title !== null){ // Add title only if passed, otherwise no text on divider
        const title_tag = document.createElement('h2');
        title_tag.className = 'text-xl';
        title_tag.innerHTML = title;
        div.appendChild(title_tag);
    }

    return div;
}


function create_number_input_text(id, label, default_value, min, max){    
    var div = document.createElement('div');
    
    var input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('class', 'input input-bordered input-xs text-base text-center'); // Reduced height and adjusted padding
    input.setAttribute('id', id);

    // Conditionally set optional attributes
    if (label !== undefined && label !== null) {
        const label_tag = document.createElement('label');
        label_tag.setAttribute('for', id);
        label_tag.className = 'text-lg';
        label_tag.innerHTML = label + ': ';
        div.appendChild(label_tag);
    }
    if (min !== undefined && min !== null) {
        input.setAttribute('min', min);
    }
    if (max !== undefined && max !== null) {
        input.setAttribute('max', max);
    }
    if (default_value !== undefined && default_value !== null) {
        input.defaultValue = default_value;
    }

    div.appendChild(input);

    return div;
}

function create_number_input_slider_and_number(id, label, default_value, min, max, on_change_callback, step) {
    // Outer container
    var div = document.createElement('div');
    div.className = 'flex flex-col';
    div.id = id;

    var inputs_div = document.createElement('div');
    inputs_div.className = 'flex items-center';

    // Value
    // Create value div
    const number_div = document.createElement('div');
    number_div.id = id+'number-div';
    number_div.className = 'relative w-32 flex justify-center mr-4';
    // Create value display
    var number = document.createElement('input');
    number.setAttribute('type', 'number');
    number.setAttribute('class', 'input input-bordered input-xs text-base w-full text-center');
    number.setAttribute('id', id + 'number');

    // Range
    // Create range div
    const range_div = document.createElement('div');
    range_div.className = 'relative w-full';
    range_div.id = id+'range-div';
    // Create range input
    var range = document.createElement('input');
    range.setAttribute('type', 'range');
    range.setAttribute('id', id + 'range');
    range.className = 'range'
    range.className = 'range w-full absolute left-0 top-1/2 transform -translate-y-1/2'

    range.addEventListener('input', function (e) {
        number.value = e.target.value;
        if (on_change_callback !== undefined && on_change_callback !== null) {
            on_change_callback(number.value);
        }
      });
    number.addEventListener('input', function (e) {
        range.value = e.target.value;
        if (on_change_callback !== undefined && on_change_callback !== null) {
            on_change_callback(range.value);
        }
    });

    // Function to toggle disabled state
    function toggleDisabled(disabled) {
        number.disabled = disabled;
        range.disabled = disabled;

        if (disabled) {
            range.className = 'range [--range-shdw:gray] w-full absolute left-0 top-1/2 transform -translate-y-1/2'
        }
        else {
            range.className = 'range w-full absolute left-0 top-1/2 transform -translate-y-1/2'
        }
    }

    // Override the disabled property setter
    Object.defineProperty(number, 'linkedDisabled', {
        get: function() { return this._disabled; },
        set: function(value) {
            this._disabled = value;
            toggleDisabled(value);
        }
    });
    
    Object.defineProperty(range, 'linkedDisabled', {
        get: function() { return this._disabled; },
        set: function(value) {
            this._disabled = value;
            toggleDisabled(value);
        }
    });
    // Initialize _disabled properties
    number._disabled = false;
    range._disabled = false;

    // Conditionally set optional attributes
    if (label !== undefined && label !== null) {
        const label_div = document.createElement('div');
        label_div.className = 'mb-2';
        label_div.setAttribute('for', id);
        
        const label_element = document.createElement('h3');
        label_element.className = 'text-lg';
        label_element.innerHTML = label;
        label_element.title = label;

        label_div.appendChild(label_element);
        div.appendChild(label_div);
    }
    if (min !== undefined && min !== null) {
        range.min = min;
        number.min = min;
    }
    if (max !== undefined && max !== null) {
        range.max = max;
        number.max = max;
    }
    if (step !== undefined && step !== null) {
        range.step = step;
        number.step = step;
    }
    if (default_value !== undefined && default_value !== null) {
        range.defaultValue = default_value;
        number.defaultValue = default_value;
    }

    number_div.appendChild(number);
    range_div.appendChild(range);
    inputs_div.appendChild(number_div);
    inputs_div.appendChild(range_div);
    div.appendChild(inputs_div);

    return div;
}

function create_button(label, onClick, description, size){
    var div = document.createElement('div');

    const button = document.createElement('button');
    var class_name = 'btn btn-neutral'
    if (size !== undefined && size !== null) {
        class_name += ' btn-'+size
    }
    button.className = class_name;
    button.onclick = onClick;
    button.innerHTML = label;
    div.appendChild(button);
    
    if (description !== undefined && description !== null) {
        var separation = document.createTextNode(' ');

        var description_tag = document.createElement('text');
        description_tag.className = 'text-md'
        description_tag.textContent = description;
        div.appendChild(separation)
        div.appendChild(description_tag)
    }

    return div;
}

function setButtonEnabledAppearance(button, enabled){
    console.log('button', button)
    var className = button.className;
    className = className.replace(' btn-neutral', ''); // Remove btn-neutral in both cases, if enabled to make sure that its not twice
    if (enabled){
        className += ' btn-neutral' // add btn-neutral if it has to be enabled
    }
    button.setAttribute('class', className)

}

function createToggleButton(label, onClick, enabled){
    var div = document.createElement('div');
    div.className = 'flex items-center';

    // Create the checkbox input
    const button = document.createElement('input');
    button.type = 'checkbox';
    button.className = 'toggle';
    button.checked = enabled !== undefined && enabled !== null ? enabled: false;
    button.onclick = onClick;
    button.style.marginRight= '10px'

    div.appendChild(button);

    // Create the label element
    const labelContainer = document.createElement('label');
    labelContainer.className = 'label cursor-pointer';

    // Create the span element
    const labelText = document.createElement('span');
    labelText.className = 'label-text text-lg';
    labelText.textContent = label;

    // Build the structure
    labelContainer.appendChild(button);
    labelContainer.appendChild(labelText);
    div.appendChild(labelContainer);

    return div;
}

function create_input_image_button(callback, label, default_text, description_prefix){
    var div = document.createElement('div');
    
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('id', 'inputImageButton');
    input.setAttribute('class', 'file-input file-input-bordered file-input-content w-full max-w-xs');

    input.addEventListener(
        "change",
        () => { 
            let input_image = input.files[0]
            // Check if the file is an image.
            if (input_image.type && !input_image.type.startsWith('image/')) {
                console.log('File is not an image.', input_image.type, input_image);
                return;
            }

            // This allows to read the file content when the FileReader is loaded (feeling like a pro already 😎)
            const reader = new FileReader();
            reader.addEventListener('load', (event) => {
                let user_img = event.target.result;
                callback(user_img)
            });
            reader.readAsDataURL(input_image);

            // Change description to add file name
            var new_description = input_image.name
            if (description_prefix !== undefined && description_prefix !== null) {
                new_description = description_prefix + new_description;
            }
            description_tag.textContent = new_description;
        },
        false
    );

    div.appendChild(input);
    
    return div;
}

function turnDaisyUICardIntoBodyWithTitle(card){
    const sectionBodyDiv = document.createElement('div')

    const cardTitle = card.getElementsByClassName('collapse-title')[0];
    console.log('cardTitle', cardTitle.innerHTML)
    const newTitle = create_subtitle(cardTitle.innerHTML);

    const cardBody = card.getElementsByClassName('collapse-content')[0];
    cardBody.setAttribute('class', '')
    console.log('cardBody', cardBody)

    sectionBodyDiv.appendChild(newTitle)
    sectionBodyDiv.appendChild(cardBody)

    return sectionBodyDiv
}

function indentDiv(div, indent){
    div.style.marginLeft = indent;
    return div;
}

function createSmallBreak(heigth){
    const div = document.createElement('div') 
    const br = document.createElement('br');
    div.style.lineHeight = heigth
    // br.lineHeight = '100px';
    // br.style.display = 'block'; /* makes it have a width */
    // br.style.content = ""; /* clears default height */
    // br.style.marginTop = 100; /* change this to whatever height you want it */
    div.appendChild(br);
    return div;
}

function createText(text, size){
    var div = document.createElement('div');

    var text_tag = document.createElement('text');
    text_tag.className = 'text-md'
    if (size !== undefined && size !== null){
        text_tag.className = 'text-' + size
    }
    text_tag.textContent = text;
    div.appendChild(text_tag)

    return div;
}

function createRecordStopButton(label, onClick) {
    var div = document.createElement('div');
    div.className = 'flex items-center';

    // Create the button element
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'relative w-15 flex justify-center mr-3';

    const button = document.createElement('button');
    button.id = 'playButton';
    button.className = 'bg-neutral-content hover:bg-neutral rounded-full p-2 transition-colors';

    // Add Icon;
    // Create Record and Stop Paths for icon
    const recordPath = "M 10.1333 10.1333 m 10 0 a 10 10 90 1 0 -20 0 a 10 10 90 1 0 20 0"
    // const stopPath = "M 0 2 L 0 18 C 0 19 1 20 2 20 L 18 20 C 19 20 20 19 20 18 L 20 2 C 20 1 19 0 18 0 L 2 0 C 1 0 0 1 0 2"
    const stopPath = "M 1 3 L 1 17 C 1 18 2 19 3 19 L 17 19 C 18 19 19 18 19 17 L 19 3 C 19 2 18 1 17 1 L 3 1 C 2 1 1 2 1 3"
    // const stopPath = "M 2 4 L 2 16 C 2 17 3 18 4 18 L 16 18 C 17 18 18 17 18 16 L 18 4 C 18 3 17 2 16 2 L 4 2 C 3 2 2 3 2 4"
    
    const recordIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    recordIcon.setAttributeNS(null, "id", "recordIcon"); 
    recordIcon.style.display = "block";
    recordIcon.setAttributeNS(null, "viewBox", '0 0 20 20');

    recordIcon.setAttributeNS(null, 'class', 'w-6 h-6 text-gray-800 dark:text-base-200')
    recordIcon.setAttributeNS(null, 'ariaHidden', 'true')
    const recordIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    recordIconPath.setAttributeNS(null, 'fill', "currentcolor");
    recordIconPath.setAttributeNS(null, 'stroke-linejoin', "round");
    recordIconPath.setAttributeNS(null, 'd', recordPath);
    // recordIconPath.setAttributeNS(null, 'd', "M16 0H4a2 2 0 0 0-2 2v1H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.929 17H7.071a.5.5 0 0 1-.5-.5 3.935 3.935 0 1 1 7.858 0 .5.5 0 0 1-.5.5Z");
    recordIconPath.setAttributeNS(null, 'opacity', 1.0);

    button.classList.add("hover:text-yellow-500");
    button.classList.add("text-neutral-content"); // Default color

    // Save the colors to use them
    const rootStyles = getComputedStyle(document.documentElement);
    // Get Colors in HSL
    const daisyUIColor = rootStyles.getPropertyValue("--n").trim(); // --n is "neutral-content" in DaisyUI
    const daisyUIColorHover = rootStyles.getPropertyValue("--nc").trim(); // --n is "neutral-content" in DaisyUI
    const daisyUIAccentColor = rootStyles.getPropertyValue("--a").trim(); // --n is "neutral-content" in DaisyUI

    // Change SVG color on hover
    button.addEventListener('mouseover', function handleMouseOver() {
        recordIconPath.style.fill = `hsl(${daisyUIColorHover})`;
    });
    
    button.addEventListener('mouseout', function handleMouseOver() {
        recordIconPath.style.fill = `hsl(${daisyUIColor})`;
    });
    recordIconPath.style.fill = `hsl(${daisyUIColor})`;

    recordIcon.appendChild(recordIconPath);
    button.appendChild(recordIcon);
    buttonDiv.appendChild(button);

    // Add to the body
    div.appendChild(buttonDiv);

    if (label !== undefined && label !== null) {
        var labelDiv = document.createElement('div');
        labelDiv.className = 'relative w-full';

        var label_tag = document.createElement('text');
        label_tag.className = 'text-md'
        label_tag.textContent = label;
        labelDiv.appendChild(label_tag)
        div.appendChild(labelDiv)
    }

    // Add click handler
    let isRecording = false;
    button.addEventListener('click', () => {
        isRecording = !isRecording;

        if (onClick !== undefined && onClick !== null) {
            onClick(isRecording)
        }

        if (isRecording) {
            recordIconPath.setAttributeNS(null, 'd', stopPath);
        } else {
            recordIconPath.setAttributeNS(null, 'd', recordPath);
        }
        }
    );

    return div;

}

function createDropDownMenu(id, options, onSetMethod, label){
    var div = document.createElement('div');
    div.className = 'flex items-center';
    div.id = id;

    // Add label if provided
    if (label !== undefined && label !== null) {
        var labelDiv = document.createElement('div');
        labelDiv.className = 'relative flex w-30 justify-center mr-3';
        labelDiv.id = id + '-label';

        var label_tag = document.createElement('text');
        label_tag.className = 'text-md'
        label_tag.textContent = label;
        labelDiv.appendChild(label_tag)
        div.appendChild(labelDiv)
    }

    const menuDiv = document.createElement('div');
    menuDiv.className = 'dropdown dropdown relative w-full';
    menuDiv.id = id + '-menu';


    const menuDetails = document.createElement('details');
    menuDetails.className = 'dropdown relative w-full'

    const menuSummary = document.createElement('summary');
    menuSummary.className = 'btn btn-outline m-1 w-1/2 text-left justify-start'
    menuSummary.textContent = options[0];

    menuDetails.appendChild(menuSummary);

    // Create dropdown menu
    var dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'menu dropdown-content p-2 shadow bg-base-100 rounded-box w-52 z-[1000]';
    
    // This is to allow vertical scroll so it has a dive with some size that it cant overflow
    var dropdownMenuDiv = document.createElement('div');
    dropdownMenuDiv.className = 'overflow-y-auto max-h-52';

    // Add options dynamically
    options.forEach(option => {
        var listItem = document.createElement('li');
        var optionButton = document.createElement('button');
        optionButton.className = 'w-full text-left p-2 hover:bg-gray-100 rounded';
        optionButton.textContent = option;
        
        // Handle option click
        optionButton.addEventListener('click', function() {
            let ableToSet = false;
            if (onSetMethod!==undefined && onSetMethod !== null){
                ableToSet = onSetMethod(option);
            }
            if (!ableToSet) return; // don't change label if something failed
            menuSummary.innerHTML = option;
        });
        
        listItem.appendChild(optionButton);
        dropdownMenuDiv.appendChild(listItem);
    });
    
    dropdownMenu.appendChild(dropdownMenuDiv);
    menuDetails.appendChild(dropdownMenu);
    // menuDiv.appendChild(menuButton);
    menuDiv.appendChild(menuDetails);

    // Add to the body
    div.appendChild(menuDiv);

    return div;
}

export {
    create_card,
    create_expandable_card,
    create_subtitle,
    create_number_input_text,
    create_number_input_slider_and_number,
    create_button,
    setButtonEnabledAppearance,
    create_input_image_button,
    create_daisyui_expandable_card,
    turnDaisyUICardIntoBodyWithTitle,
    createToggleButton,
    indentDiv,
    createSmallBreak,
    createText,
    createRecordStopButton,
    createDropDownMenu,
}