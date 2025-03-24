#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;

uniform int pixel_size;
uniform int color_levels;
uniform int grid_side_size;
uniform sampler2D ascii_texture;

float quantize(float value, int levels);
vec4 quantizeColor(vec4 input_color, int levels);
float hsvbrightness(vec3 c);
vec2 get_block_uv(vec2 uv, vec2 block_size);
vec2 get_subtexture_uv(int section, vec2 block_coordinates, int grid_side_size);
float map_value(float input_value, float input_min, float input_max, float output_min, float output_max);

// Definitions:
// BLOCK: big pixel, group of pixels that are used to represent the same color/symbol
// BLOCK UV: uv coordinates of the pixel inside the corresponding block
// SUBTEXTURE: fragment of a texture representing a symbol/frame
// SECTION: index representing wich subtexture of a texture to use

void main() {
  vec2 uv = vTexCoord;

  // Compute the UV coordinate of the center of the current block
  vec2 blockCenterUV = floor(uv / (texelSize * float(pixel_size))) * (texelSize * float(pixel_size));
  blockCenterUV += vec2(float(pixel_size)/2., float(pixel_size)/2.) * texelSize; // move to center
  vec4 block_color = texture2D(tex0, blockCenterUV);

  // Get block brightness
  float blockBrightness = hsvbrightness(block_color.rgb);
  float quantizedBrightness = quantize(blockBrightness, color_levels);

  // Sample the ASCII texture
  int levels = int(ceil(1./(texelSize * float(pixel_size))));
  // Compute the UV of the pixel relative to its block
  vec2 block_uv = get_block_uv(uv, texelSize * float(pixel_size));

  // Get what symbol do we need to get based on brightness
  int current_section = int(floor(map_value(1.-quantizedBrightness, 0.,1.,0., float(color_levels-1))));
  
  vec2 subtexture_uv = get_subtexture_uv(current_section, block_uv, grid_side_size);

  vec4 subtexture_color = texture2D(ascii_texture, subtexture_uv);

  vec4 output_color = subtexture_color;

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

vec2 get_block_uv(vec2 uv, vec2 block_size) {
  // Gets the UV of the pixel relative to its corresponding block
  vec2 block_uv = vec2(
    mod(uv.x, block_size.x)/block_size.x,
    mod(uv.y, block_size.y)/block_size.y
  );

  return block_uv;
}

vec2 get_subtexture_uv(int section, vec2 block_coordinates, int grid_side_size) {
  // Gets the UV of the pixel on the corresponding section of the texture (maps from 0-1 to the UVs of the subsection)

  // Get Min coords of the subtexture
  float section_x_min = mod(float(section), float(grid_side_size)) / float(grid_side_size);
  float section_y_min = floor(float(section) / float(grid_side_size)) / float(grid_side_size);
  vec2 top_left = vec2(section_x_min, section_y_min); // Top-left UV of the symbol

  // Get Max coords of the subtexture
  float section_x_max = mod((float(section) + 1.), float(grid_side_size)) / float(grid_side_size);
  if (int(mod(float(section), float(grid_side_size))) == grid_side_size - 1) { // Check on last column not to go to first one
    section_x_max = 1.;
  }
  float section_y_max = floor((float(section + grid_side_size)) / float(grid_side_size)) / float(grid_side_size);
  vec2 bottom_right = vec2(section_x_max, section_y_max); // Bottom-Right UV of the symbol

  // Remap from 0-1 to the corresponding subtexture range
  vec2 mapped_uv = vec2(
    map_value(block_coordinates.x, 0., 1., top_left.x, bottom_right.x),
    map_value(block_coordinates.y, 0., 1., top_left.y, bottom_right.y)
  );

  return mapped_uv;
}

float map_value(float input_value, float input_min, float input_max, float output_min, float output_max) {
  float slope = (output_max - output_min) / (input_max - input_min);
  float output_value = output_min + slope * (input_value - input_min);
  return output_value;
}
