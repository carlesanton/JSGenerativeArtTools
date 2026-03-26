#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;

uniform int pixel_size;
uniform float bg_opacity;
uniform int color_levels;
uniform int grid_side_size;
uniform int frame_count;
uniform int number_of_frames;
uniform int frame_grid_size;
uniform sampler2D spritesheets_atlas_texture;

float hsvbrightness(vec3 c);
vec2 get_block_uv(vec2 uv, vec2 block_size);
vec2 get_region_top_left_coords(int section, int grid_side_size);
vec2 get_region_bottom_right_coords(int section, int grid_side_size);
float map_value(float input_value, float input_min, float input_max, float output_min, float output_max);
float random(vec2 st);

// Definitions:
// BLOCK: big pixel, group of pixels that are used to represent the same color/symbol
// BLOCK UV: uv coordinates of the pixel inside the corresponding block
// ANIMATION ATLAS: grid of flipbooks with all of the animations in a grid
// ANIMATION INDEX: index determining wich animation of the atlas should we use
// ANIMATION UV: coordinates of the pixel of the block inside the animation
// SUBTEXTURE: fragment of an animation representing a symbol/frame
// SECTION: index representing wich subtexture of a texture to use

#define RANDOM_SCALE vec4(443.897, 441.423, .0973, .1099)

void main() {
  vec2 uv = vTexCoord;

  // Compute the UV coordinate of the center of the current block
  vec2 blockCenterUV = floor(uv / (texelSize * float(pixel_size))) * (texelSize * float(pixel_size));
  blockCenterUV += vec2(float(pixel_size)/2., float(pixel_size)/2.) * texelSize; // move to center
  vec4 block_color = texture2D(tex0, blockCenterUV);

  float blockBrightness = hsvbrightness(block_color.rgb);

  // Get what animation do we need to get based on brightness
  int animation_index = int(float(color_levels - 1) * (1. - blockBrightness) + 0.5);
  float quantizedBrightness = 1.-float(animation_index) / float(color_levels-1); // Not used, only for debug

  // Get boundary coords of the animation in range [0, 1]
  vec2 animation_top_left = get_region_top_left_coords(animation_index, grid_side_size); // Top-left UV of the symbol
  vec2 animation_bottom_right = get_region_bottom_right_coords(animation_index, grid_side_size); // Bottom-Right UV of the symbol

  // Get wich frame index are we based on frame count and n frames
  float random_offset = random(blockCenterUV) * 100.0;
  int frame_index = int(mod(float(frame_count) + random_offset, float(number_of_frames)));
  // Get boundary coords of the frame in range [0, 1]
  vec2 frame_top_left = get_region_top_left_coords(frame_index, frame_grid_size); // Top-left UV of the symbol
  vec2 frame_bottom_right = get_region_bottom_right_coords(frame_index, frame_grid_size); // Top-left UV of the symbol


  // Remap frame borders to the animation flipbook boundaries
  vec2 remaped_frame_top_left = vec2(
    map_value(frame_top_left.x, 0., 1., animation_top_left.x, animation_bottom_right.x),
    map_value(frame_top_left.y, 0., 1., animation_top_left.y, animation_bottom_right.y)
  );
  vec2 remaped_frame_bottom_right = vec2(
    map_value(frame_bottom_right.x, 0., 1., animation_top_left.x, animation_bottom_right.x),
    map_value(frame_bottom_right.y, 0., 1., animation_top_left.y, animation_bottom_right.y)
  );

  // Compute the UV of the pixel relative to its block
  vec2 block_uv = get_block_uv(uv, texelSize * float(pixel_size));

  // Remap block UVs to the corresponding frame UV range
  vec2 mapped_uv = vec2(
    map_value(block_uv.x, 0., 1., remaped_frame_top_left.x, remaped_frame_bottom_right.x),
    map_value(block_uv.y, 0., 1., remaped_frame_top_left.y, remaped_frame_bottom_right.y)
  );

  vec4 output_color = texture2D(spritesheets_atlas_texture, mapped_uv);
  if (output_color.rgb == vec3(1.)){
    vec3 new_bg_color = mix(vec3(block_color.rgb), vec3(1.0), 1. - bg_opacity);
    output_color = vec4(new_bg_color*bg_opacity, bg_opacity); // Ensure we premutliply alpha
    // output_color = vec4(0.6,0.8*quantizedBrightness,quantizedBrightness,1.); // FOR DEBUGGING
  }

  gl_FragColor = output_color;
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

vec2 get_region_top_left_coords(int section, int grid_side_size) {
  // Get top left coords of the region
  float region_x_min = mod(float(section), float(grid_side_size)) / float(grid_side_size);
  float region_y_min = floor(float(section) / float(grid_side_size)) / float(grid_side_size);
  vec2 region_top_left = vec2(region_x_min, region_y_min); // Top-left UV of the symbol

  return region_top_left;
}

vec2 get_region_bottom_right_coords(int section, int grid_side_size) {
  // Get bottom right coords of the region
  float region_x_max = mod((float(section) + 1.), float(grid_side_size)) / float(grid_side_size);
  if (int(mod(float(section), float(grid_side_size))) == grid_side_size - 1) { // Check on last column not to go to first one
    region_x_max = 1.;
  }
  float region_y_max = floor((float(section + grid_side_size)) / float(grid_side_size)) / float(grid_side_size);
  vec2 region_bottom_right = vec2(region_x_max, region_y_max); // Bottom-Right UV of the symbol

  return region_bottom_right;
}

float map_value(float input_value, float input_min, float input_max, float output_min, float output_max) {
  float slope = (output_max - output_min) / (input_max - input_min);
  float output_value = output_min + slope * (input_value - input_min);
  return output_value;
}

float random(vec2 st) {
    vec3 p3  = fract(vec3(st.xyx) * RANDOM_SCALE.xyz);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
