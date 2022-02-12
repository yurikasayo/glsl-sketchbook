// reference: "Making a heart in ShaderToy"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define S(a, b, t) smoothstep(a, b, t)
#define HEART_COLOR vec3(1., .05, .05)

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float smax(float a, float b, float k) {
  float h = clamp((b-a)/k+.5, 0., 1.);
  return mix(a, b, h) + h * (1.-h) * k * .5;
}

float Heart(vec2 uv, float b) {
  float r = .25;
  b *= r;

  uv.x *= .7;
  uv.y -= smax(sqrt(abs(uv.x))*.5, b, .1);
  uv.y += .1;
  float d = length(uv);

  return S(r+b, r-b, d);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy) / u_resolution.y;
  vec2 m = u_mouse.xy / u_resolution.xy;

  vec3 col = vec3(0.);

  float c = Heart(uv, m.y);

  col = c * HEART_COLOR;

  gl_FragColor = vec4(col, 1.);
}