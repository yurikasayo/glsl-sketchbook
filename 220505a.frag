// reference: "Live Coding and Alien Orb" by The Art of Code

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
#define T u_time*.2
#define TAU 6.283185

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
  p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float BallGyroid(vec3 p) {
  p.yz *= Rot(T);
  p *= 10.;
  return abs(0.7*dot(sin(p), cos(p.yzx))/10.)-.03;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5+0.5*(b-a)/k, 0., 1.);
  return mix(b, a, h) - k*h*(1.-h);
}

float GetDist(vec3 p) {
  float ball = length(p)-1.;
  ball = abs(ball)-.03;
  float g = BallGyroid(p);

  ball = smin(ball, g, -0.03);

  float ground = p.y+1.;
  p.z += T;
  p *= 5.;
  p.y += sin(p.z)*.5;
  float y = dot(sin(p), cos(p.yzx)) * .1;
  ground += y;

  float d = min(ball, ground);
  
  return d;
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

float Hash21(vec2 p) {
  p = fract(p*vec2(123.34,234.53));
  p += dot(p, p+23.4);
  return fract(p.x*p.y);
}

float Glitter(vec2 p, float a) {
  p *= 10.;
  vec2 id = floor(p);
  p = fract(p)-.5;
  float n = Hash21(id);

  float d = length(p);
  float m = S(.5*n,.0,d);

  m *= pow(sin(a+fract(n*10.)*TAU)*.5+.5, 100.);
  return m;
}

vec3 RayPlane(vec3 ro, vec3 rd, vec3 p, vec3 n) {
  float t = max(0., dot(p-ro, n)/dot(rd, n));
  return ro + rd*t;
}

void main()
{
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
	vec2 m = u_mouse.xy/u_resolution.xy;
  float cds = dot(uv, uv);

  vec3 ro = vec3(0, 3, -3)*.6;
  ro.yz *= Rot(-m.y*3.14+1.);
  ro.y = max(-.9, ro.y);
  ro.xz *= Rot(-m.x*6.2831+T*.2);
  
  vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
  vec3 col = vec3(0);
  
  float d = RayMarch(ro, rd);

  if(d<MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = GetNormal(p);
    vec3 r = reflect(rd, n);
    vec3 lightDir = -normalize(p);
    float dif = dot(n, lightDir)*.5+.5;
    float cd = length(p);

    col = vec3(dif);

    if(cd > 1.035) {
      // col *= vec3(1, 0, 0);
      float s = BallGyroid(-lightDir);
      float w = cd*.01;
      float shadow = S(-w, w, s);
      col *= shadow;

      p.z -= T;
      col += Glitter(p.xz*5., dot(ro,vec3(2))-T*4.)*4.*shadow;
      col /= cd*cd;
    } else {
      float sss = S(.05, .0, cds);
      sss *= sss;

      float s = BallGyroid(p+sin(p*10.+T)*.02);
      sss *= S(-.03, 0., s);
      col += sss*vec3(1., .1, .2);
    }
  }

  float light = .003/cds;
  vec3 lightCol = vec3(1., .8, .7);
  col += light*S(.0,.5,d-2.)*lightCol;
  float s = BallGyroid(normalize(ro));
  col += light*S(.0, .03, s)*lightCol;

  uv *= Rot(T);
  vec3 pp = RayPlane(ro, rd, vec3(0.), normalize(ro));
  float sb = BallGyroid(normalize(pp));
  sb *= S(.0, .4, cds);
  col += max(0.,sb*2.);

  col = pow(col, vec3(.4545));	// gamma correction
  col *= 1.-cds*.7;
  
  gl_FragColor = vec4(col,1.0);
}