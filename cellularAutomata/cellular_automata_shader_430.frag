uniform sampler2D mask;

#define mask_color vec4(1.0, 1.0, 1.0, 1.0)
#define RANDOM_SCALE vec4(443.897, 441.423, 0.0973, 0.1099)

// Chroma Vars
uniform bool activateFade;
uniform vec4 chromaColor;
uniform float fadeSpeed;
uniform float iFrame;

uniform vec4 next_random_color;

int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color);
vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid);
bool colorsAreEqual(vec4 v1, vec4 v2);
float random(float x);

layout(location = 0) out vec4 fragColor;


void main() {
  vec2 uv = vUV.xy;
  vec2 texelSize = vec2(1./uTD2DInfos[0].res.z, 1./uTD2DInfos[0].res.w);

  vec4 neighbourColors[8];
  vec2 directions[8];  
  directions[0] = vec2(-1.0, -1.0);
  directions[1] = vec2(-1.0,  0.0);
  directions[2] = vec2(-1.0,  1.0);
  directions[3] = vec2( 0.0, -1.0);
  directions[4] = vec2( 0.0,  1.0);
  directions[5] = vec2( 1.0, -1.0);
  directions[6] = vec2( 1.0,  0.0);
  directions[7] = vec2( 1.0,  1.0);

  vec4 col = texture(sTD2DInputs[0], uv);
  vec4 masked = texture(sTD2DInputs[1], uv);

  bool isMasked = colorsAreEqual(masked, mask_color);

  if (isMasked) {
    fragColor = col;
    return;
  }

  float noise_val = random(uv.x + uv.y * iFrame / 10.0);

  if (noise_val <= fadeSpeed && !colorsAreEqual(chromaColor, col) && activateFade) {
    fragColor = chromaColor;
    return;
  }

  for (int i = 0; i < 8; i++) {
    vec2 uv_ = uv + directions[i] * texelSize;
    vec4 neighbour_color = col;

    if (uv_.x >= 0.0 && uv_.x <= 1.0 && uv_.y >= 0.0 && uv_.y <= 1.0) {
      neighbour_color = texture(sTD2DInputs[0], uv_);
    }

    neighbourColors[i] = neighbour_color;
  }

  int neighboursWithSameColor = count_neighbours_with_same_color(neighbourColors, col);
  vec4 nextMajorityColor = findMostRepeatedColor(neighbourColors, col);
  int neighboursWithNextColor = count_neighbours_with_same_color(neighbourColors, nextMajorityColor);

  vec4 new_color = vec4(1.0, 1.0, 0.0, 1.0);

  if (neighboursWithSameColor == 8 || neighboursWithSameColor == 3) {
    new_color = col;
    // new_color = vec4(1.,0.,0.,1.);
  } else if (neighboursWithSameColor < 2 || neighboursWithNextColor == 3) {
    new_color = nextMajorityColor;
    // new_color = vec4(0.,1.,0.,1.);
  } else if (neighboursWithNextColor < 3 && neighboursWithSameColor == 5) {
    new_color = next_random_color;
    // new_color = vec4(0.,0.,1.,1.);
  } else {
    new_color = col;
  }

  fragColor = TDOutputSwizzle(new_color);
}

int count_neighbours_with_same_color(vec4 neighbour_colors[8], vec4 pixel_color) {
  int neighbours_with_same_color = 0;
  for (int i = 0; i < 8; i++) {
    vec4 tmp_color = neighbour_colors[i];
    if (colorsAreEqual(tmp_color, pixel_color) && !colorsAreEqual(tmp_color, mask_color)) {
      neighbours_with_same_color += 1;
    }
  }
  return neighbours_with_same_color;
}

vec4 findMostRepeatedColor(vec4 colors[8], vec4 color_to_avoid) {
  int maxCount = 0;
  vec4 mostRepeatedVector = vec4(0.0);

  for (int i = 0; i < 8; i++) {
    if (colorsAreEqual(colors[i], mask_color) || colorsAreEqual(colors[i], color_to_avoid)) {
      continue;
    }
    int currentCount = 0;
    for (int j = 0; j < 8; j++) {
      if (colorsAreEqual(colors[i], colors[j])) {
        currentCount++;
      }
      if (currentCount > 4) {
        mostRepeatedVector = colors[i];
        return mostRepeatedVector;
      }
    }
    if (currentCount > maxCount) {
      maxCount = currentCount;
      mostRepeatedVector = colors[i];
    }
  }

  if (colorsAreEqual(mostRepeatedVector, vec4(0.0))) {
    mostRepeatedVector = color_to_avoid;
  }

  return mostRepeatedVector;
}

bool colorsAreEqual(vec4 v1, vec4 v2) {
  return all(equal(v1, v2));
}

float random(float x) {
  x = fract(x * RANDOM_SCALE.x);
  x *= x + 33.33;
  x *= x + x;
  return fract(x);
}
