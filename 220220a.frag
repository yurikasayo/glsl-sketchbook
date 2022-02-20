// reference: The Art of Code "Shader Coding: Space GIF step-by-step"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float Xor(float a, float b) {
  return a*(1.-b) + b*(1.-a);
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;

  vec3 col = vec3(0.);

  float a = .78;
  float s = sin(a);
  float c = cos(a);
  uv *= mat2(c, -s, s, c);

  uv *= 15.;

  vec2 gv = fract(uv)-.5;
  vec2 id = floor(uv)+.5;
  float m = 0.;
  float t = u_time;
  for (float y = -1.; y <= 1.; y++) {
    for (float x = -1.; x <= 1.; x++) {
      vec2 offs = vec2(x, y);

      float d = length(gv-offs);

      float dist = length(id+offs)*.3;
      float r = mix(.3, 1.2, sin(dist-t)*.5+.5);
      m = Xor(m, smoothstep(r, r*.9, d));
    }
  }
  // col += mod(m, 2.);
  col += m;

  gl_FragColor = vec4(col, 1.0);
}