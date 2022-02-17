// reference: The Art of Code "LiveCoding - The Universe Within"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define S(a, b, t) smoothstep(a, b, t)

float DistLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p-a;
  vec2 ba = b-a;
  float t = clamp(dot(pa, ba)/dot(ba, ba), 0., 1.);
  return length(pa - ba*t);
}

float N21(vec2 p) {
  p = fract(p * vec2(2414.23, 129.123));
  p += dot(p, p+12.2193);
  return fract(p.x*p.y);
}

vec2 N22(vec2 p) {
  float n = N21(p);
  return vec2(n, N21(p+n));
}

vec2 GetPos(vec2 id, vec2 offs) {
  vec2 n = N22(id+offs)*u_time;

  return sin(n)*.4 + offs;
}

float Line(vec2 p, vec2 a, vec2 b) {
  float d = DistLine(p, a, b);
  float m = S(.04, .01, d);
  float d2 = length(a-b);
  m *= S(1.2, .8, d2)+.5*S(.05, .03, abs(d2-.75));
  return m;
}

float Layer(vec2 uv) {
  vec2 gv = fract(uv)-.5;
  vec2 id = floor(uv);

  vec2 cp = GetPos(id, vec2(0.));
  vec2 tp = GetPos(id, vec2(0., 1.));
  vec2 bp = GetPos(id, vec2(0., -1.));
  vec2 rp = GetPos(id, vec2(1., 0.));
  vec2 lp = GetPos(id, vec2(-1., 0.));
  float m = 0.;

  float t = u_time*10.;
  for (float y=-1.; y<=1.; y++) {
    for (float x=-1.; x<=1.; x++) {
      vec2 p = GetPos(id, vec2(x, y));
      m += Line(gv, p, cp);

      vec2 j = (p-gv)*18.;
      float sparkle = 1./dot(j, j);
      m += sparkle*(sin(t+fract(p.x)*10.)*.5+.5);
    }
  }
  m += Line(gv, tp, rp);
  m += Line(gv, tp, lp);
  m += Line(gv, bp, rp);
  m += Line(gv, bp, lp);
  return m;
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 mouse = (u_mouse.xy/u_resolution.xy) - .5;

  float gradient = uv.y;

  float m = 0.;
  float t = u_time*.2;

  float s = sin(t);
  float c = cos(t);
  mat2 rot = mat2(c, -s, s, c);

  uv *= rot;
  mouse *= rot;
  for (float i = 0.; i < 1.; i += 1./4.){
    float z = fract(i+t);
    float size = mix(10., .5, z);
    float fade = S(0., .2, z) * S(1., .8, z);
    m += Layer(uv*size+i*20.-mouse)*fade;
  }

  vec3 base = sin(t*5.*vec3(.343, .474, .732))*.4 + .6;
  vec3 col = m*base;
  col -= gradient*base;

  gl_FragColor = vec4(col, 1.0);
}