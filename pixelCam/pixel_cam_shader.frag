#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;

uniform int pixel_size;
uniform int color_levels;

float quantize(float value, int levels);
vec4 quantizeColor(vec4 input_color, int levels);
float hsvbrightness(vec3 c);

void main() {
  vec2 uv = vTexCoord;

  // Compute the UV coordinate of the center of the current block
  vec2 blockUV = floor(vTexCoord / (texelSize * float(pixel_size))) * (texelSize * float(pixel_size));
  blockUV += vec2(float(pixel_size)/2., float(pixel_size)/2.) * texelSize;

  vec4 block_color = texture2D(tex0, blockUV);

  float blockBrightness = hsvbrightness(block_color.rgb);
  vec4 bwColor = vec4(blockBrightness, blockBrightness, blockBrightness, 1.);

  vec4 output_color = quantizeColor(bwColor, color_levels);

  gl_FragColor = output_color;
}

// Function to quantize a color channel
float quantize(float value, int levels) {
    float step = 1.0 / float(levels - 1);
    return floor(value / step + 0.5) * step;
}

vec4 quantizeColor(vec4 input_color, int levels) {
  vec4 output_color = vec4(
    quantize(input_color.r, levels),
    quantize(input_color.g, levels),
    quantize(input_color.b, levels),
    quantize(input_color.a, levels)
  );

  return output_color;
}

float hsvbrightness(vec3 c){
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  return q.x;
}
