#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define NUM_PARTICLES 75.
#define NUM_EXPLOSIONS 5.

vec2 Hash12(float t) {
  float x = fract(sin(t*391.2)*583.2);
  float y = fract(sin((t+x)*762.1)*984.6);

  return vec2(x, y);
}

vec2 Hash12_Polar(float t) {
  float a = fract(sin(t*321.2)*583.2)*6.2832;
  float d = fract(sin((t+a)*762.1)*984.6);

  return vec2(sin(a), cos(a))*d;
}

float Explosion(vec2 uv, float t) {
  float sparks = 0.;
  for (float i=0.; i<NUM_PARTICLES; i++) {
    vec2 dir = Hash12_Polar(i+1.)*.5;
    float d = length(uv-dir*t);

    float brightness = mix(.0005, .002, smoothstep(.05, 0., t));

    brightness *= sin(t*20.+i)*.5+.5;
    brightness *= smoothstep(1., .75, t);
    sparks += brightness / d;
  }
  return sparks;
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;

  vec3 col = vec3(0.);

  for (float i=0.; i<NUM_EXPLOSIONS; i++) {
    float t = u_time+i/NUM_EXPLOSIONS;
    float ft = floor(t);
    vec3 color = sin(11.*vec3(.34, .54, .43)*ft)*.25+.75;
    vec2 offs = Hash12(i+1.+ft)-.5;
    offs *= vec2(1., 1.);

    // col += .001/length(uv-offs);
    col += Explosion(uv-offs, fract(t)) * color;
  }
  col *= 2.;

  gl_FragColor = vec4(col, 1.0);
}