// reference: The Art of Code "The Drive Home"

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define S(a, b, t) smoothstep(a, b, t)


float N(float t) {
  return fract(sin(t * 3456.)*6547.);
}

vec4 N14(float t) {
  return fract(sin(t * vec4(123., 1024., 3456., 9546)*vec4(6547., 124., 2879., 1267.)));
}

struct ray {
  vec3 o, d;
};

  ray GetRay(vec2 uv, vec3 camPos, vec3 lookat, float zoom) {
    ray a;
    a.o = camPos;

    vec3 f = normalize(lookat-camPos);
    vec3 r = cross(vec3(0, 1, 0), f);
    vec3 u = cross(f, r);
    vec3 c = a.o + f * zoom;
    vec3 i = c + uv.x * r + uv.y * u;

    a.d = normalize(i-a.o);

    return a;
  }

vec3 ClosestPoint(ray r, vec3 p) {
  return r.o + max(0., dot(p-r.o, r.d))*r.d;
}

float DistRay(ray r, vec3 p) {
  return length(p-ClosestPoint(r, p));
}

float Bokeh(ray r, vec3 p, float size, float blur) {
  float d = DistRay(r, p);

  size *= length(p);
  float c = S(size, size * (1.-blur), d);
  c *= mix(.6, 1., S(size*.8, size, d));

  return c;
}

vec3 Streetlights(ray r, float t) {
  float side = step(r.d.x, 0.);
  r.d.x = abs(r.d.x);
  const float s = 1./10.;
  float m = 0.;
  for (float i=0.; i<1.; i+=s) {
    float ti = fract(t+i+side*s*.5);
    vec3 p = vec3(2., 2., 100.-ti*100.);
    m += Bokeh(r, p, .05, .1)*ti*ti*ti;
  }

  return vec3(1., .7, .3) * m;
}

vec3 Headlights(ray r, float t) {
  t *= 2.;

  float w1 = .25;
  float w2 = w1 * 1.2;
  const float s = 1./10.;
  float m = 0.;
  for (float i=0.; i<1.; i+=s) {

    float n = N(i);

    if (n > .1) continue;

    float ti = fract(t+i);
    float z = 100.-ti*100.;
    float fade = ti * ti * ti * ti * ti;
    float focus = S(.9, 1., ti);

    float size = mix(.05, .03, focus);

    m += Bokeh(r, vec3(-1.-w1, .15, z), size, .1)*fade;
    m += Bokeh(r, vec3(-1.+w1, .15, z), size, .1)*fade;

    m += Bokeh(r, vec3(-1.-w2, .15, z), size, .1)*fade;
    m += Bokeh(r, vec3(-1.+w2, .15, z), size, .1)*fade;

    float ref = 0.;
    ref += Bokeh(r, vec3(-1.-w2, -.15, z), size*3., 1.)*fade;
    ref += Bokeh(r, vec3(-1.+w2, -.15, z), size*3., 1.)*fade;

    m += ref * focus;
  }

  return vec3(.9, .9, 1.) * m;
}

vec3 Taillights(ray r, float t) {
  t += .25;

  float w1 = .25;
  float w2 = w1 * 1.2;
  const float s = 1./15.;
  float m = 0.;
  for (float i=0.; i<1.; i+=s) {

    float n = N(i);

    if (n > .5) continue;

    float lane = step(.25, n);

    float ti = fract(t+i);
    float z = 100.-ti*100.;
    float fade = ti * ti * ti * ti * ti;
    float focus = S(.9, 1., ti);

    float size = mix(.05, .03, focus);
    float laneShift = S(1., .96, ti);
    float x = 1.5 - lane * laneShift;

    float blink = step(0., sin(t*1000.)) * 7. * lane * step(.96, ti);
    m += Bokeh(r, vec3(x-w1, .15, z), size, .1)*fade;
    m += Bokeh(r, vec3(x+w1, .15, z), size, .1)*fade;

    m += Bokeh(r, vec3(x-w2, .15, z), size, .1)*fade;
    m += Bokeh(r, vec3(x+w2, .15, z), size, .1)*fade*(1.+blink);

    float ref = 0.;
    ref += Bokeh(r, vec3(x-w2, -.15, z), size*3., 1.)*fade;
    ref += Bokeh(r, vec3(x+w2, -.15, z), size*3., 1.)*fade*(1.+blink*.1);

    m += ref * focus;
  }

  return vec3(1., .1, .03) * m;
}

vec3 Envlights(ray r, float t) {
  float side = step(r.d.x, 0.);
  r.d.x = abs(r.d.x);
  const float s = 1./10.;

  vec3 c = vec3(0.);

  for (float i=0.; i<1.; i+=s) {
    float ti = fract(t+i+side*s*.5);

    vec4 n = N14(i + side*100.);

    float fade = ti*ti*ti;

    float occlusion = sin(ti*6.28*10.*n.x)*.5+.5;

    fade = occlusion;

    float x = mix(2.5, 10., n.x);
    float y = mix(.1, 1.5, n.y);
    vec3 p = vec3(x, y, 50.-ti*50.);

    vec3 col = n.wzy;
    c += Bokeh(r, p, .05, .1)*fade*col*.5;
  }

  return c;
}

vec2 Rain(vec2 uv, float t) {

  t *= 40.;

  vec2 a = vec2(3., 1.);
  vec2 st = uv*a;

  vec2 id = floor(st);
  st.y += t*.22;

  float n = fract(sin((id.x*76.34)*1212.12));
  st.y += n;
  uv.y += n;
  id = floor(st);
  st = fract(st)-.5;

  t += sin(fract(id.x*76.34+id.y*124.82)*1212.12)*6.213;
  float y = -sin(t+sin(t+sin(t)*.5))*.43;
  vec2 p1 = vec2(0., y);
  vec2 o1 = (st-p1)/a;
  float d = length(o1);

  float m1 = S(.07, .0, d);

  vec2 o2 = (fract(uv*a.x*vec2(1., 2.))-.5)/vec2(1., 2.);
  d = length(o2);

  float m2 = S(.3*(.5-st.y), .0, d)*S(-.1, .1, st.y-p1.y);
  //if (st.x > .46 || st.y > .49) m1 = 1.;

  return vec2(m1*o1*30.+m2*o2*30.);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv.x *= u_resolution.x / u_resolution.y;

  vec2 m = u_mouse.xy / u_resolution.xy;

  float t = u_time * .05 + m.x;

  vec3 camPos = vec3(.5, .2, 0.);
  vec3 lookat = vec3(.5, .2, 1.); 

  vec2 rainDistort = Rain(uv*5., t)*.5;
  rainDistort += Rain(uv*7., t)*.5;

  uv.x += sin(uv.y*40.)*.005;
  uv.y += sin(uv.x*40.)*.005;
  ray r = GetRay(uv+rainDistort, camPos, lookat, 1.8);

  vec3 col = Streetlights(r, t);
  col += Headlights(r, t);
  col += Taillights(r, t);
  col += Envlights(r, t);

  col += (r.d.y+.25)*vec3(.2, .1, .5);

  gl_FragColor = vec4(col, 1.);
}