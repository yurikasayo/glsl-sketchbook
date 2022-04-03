// reference: The Art of Code: "Newtons Cradle"

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

const int MAT_BASE=1;
const int MAT_BARS=2;
const int MAT_BALL=3;
const int MAT_LINE=4;

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
  p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}

float sdBox(vec2 p, vec2 s) {
  p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, p.y), 0.);
}

float sdLineSeg(vec3 p, vec3 a, vec3 b) {
  vec3 ap=p-a, ab=b-a;
  float t = clamp(dot(ap, ab)/dot(ab, ab), 0., 1.);
  vec3 c = a + ab*t;

  return length(p-c);
}

vec2 sdBall(vec3 p, float a) {
  p.y-=1.01;
  p.xy *= Rot(a);
  p.y+=1.01;

  float ball = length(p)-.15;
  float ring = length(vec2(length(p.xy-vec2(0., .15))-.03, p.z))-.01;
  ball = min(ball, ring);
  
  p.z = abs(p.z);
  float line = sdLineSeg(p, vec3(0., .15, .0), vec3(-0., 1.01, .4))-.005;

  float d = min(ball, line);

  return vec2(d, d==ball?MAT_BALL:MAT_LINE);
}

float GetDist(vec3 p) {
  float base = sdBox(p, vec3(1,.1,.5))-.1;
  float bar = length(vec2(sdBox(p.xy, vec2(.8, 1.4))-.15, abs(p.z)-.4))-.04;

  float 
    a = sin(u_time*2.),
    a1 = min(0., a),
    a5 = max(0., a);

  float 
    b1 = sdBall(p-vec3(.6, .5, .0), a1).x,
    b2 = sdBall(p-vec3(.3, .5, .0), (a+a1)*.05).x,
    b3 = sdBall(p-vec3(.0, .5, .0), a*.05).x,
    b4 = sdBall(p-vec3(-.3, .5, .0), (a+a5)*.05).x,
    b5 = sdBall(p-vec3(-.6, .5, .0), a5).x;

  float balls = min(b1, min(b2, min(b3, min(b4, b5))));

  float d = min(base, bar);
  d = min(d, balls);

  d = max(d, -p.y);   // cut off the bottom
  
  return d;
}

vec2 Min(vec2 a, vec2 b) {
  return a.x<b.x ? a : b;
}

int GetMat(vec3 p) {
  float base = sdBox(p, vec3(1,.1,.5))-.1;
  float bar = length(vec2(sdBox(p.xy, vec2(.8, 1.4))-.15, abs(p.z)-.4))-.04;

  float 
    a = sin(u_time*2.),
    a1 = min(0., a),
    a5 = max(0., a);

  vec2 
    b1 = sdBall(p-vec3(.6, .5, .0), a1),
    b2 = sdBall(p-vec3(.3, .5, .0), (a+a1)*.05),
    b3 = sdBall(p-vec3(.0, .5, .0), a*.05),
    b4 = sdBall(p-vec3(-.3, .5, .0), (a+a5)*.05),
    b5 = sdBall(p-vec3(-.6, .5, .0), a5);

  vec2 balls = Min(b1, Min(b2, Min(b3, Min(b4, b5))));

  float d = min(base, bar);
  d = min(d, balls.x);

  base = max(base, -p.y);
  d = max(d, -p.y);   // cut off the bottom
  
  int mat = 0;
  if (d==base)
    mat = MAT_BASE;
  else if (d==bar)
    mat = MAT_BARS;
  else if (d==balls.x)
    mat = int(balls.y);

  return mat;
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

  vec3 ro = vec3(0, 3, -3);
  ro.yz *= Rot(-m.y*3.14+1.);
  ro.xz *= Rot(-m.x*6.2831);
  
  vec3 rd = GetRayDir(uv, ro, vec3(0,0.75,0), 1.5);
  vec3 col = vec3(0);
  
  float d = RayMarch(ro, rd);

  if(d<MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = GetNormal(p);
    vec3 r = reflect(rd, n);

    float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
    col = vec3(dif);

    int mat = GetMat(p);
    if (mat==MAT_BASE)
      col *= .1;
    else if (mat==MAT_BARS)
      col *= vec3(0., 0., 1.);
    else if (mat==MAT_BALL)
      col *= vec3(1., 0., 0.);
    else if (mat==MAT_LINE)
      col *= .05;
  }
  
  col = pow(col, vec3(.4545));	// gamma correction
  
  gl_FragColor = vec4(col,1.0);
}