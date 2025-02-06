#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
// uniform vec2 canvasSize;
uniform vec2 texelSize;
uniform vec2 normalRes;
uniform vec4 next_random_color;
int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color);
float count_neighbours_with_same_color_(vec4 neighbour_colors[8], vec4 pixel_color);
vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid);
bool colorsAreEqual(vec4 v1, vec4 v2);
bool colorsAreEqualEpsilon(vec4 v1, vec4 v2);

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

  for(int i = 0; i < 8; i++) {
    vec2 uv_ = uv + directions[i] * texelSize;

    vec4 neighbour_color = col;
    if (uv_.x >= 0.0 && uv_.x <= 1.0 && uv_.y >= 0.0 && uv_.y <= 1.0){
      neighbour_color = texture2D(tex0, uv_);
    }

    neighbourColors[i] = neighbour_color;
  }

  int neighboursWithSameColor = count_neighbours_with_same_color(neighbourColors, col);
  float neighboursWithSameColor_ = count_neighbours_with_same_color_(neighbourColors, col);
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
    if(colorsAreEqual(tmp_color, pixel_color)){
      neighbours_with_same_color+=1; 
    }
  }

  return neighbours_with_same_color;
}

float count_neighbours_with_same_color_(vec4 neighbour_colors[8], vec4 pixel_color){
  float neighbours_with_same_color = 0.0;
  float epsilon = 0.01; // Adjust based on precision needs
  for (int i=0; i<8; i++){
    vec4 tmp_color = neighbour_colors[i];
    if(abs(tmp_color.r - pixel_color.r) < epsilon && abs(tmp_color.g - pixel_color.g) < epsilon && abs(tmp_color.b - pixel_color.b) < epsilon) {
        neighbours_with_same_color += 1.;
    }  
  }
  neighbours_with_same_color = neighbours_with_same_color/8.;
  return neighbours_with_same_color;
}

vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid) {
    int maxCount = 0;
    vec4 mostRepeatedVector = vec4(0.);

    for (int i = 0; i < 8; i++) {
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
  return colorsAreEqualEpsilon(v1, v2);
  return v1.r==v2.r && v1.g==v2.g && v1.b==v2.b;
}

bool colorsAreEqualEpsilon(vec4 v1, vec4 v2) {
  float epsilon = 0.01; // Adjust based on precision needs
  bool areEqual = false;
  if(abs(v1.r - v2.r) < epsilon &&
    abs(v1.g - v2.g) < epsilon &&
    abs(v1.b - v2.b) < epsilon) {
      areEqual = true;
  }
  return areEqual;
}
