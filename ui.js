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
}