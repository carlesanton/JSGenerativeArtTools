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
  
function create_subtitle(title){
    var div = document.createElement('div');
    
    const title_tag = document.createElement('h5');
    title_tag.innerHTML = title;

    div.appendChild(title_tag);

    return div;
}


function create_number_input_text(id, label, default_value, min, max){    
    var div = document.createElement('div');
    
    var input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('class', 'inputNumber');
    input.setAttribute('id', id);

    // Conditionally set optional attributes
    if (label !== undefined && label !== null) {
        const label_tag = document.createElement('label');
        label_tag.setAttribute('for', id);
        label_tag.innerHTML = label + ':';
        div.appendChild(label_tag);
    }
    if (min !== undefined && min !== null) {
        input.setAttribute('min', min);
    }
    if (default_value !== undefined && default_value !== null) {
        input.defaultValue = default_value;
    }
    if (max !== undefined && max !== null) {
        input.setAttribute('max', max);
    }

    div.appendChild(input);

    return div;
}

function create_button(label, onClick, description){
    var div = document.createElement('div');

    const button = document.createElement('button');
    button.onclick = onClick;
    button.innerHTML = label;
    div.appendChild(button);
    
    if (description !== undefined && description !== null) {
        var separation = document.createTextNode(' ');

        var description_tag = document.createElement('text');
        description_tag.textContent = description;
        div.appendChild(separation)
        div.appendChild(description_tag)
    }

    return div;
}

function create_input_image_button(callback, label, default_text, description_prefix){
    var div = document.createElement('div');
    
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('id', 'inputImageButton');
    input.style.display = "none"
    
    const button = document.createElement('button');
    button.onclick = () => { input.click(); };
    button.innerHTML = label;
    
    var description_tag = document.createElement('text');
    if (default_text !== undefined && default_text !== null) {
        description_tag.textContent = default_text;
    }

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


    div.appendChild(button);
    div.appendChild(input);
    div.appendChild(document.createTextNode(' '))
    div.appendChild(description_tag)
    
    return div;
}

export {
    create_card,
    create_expandable_card,
    create_subtitle,
    create_number_input_text,
    create_button,
    create_input_image_button,
}