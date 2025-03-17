#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform sampler2D imageToReplace;
uniform sampler2D maskedImage;
uniform vec2 texelSize;
uniform vec4 maskColor;

bool colorsAreEqual(vec4 v1, vec4 v2);

void main() {
  vec2 uv = vTexCoord;

  // // Sample colors
  vec4 col = texture2D(maskedImage, uv);

  vec4 output_color = col;
  // if (colorsAreEqual(col, vec4(1.,1.,1.,1.))) {
  if (colorsAreEqual(col, maskColor)) {
    output_color = texture2D(imageToReplace, uv);
  }

  // output_color = vec4(1.,0.,0.5,1.);

  gl_FragColor = output_color;
}

bool colorsAreEqual(vec4 v1, vec4 v2) {
  return all(equal(v1, v2));
}
