#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform sampler2D mask;
#define mask_color vec4(1.,1.,1., 1.)
#define RANDOM_SCALE vec4(443.897, 441.423, .0973, .1099)

// Chroma Vars
uniform bool activateFade;
uniform vec4 chromaColor;
uniform float fadeSpeed;
uniform float iFrame;

// uniform vec2 canvasSize;
uniform vec2 texelSize;
uniform vec2 normalRes;
uniform vec4 next_random_color;
int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color);
vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid);
bool colorsAreEqual(vec4 v1, vec4 v2);
float random(float x);

void main() {
  vec2 uv = vTexCoord;

  vec4 neighbourColors[8];
  vec2 directions[8];  
  directions[0] = vec2(-1.0, -1.0);
  directions[1] = vec2(-1.0, 0.0);
  directions[2] = vec2(-1.0, 1.0);
  directions[3] = vec2(0.0, -1.0);
  directions[4] = vec2(0.0, 1.0);
  directions[5] = vec2(1.0, -1.0);
  directions[6] = vec2(1.0, 0.0);
  directions[7] = vec2(1.0, 1.0);

  vec4 col = texture2D(tex0, uv);

  vec4 masked = texture2D(mask, uv);

  // Dont Perform if Masked
  bool isMasked = colorsAreEqual(masked, mask_color);

  if (isMasked) {
    gl_FragColor = col;
    return;
  }

  // Check if has to be replaced with chroma
  float noise_val = random(uv.x + uv.y * iFrame/10.);

  // gl_FragColor = vec4(noise_val, noise_val, noise_val, 1.);
  // return;
  // Dont sort if the random value is lower than 1-sorting chance
  if(noise_val<=fadeSpeed && !colorsAreEqual(chromaColor, col) && activateFade){
    gl_FragColor = chromaColor;
    return;
  }

  for(int i = 0; i < 8; i++) {
    vec2 uv_ = uv + directions[i] * texelSize;

    vec4 neighbour_color = col;
    if (uv_.x >= 0.0 && uv_.x <= 1.0 && uv_.y >= 0.0 && uv_.y <= 1.0){
      neighbour_color = texture2D(tex0, uv_);
    }

    neighbourColors[i] = neighbour_color;
  }

  int neighboursWithSameColor = count_neighbours_with_same_color(neighbourColors, col);
  vec4 nextMajorityColor = findMostRepeatedColor(neighbourColors, col);
  int neighboursWithNextColor = count_neighbours_with_same_color(neighbourColors, nextMajorityColor);

  vec4 new_color = vec4(1.0,1.0,0.0,1.0);
  if (neighboursWithSameColor==8 || neighboursWithSameColor == 3){
    new_color = col;
  }
  else if (neighboursWithSameColor < 2  || neighboursWithNextColor == 3){
    new_color = nextMajorityColor ;
  }
  else if (neighboursWithNextColor < 3 && neighboursWithSameColor == 5){
    new_color = next_random_color/255.0;
  } 
  else {
    new_color = col;
  }

  gl_FragColor = new_color;
}

int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color){
  int neighbours_with_same_color = 0;
  for (int i=0; i<8; i++){
    vec4 tmp_color = neighbour_colors[i];
    if(colorsAreEqual(tmp_color, pixel_color) && !colorsAreEqual(tmp_color, mask_color)){
      neighbours_with_same_color+=1; 
    }
  }

  return neighbours_with_same_color;
}

vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid) {
    int maxCount = 0;
    vec4 mostRepeatedVector = vec4(0.);

    for (int i = 0; i < 8; i++) {
        if (colorsAreEqual(colors[i], mask_color)){ // Avoid mask color
          continue;
        }
        if (colorsAreEqual(colors[i], color_to_avoid)){
          continue;
        }
        int currentCount = 0;
        for (int j = 0; j < 8; j++) {
          if (colorsAreEqual(colors[i], colors[j])) {
              currentCount++;
          }
          if (currentCount > 4) { // Stop once we've found a vector with more than 4 occurrences
            mostRepeatedVector = colors[i];
            return mostRepeatedVector;
          }
        }
        if (currentCount > maxCount) {
            maxCount = currentCount;
            mostRepeatedVector = colors[i];
        }
    }
    if (colorsAreEqual(mostRepeatedVector, vec4(0.))) {
      mostRepeatedVector = color_to_avoid;
    }

    return mostRepeatedVector;
}

bool colorsAreEqual(vec4 v1, vec4 v2) {
  return all(equal(v1, v2));
}

float random(in float x) {
    x = fract(x * RANDOM_SCALE.x);
    x *= x + 33.33;
    x *= x + x;
    return fract(x);
}
