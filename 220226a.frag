// reference: The Art of Code "Hexagonal Tiling Explained!"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float HexDict(vec2 p){
  p = abs(p);

  float c = dot(p, normalize(vec2(1., 1.73)));
  c = max(c, p.x);

  return c;
}

vec4 HexCoords(vec2 uv) {
  vec2 r = vec2(1., 1.73);
  vec2 h = r*.5;

  vec2 a = mod(uv, r)-h;
  vec2 b = mod(uv-h, r)-h;

  vec2 gv;
  if (length(a)<length(b))
    gv = a;
  else
    gv = b;

  float x = atan(gv.x, gv.y);
  float y = .5 - HexDict(gv);
  vec2 id = uv-gv;
  return vec4(x, y, id.x, id.y);
} 

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;

  vec3 col = vec3(0.);

  uv *= 10.;

  vec4 hc = HexCoords(uv+100.);

  float c = smoothstep(.01, .03, hc.y * sin(hc.z*hc.w+u_time));

  col += c;

  gl_FragColor = vec4(col, 1.0);
}