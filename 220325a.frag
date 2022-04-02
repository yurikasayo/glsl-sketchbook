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

#define S smoothstep
#define T iTime

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
  p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float sdBox2d(vec2 p, vec2 s) {
  p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, p.y), 0.);
}


float GetDist(vec3 p) {
  float r1 = 1.5;
  float r2 = .2;
  vec2 cp = vec2(length(p.xz)-r1, p.y);
  float a = atan(p.x, p.z);
  cp *= Rot(a*2.5+u_time);
  cp.y = abs(cp.y)-.4;

  float d = length(cp)-r2;
  d = sdBox2d(cp, vec2(.1, .2*(sin(2.*a)*.5+.5)))-.1;
  
  return d*.7;
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    
  for(int i=0; i<MAX_STEPS; i++) {
    vec3 p = ro + rd*dO;
    float dS = GetDist(p);
    dO += dS;
    if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
  }
  
  return dO;
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p);
  vec2 e = vec2(.001, 0);
  
  vec3 n = d - vec3(
    GetDist(p-e.xyy),
    GetDist(p-e.yxy),
    GetDist(p-e.yyx));
  
  return normalize(n);
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
  vec3 f = normalize(l-p),
    r = normalize(cross(vec3(0,1,0), f)),
    u = cross(f,r),
    c = f*z,
    i = c + uv.x*r + uv.y*u,
    d = normalize(i);
  return d;
}

vec3 Bg(vec3 rd) {
  float k = rd.y*.5+.5;

  vec3 col = mix(vec3(.2, .1, .1), vec3(.2, .5, 1.), k);
  return col;
}

void main()
{
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
	vec2 m = u_mouse.xy/u_resolution.xy;

  vec3 ro = vec3(0, 3, -3);
  ro.yz *= Rot(-m.y*3.14+1.);
  ro.xz *= Rot(-m.x*6.2831);
  
  vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
  vec3 col = Bg(rd);
  
  float d = RayMarch(ro, rd);

  if(d<MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = GetNormal(p);
    vec3 r = reflect(rd, n);

    float spec = pow(max(0., r.y), 20.);
    float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
    col = mix(Bg(r), vec3(dif), 0.5)+spec;
  }
  
  col = pow(col, vec3(.4545));	// gamma correction
  
  gl_FragColor = vec4(col,1.0);
}