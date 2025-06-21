#define RANDOM_SINLESS
#define SORTING_CHANCE 0.5
#define mask_color vec4(1.0, 1.0, 1.0, 1.0)
#define RANDOM_SCALE vec4(443.897, 441.423, 0.0973, 0.1099)
#define FNC_RANDOM

uniform vec2 direction;
uniform int iFrame;
uniform float strenght;

layout(location = 0) out vec4 fragColor;

float hsvbrightness(vec3 c);
float random(vec3 pos);
bool colorsAreEqual(vec4 v1, vec4 v2);

void main() {
  vec2 uv = vUV.xy;
  vec2 texelSize = vec2(1./uTD2DInfos[0].res.z, 1./uTD2DInfos[0].res.w);

  float current_pass = iFrame * strenght + uTDPass;
  float fParity = mod(float(current_pass), 2.0) * 2.0 - 1.0;
  float verticalParity = mod(floor(uv.x / texelSize.x), 2.0) * 2.0 - 1.0;
  float diagonalParity = mod(floor(uv.x / texelSize.x) + floor(uv.y / texelSize.y), 2.0) * 2.0 - 1.0;

  float direction_multiplier = fParity * diagonalParity;
  if (mod(direction.x + direction.y, 2.0) == 0.0) {
    direction_multiplier = fParity * verticalParity;
  }

  vec2 dir = direction * texelSize.xy;
  dir *= direction_multiplier;
  dir.y *= -1.0;

  vec2 uv_ = uv + dir;

  vec4 col = texture(sTD2DInputs[0], uv);
  vec4 neighbour_color = texture(sTD2DInputs[0], uv_);

  vec4 masked = texture(sTD2DInputs[1], uv);
  vec4 masked_neighbour = texture(sTD2DInputs[1], uv_);

  bool isMasked = colorsAreEqual(masked, mask_color);
  if (direction_multiplier >= 0.0) {
    isMasked = colorsAreEqual(masked_neighbour, mask_color);
  }

  if (isMasked) {
    fragColor = col;
    return;
  }

  float gCurr = hsvbrightness(col.rgb);
  float gComp = hsvbrightness(neighbour_color.rgb);

  float noise_val = 1.0;
  if (direction_multiplier >= 0.0) {
    noise_val = random(vec3(ceil(uv.x / texelSize.x), ceil(uv.y / texelSize.y), ceil(float(current_pass))));
  } else {
    noise_val = random(vec3(ceil(uv_.x / texelSize.x), ceil(uv_.y / texelSize.y), ceil(float(current_pass))));
  }

  if (noise_val <= 1.0 - SORTING_CHANCE) {
    fragColor = col;
    return;
  }

  if (uv_.x < 0.0 || uv_.x > 1.0 || uv_.y < 0.0 || uv_.y > 1.0) {
    fragColor = col;
    return;
  }

  vec4 output_color = col;
  if (direction_multiplier > 0.0) {
    if (!isMasked && gCurr < gComp) {
      output_color = neighbour_color;
    }
  } else {
    if (!isMasked && gCurr > gComp) {
      output_color = neighbour_color;
    }
  }

  fragColor = output_color;
}

float hsvbrightness(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  return q.x;
}

float random(vec3 pos) {
  pos = fract(pos * RANDOM_SCALE.xyz);
  pos += dot(pos, pos.zyx + 31.32);
  return fract((pos.x + pos.y) * pos.z);
}

bool colorsAreEqual(vec4 v1, vec4 v2) {
  return all(equal(v1, v2));
}
