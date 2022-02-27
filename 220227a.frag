// reference: The Art of Code "Shader Coding: Truchet Tiling Explained!"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float Hash21(vec2 p) {
  p = fract(p*vec2(482.327, 627.183));
  p += dot(p, p+23.219);
  return fract(p.x*p.y);
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 UV = gl_FragCoord.xy / u_resolution.xy;

  vec3 col = vec3(0.);

  uv += u_time * .05;
  uv *= 10.;
  vec2 gv = fract(uv) - .5;
  vec2 id = floor(uv);

  float n = Hash21(id);
  float width = .2*UV.y;

  gv.x *= sign(n-.5);
  float d = abs(abs(gv.x+gv.y)-.5);

  vec2 cUv = gv-sign(gv.x+gv.y+.001)*.5;
  d = length(cUv);
  float mask = smoothstep(.01, -.01, abs(d-.5)-width);
  float angle = atan(cUv.x, cUv.y+0.001);
  float checker = mod(id.x+id.y, 2.)*2.-1.;
  float flow = sin(u_time+checker*angle*10.);

  float x = sin(angle*checker*10.+u_time*5.)*.5+.5;
  float y = (d-(.5-width))/(2.*width);
  y = abs(y-.5)*2.;
  vec2 tUv = vec2(x, y);
  col.rg += tUv*mask;

  // if (gv.x > .48 || gv.y > .48) col = vec3(1., 0., 0.);

  gl_FragColor = vec4(col, 1.0);
}