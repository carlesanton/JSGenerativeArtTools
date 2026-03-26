precision mediump float;

uniform sampler2D tex0;
varying vec2 vTexCoord;

uniform float gamma;
uniform float contrast;
uniform float brightness;
uniform float exposure;
uniform float saturation;
uniform float blackLevel;
uniform float whiteLevel;
uniform float invert;

vec3 adjust(vec3 color) {
    color *= exposure;

    color = pow(color, vec3(1.0 / gamma));

    color = (color - 0.5) * contrast + 0.5;

    color += brightness;

    color = (color - blackLevel) / (whiteLevel - blackLevel);
    color = clamp(color, 0.0, 1.0);

    return color;
}

vec3 adjustSaturation(vec3 color) {
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(luma), color, saturation);
}

void main() {
    vec3 color = texture2D(tex0, vTexCoord).rgb;

    color = adjust(color);
    color = adjustSaturation(color);
    if (invert > 0.5) {
        color = 1.0 - color;
    }

    gl_FragColor = vec4(color, 1.0);
}
