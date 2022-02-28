#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

vec2 N(float angle) {
  return vec2(sin(angle), cos(angle));
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 mouse = u_mouse.xy / u_resolution.xy;
  uv *= 2.;
  vec3 col = vec3(0.);

  uv.x = abs(uv.x);
  uv.y += tan((5./6.)*3.1415)*.5;

  vec2 n = N((5./6.)*3.1415);
  float d = dot(uv-vec2(.5, 0.), n);
  uv -= n*max(0., d)*2.;

  // n = N(mouse.x*3.1415*(2./3.));
  n = N((2./3.)*3.1415);
  float scale = 1.;
  uv.x += .5;
  for (int i=0; i<1; i++) {
    uv *= 3.;
    scale *= 3.;
    uv.x -= 1.5;

    uv.x = abs(uv.x);
    uv.x -= .5;
    uv -= n*min(0., dot(uv, n))*2.;
  }

  d = length(uv - vec2(clamp(uv.x, -1., 1.), 0.));
  col += smoothstep(.003, .0, d/scale);
  col.rg += uv;

  gl_FragColor = vec4(col, 1.0);
}