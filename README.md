# JSGenerativeArtUtils
To store utils for creating art with JS and p5js

# External Libraries
- RGBQuant library from [leeoniya/RgbQuant.js](https://github.com/leeoniya/RgbQuant.js/tree/master)

## CDNs

### UI

DaisyuUI and tailwind:

```html
<link href="https://cdn.jsdelivr.net/npm/daisyui@3.7.3/dist/full.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.tailwindcss.com"></script>
```

### Record

P5 Capture module:

```html
<script src="https://cdn.jsdelivr.net/npm/p5.capture"></script>
```

### Pixel Cam

SortableJS for sortable spritesheets:

```html
<script src="http://SortableJS.github.io/Sortable/Sortable.js"></script>
```

[Pickr](https://github.com/simonwep/pickr) for color picker:
```html
<script src="http://SortableJS.github.io/Sortable/Sortable.js"></script>
```

For Pickr styling with sharp edges and no extra borders use:
```css
.custom-color-picker,
.custom-color-picker *:not(.pcr-current-color):not(.pcr-picker),
.pickr .pcr-button::after,
.pickr .pcr-button::before,
.pcr-app .pcr-swatches>button::after {
    border-radius: 0 !important;
    border: none;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
}

.pickr .pcr-button,
.pcr-app .pcr-swatches > button::before,
.pickr .pcr-button::before,
.pcr-app[data-theme='nano'] .pcr-selection .pcr-color-palette .pcr-palette::before,
.pcr-app[data-theme='nano'] .pcr-selection .pcr-color-preview .pcr-current-color::before {
    background: none !important;
}

.pcr-app .pcr-interaction .pcr-type.active {
    color: var(--n);
    background: var(--ns);
    border: solid !important;
    border-width: 1px !important;
    border-color: hsl(var(--bc) / 0.2) !important;
}

.pcr-app .pcr-interaction .pcr-result {
    color: var(--b1);
    background: hsl(var(--p) / 0.2);
    border: solid;
    border-width: 1px;
    border-color: hsl(var(--bc) / 0.2);
}

.pickr .pcr-button:focus,
.pickr .pcr-button.pcr-active,
.custom-color-picker input:focus,
.custom-color-picker input.pcr-active,
.custom-color-picker button:focus,
.custom-color-picker button.pcr-active {
    /* Only keep the colored border, remove the white inner ring */
    box-shadow: 0 0 0 3px var(--pcr-color) !important;
}
```


