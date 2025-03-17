#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;
uniform sampler2D inputImage;
uniform vec4 maskColor;
uniform float maxBrightness;
uniform float minBrightness;

float hsvbrightness(vec3 c);

void main() {
  vec2 uv = vTexCoord;

  // // Sample colors
  vec4 col = texture2D(inputImage, uv);

  // Get brightness using HSV space
  float brightness = hsvbrightness(col.rgb);

  vec4 output_color = vec4(0.,0.,0.,1.);
  if (maxBrightness > minBrightness && (brightness < maxBrightness && brightness > minBrightness)) {
    output_color = maskColor;
  }
  else if (maxBrightness < minBrightness && (brightness > maxBrightness && brightness < minBrightness)) {
    output_color = maskColor;
  }

  // gl_FragColor = vec4(1.,1.,1.,1.);
  gl_FragColor = output_color;

}

// From https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
float hsvbrightness(vec3 c){
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  return q.x;
}
