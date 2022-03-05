// reference: The Art of Code "Shader Coding: Over the Moon"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define S(a, b, t) smoothstep(a, b, t)

float TaperBox(vec2 p, float wb, float wt, float yb, float yt, float blur) {
  float m = S(-blur, blur, p.y-yb);
  m *= S(blur, -blur, p.y-yt);

  p.x = abs(p.x);

  float w = mix(wb, wt, (p.y-yb) / (yt-yb));
  m *= S(blur, -blur, p.x-w);

  return m;
}

vec4 Tree(vec2 uv, vec3 col, float blur) {
  float m = TaperBox(uv, .03, .03, -.05, .25, blur);
  m += TaperBox(uv, .2, .1, .25, .5, blur);
  m += TaperBox(uv, .15, .05, .5, .75, blur);
  m += TaperBox(uv, .1, .0, .75, 1., blur);

  float shadow = TaperBox(uv-vec2(.2, .0), .1, .5, .15, .25, blur);
  shadow += TaperBox(uv+vec2(.25, .0), .1, .5, .45, .5, blur);
  shadow += TaperBox(uv+vec2(.25, .0), .1, .5, .7, .75, blur);
  col -= shadow*.8;
  return vec4(col, m);
}

float GetHeight(float x) {
  return sin(x*.423)+sin(x)*.3;
}

vec4 Layer(vec2 uv, float blur) {
  vec4 col = vec4(0.);

  float id = floor(uv.x);
  float n = fract(sin(id*192.518)*1298.32)*2.-1.;
  float x = n*.3;;
  float y = GetHeight(uv.x);
  float ground = S(blur, -blur, uv.y+y);
  col += ground;

  y = GetHeight(id+.5+x);

  uv.x = fract(uv.x)-.5;
  vec4 tree = Tree((uv-vec2(x, -y))*vec2(1., 1.+n*.2), vec3(1.), blur);

  col = mix(col, tree, tree.a);
  col.a = max(ground, tree.a);
  return col;
}

float Hash21(vec2 p) {
  p = fract(p*vec2(531.144, 241.124));
  p += dot(p, p+919.124);
  return fract(p.x+p.y);
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 M = (u_mouse.xy/u_resolution.xy)*2.-1.;

  float t = u_time*.3;
  float blur = .005;

  vec3 col = vec3(0.);

  float twinkle = dot(length(sin(uv+t)), length(cos(uv*vec2(22., 6.7)-t*3.)));
  twinkle = sin(twinkle*10.)*.5+.5;
  float stars = pow(Hash21(uv), 1000.)*twinkle;
  col += stars;

  float moon = S(.01, -.01, length(uv-vec2(.4, .2))-.15);
  col *= 1.-moon;
  moon *= S(-.01, .1, length(uv-vec2(.5, .25))-.15);
  col += moon;

  vec4 layer;
  for (float i=0.; i<1.; i+=1./10.) {
    float scale = mix(30., 1., i);
    blur = mix(.05, .005, i);
    layer = Layer(uv*scale+vec2(t+i*100.,0)-M, blur);
    layer.rgb *= (1.-i)*vec3(.9, .9, 1.);
    col = mix(col, layer.rgb, layer.a);
  }
  layer = Layer(uv+vec2(t, 0)-M, .1);

  col = mix(col, layer.rgb*.1, layer.a);

  float thickness = 1./u_resolution.y;
  // if (abs(uv.x)<thickness) col.g = 1.;
  // if (abs(uv.y)<thickness) col.r = 1.;

  gl_FragColor = vec4(col, 1.0);
}