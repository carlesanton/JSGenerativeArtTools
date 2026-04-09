#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;

uniform vec3 white_color;
uniform vec3 black_color;

void main() {
  vec2 uv = vTexCoord;

  vec4 color = texture2D(tex0, uv);
  float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  float isWhite = step(0.5, brightness);
  vec3 finalRGB = mix(black_color, white_color, isWhite);

  gl_FragColor = vec4(finalRGB, 1.0);

}
