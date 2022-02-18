// reference: The Art of Code "Ray Marching Simple Shapes"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab = b-a;
  vec3 ap = p-a;

  float t = dot(ab, ap) / dot(ab, ab);
  t = clamp(t, 0., 1.);

  vec3 c = a + t*ab;

  return length(p-c)-r;
}

float sdTorus(vec3 p, vec2 r) {
  float x = length(p.xz)-r.x;
  return length(vec2(x, p.y))-r.y;
}

float sdBox(vec3 p, vec3 s) {
  return length(max(abs(p)-s, 0.));
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab = b-a;
  vec3 ap = p-a;

  float t = dot(ab, ap) / dot(ab, ab);
  //t = clamp(t, 0., 1.);

  vec3 c = a + t*ab;
  float x = length(p-c)-r;
  float y = (abs(t-.5)-.5)*length(ab);
  float e = length(max(vec2(x, y), 0.));
  float i = min(max(x, y), 0.);

  return e+i;
}

float GetDist(vec3 p) {
  vec4 s = vec4(0., 1., 6., 1.);

  float sphereDist = length(p-s.xyz)-s.w;
  float planeDist = p.y;
  
  float cd = sdCapsule(p, vec3(0., 1., 6.), vec3(1., 2., 6.), .2);
  float td = sdTorus(p-vec3(0., .5, 6.), vec2(1., .3));
  float bd = sdBox(p-vec3(-2., .5, 6.), vec3(.5));
  float cyld = sdCylinder(p, vec3(0., .3, 4.), vec3(2., .3, 5.), .3);

  float d = min(cd, planeDist);
  d = min(d, td);
  d = min(d, bd);
  d = min(d, cyld);
  return d;
}

float RayMarch(vec3 ro, vec3 rd) {
  float dO = 0.;
  for(int i=0; i<MAX_STEPS; i++) {
    vec3 p = ro + dO*rd;
    float dS = GetDist(p);
    dO += dS;
    if (dS<SURF_DIST || dO>MAX_DIST) break;
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
  vec3 lightPos = vec3(0., 5., 6.);
  lightPos.xz += vec2(sin(u_time), cos(u_time))*3.;
  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);

  float dif = clamp(dot(n, l), 0., 1.);
  float d = RayMarch(p+n*SURF_DIST*2., l);
  if (d<length(lightPos-p)) dif *= .1;
  return dif;
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;

  vec3 col = vec3(0.);

  vec3 ro = vec3(0., 2., 0.);
  vec3 rd = normalize(vec3(uv.x, uv.y-.2, 1.));
  
  float d = RayMarch(ro, rd);

  vec3 p = ro + rd * d;

  float dif = GetLight(p);
  col = vec3(dif);

  gl_FragColor = vec4(col, 1.);
}