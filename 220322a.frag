// reference: The Art of Code : "Shader Coding: Feathers is the Wind"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define S smoothstep
#define T u_time

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

vec3 Transform(vec3 p, float angle) {
  p.xz *= Rot(angle);
  p.xy *= Rot(angle * .7);
  return p;
}

float Feather(vec2 p) {
  float d = length(p-vec2(0.,clamp(p.y, -.3, .3)));
  float r = mix(.1, .01, S(-.3, .3, p.y));
  float m = S(.01, .0, d-r);

  float side = sign(p.x);
  float x = .9*abs(p.x)/r;
  float wave = (1.-x)*sqrt(x) + x*(1.-sqrt(1.-x));
  float y = (p.y-wave*.2)*80.+side*72.;
  float id = floor(y);
  float n = fract(sin(id*276.12)*129.32);
  float shade = mix(.7, 1., n);

  float strandLength = mix(.7, 1., fract(n*n*53.));
  float strand = S(.3, .0, abs(fract(y)-.5)-.35);
  strand *= S(.1, -.2, x-strandLength);

  d = length(p-vec2(0.,clamp(p.y, -.45, .1)));
  float stem = S(.01, .0, d+p.y*.025);

  return max(strand*m*shade, stem);
}

vec4 FeatherBall(vec3 ro, vec3 rd, vec3 pos, float angle) {
  vec4 col = vec4(0.);

  float t = dot(pos-ro, rd);
  vec3 p = ro + rd * t;
  float y = length(pos-p);

  if (y<1.) {
    float x = sqrt(1.-y);

    vec3 pF = ro + rd * (t-x) - pos;
    pF = Transform(pF, angle);
    vec2 uvF = vec2(atan(pF.x, pF.z), pF.y);
    uvF *= vec2(.25, .5);
    float f = Feather(uvF);
    vec4 front = vec4(vec3(f), S(0., 1., f));

    vec3 pB = ro + rd * (t+x) - pos;
    pB = Transform(pB, angle);
    vec2 uvB = vec2(atan(pB.x, pB.z), pB.y);
    uvB *= vec2(.25, .5);
    float b = Feather(uvB);
    vec4 back = vec4(vec3(b), S(0., 1., b));

    col = mix(back, front, front.a);
  }

  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 M = u_mouse.xy/u_resolution.xy;

  vec3 bg = vec3(.2, .2, .9)*(uv.y+.5);
  bg += vec3(1., .5, .0);
  vec4 col = vec4(bg, 0.);

  vec3 ro = vec3(0., 0., -3.);
  vec3 rd = normalize(vec3(uv, 1.));

  for (float i=0.; i<1.; i+=1./50.){
    float x = mix(-8., 8., fract(i+T*.1))+M.x;
    float y = mix(-2., 2., fract(sin(i*391.21)*217.21))+M.y;
    float z = mix(5., 0., i);
    float a = T+i*672.21;

    vec4 feather = FeatherBall(ro, rd, vec3(x, y, z), a);

    feather.rgb = mix(bg, feather.rgb, mix(.3, 1., i));
    feather.rgb = sqrt(feather.rgb);
    col = mix(col, feather, feather.a);
  }

  col = pow(col, vec4(.4545));

  gl_FragColor = vec4(col.rgb, 1.0);
}