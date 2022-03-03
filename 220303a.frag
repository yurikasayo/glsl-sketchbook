// reference: The Art of Code "Sheder Coding: Ray Marching Tips & Tricks"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .001

mat2 Rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
  float h = clamp(.5+.5*(b-a)/k, 0., 1.);
  return mix(b, a, h) - k*h*(1.-h);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab = b-a;
  vec3 ap = p-a;

  float t = dot(ab, ap) / dot(ab, ab);
  t = clamp(t, 0., 1.);

  vec3 c = a + t*ab;

  return length(p-c)-r;
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab = b-a;
  vec3 ap = p-a;

  float t = dot(ab, ap) / dot(ab, ab);

  vec3 c = a + t*ab;
  float x = length(p-c)-r;
  float y = (abs(t-.5)-.5)*length(ab);
  float e = length(max(vec2(x, y), 0.));
  float i = min(max(x, y), 0.);

  return e+i;
}

float sdTorus(vec3 p, vec2 r) {
  float x = length(p.xz)-r.x;
  return length(vec2(x, p.y))-r.y;
}

float sdBox(vec3 p, vec3 s) {
  p = abs(p)-s;
  return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}


float GetDist(vec3 p) {
  // float plane = dot(p, normalize(vec3(0, 1, 0)));
  float plane = p.y;

  vec3 bp = p-vec3(0., 1., 0.);
  // bp.z += sin(bp.x*5.+u_time*3.)*.1;  // flag wave

  bp.x = abs(bp.x);  // mirror
  bp.x -= 1.;

  // vec3 n = normalize(vec3(1., 1., 1.));
  // bp -= 2.*n*min(0., dot(p, n));

  float t = smoothstep(.2, .5, abs(0.5-fract(u_time*.2)));
  float scale = mix(1., 1.+3.*t, smoothstep(-1., 1., bp.y));
  bp.xz *= scale;

  bp.xz *= Rot(smoothstep(-1., 1., bp.y*t)*3.14);
  float box = sdBox(bp, vec3(1., 1., 1.)) / scale;

  box -= sin(p.z*10.+u_time*3.)*.05; // displacement mapping
  box = abs(box)-.1; // shell

  // float d = max(plane, box);
  float d = min(plane, box*.5);
  // float d = box;

  return d;
}

float RayMarch(vec3 ro, vec3 rd) {
  float dO = 0.;
  for(int i=0; i<MAX_STEPS; i++) {
    vec3 p = ro + dO*rd;
    float dS = GetDist(p);
    dO += dS;
    if (abs(dS)<SURF_DIST || dO>MAX_DIST) break;
  }
  return dO;
}

vec3 GetNormal(vec3 p) {
  float d = GetDist(p);
  vec2 e = vec2(.01, .0);

  vec3 n = d - vec3(
    GetDist(p-e.xyy),
    GetDist(p-e.yxy),
    GetDist(p-e.yyx));

  return normalize(n);
}

float GetLight(vec3 p) {
  vec3 lightPos = vec3(3., 5., 4.);
  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);

  float dif = clamp(dot(n, l)*.5+.5, 0., 1.);
  float d = RayMarch(p+n*SURF_DIST*2., l);
  if (p.y<.01 && d<length(lightPos-p)) dif *= .5;
  return dif;
}

vec3 R(vec2 uv, vec3 p, vec3 l, float z) {
  vec3 f = normalize(l-p),
    r = normalize(cross(vec3(0., 1., 0.), f)),
    u = cross(f, r),
    c = p + f * z,
    i = c + uv.x*r + uv.y*u,
    d = normalize(i-p);
  return d;
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 m = u_mouse.xy / u_resolution.xy;

  vec3 col = vec3(0.);

  vec3 ro = vec3(0., 4., -5.);
  ro.yz *= Rot(-m.y*4.);
  ro.xz *= Rot(-m.x);

  vec3 rd = R(uv, ro, vec3(0.), .7);
  
  float d = RayMarch(ro, rd);

  if(d<MAX_DIST) {
    vec3 p = ro + rd * d;

    float dif = GetLight(p);
    col = vec3(dif);
  }

  col = pow(col, vec3(.4545));

  gl_FragColor = vec4(col, 1.);
}