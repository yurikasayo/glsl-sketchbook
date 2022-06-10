#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define MAX_STEPS 100
#define MAX_DIST 1000.
#define SURF_DIST .001

#define S smoothstep
#define T u_time

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
  p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float Heart(vec3 p, float size) {
  float a = atan(p.x,p.y);
  float z = min(1.,abs(p.z/size));
  float r = sqrt(1.-z*z)*size;
  float l = length(p.xy);
  p.x += l*(.1*sin(2.*a)-.2*sin(3.*a));
  // p.x *= sin(a*10.)*.1+1.;
  p.y += l*(.4*cos(2.*a)-.2*cos(3.*a));
  return length(p)-size;
}

float GetDist(vec3 p) {
  float d = sdBox(p, vec3(1));
  d = Heart(p, .1);
  
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

void main()
{
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
	vec2 m = u_mouse.xy/u_resolution.xy;

  vec3 ro = vec3(0., 0., 3.);
  ro.yz *= Rot(-m.y*3.14+1.);
  ro.xz *= Rot(-m.x*6.2831);
  
  vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
  vec3 col = vec3(0);
  
  float d = RayMarch(ro, rd);

  if(d<MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = GetNormal(p);
    vec3 r = reflect(rd, n);

    float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
    col = vec3(dif);
  }
  
  col = pow(col, vec3(.4545));	// gamma correction

  col = vec3(0.);
  float a = atan(uv.x,uv.y);
  float r = length(uv);
  uv.x = r*(sin(a)+0.4*sin(2.*a));
  // uv.xy *= sqrt(1.125+0.4*cos(a)-0.4*cos(2.*a)+0.3*cos(3.*a)+0.075*cos(4.*a)-0.06*cos(5.*a));
  // uv.x = r*(sin(a)+0.1*sin(2.*a)-0.2*sin(3.*a));
  // uv.y = r*(cos(a)+0.4*cos(2.*a)-0.2*cos(3.*a));
  col += S(.1, .09, length(uv));
  
  gl_FragColor = vec4(col,1.0);
}