// reference : The Art of Code "ShaderToy Tutorial"

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

float Circle(vec2 uv, vec2 p, float r, float blur) {
  float d = length(uv-p);
  float c = smoothstep(r, r-blur, d);

  return c;
}

float Band(float t, float start, float end, float blur) {
  float step1 = smoothstep(start-blur, start+blur, t);
  float step2 = smoothstep(end+blur, end-blur, t);

  return step1 * step2;
}

float Rect(vec2 uv, float left, float right, float bottom, float top, float blur) {
  float band1 = Band(uv.x, left, right, blur);
  float band2 = Band(uv.y, bottom, top, blur);

  return band1 * band2;
}

float Smiley(vec2 uv, vec2 p, float size) {
  uv -= p;
  uv *= size;

  float mask = Circle(uv, vec2(0.), .4, .01);

  mask -= Circle(uv, vec2(-.13, .2), .07, .01);
  mask -= Circle(uv, vec2(.13, .2), .07, .01);

  float mouth = Circle(uv, vec2(0.), .3, .02);
  mouth -= Circle(uv, vec2(0., .1), .3, .02);

  mask -= mouth;

  return mask;
}
float remap01(float a, float b, float t) {
  return (t-a) / (b-a);
}
float remap(float a, float b, float c, float d, float t) {
  return remap01(a, b, t) * (d-c) + c;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  uv.x *= u_resolution.x / u_resolution.y;
  
  vec3 col = vec3(0.);

  //float mask = Smiley(uv, vec2(0.), 2.);
  float mask = 0.;

  uv *= 1.4;
  float x = uv.x;
  float m = (x - .5) * (x + .5);
  m = m * m * 4.;
  m = sin(x*8.+u_time)*.1;
  float y = uv.y - m;

  float blur = remap(-.5, .5, .01, .25, x);
  blur = pow(blur*4., 3.);
  mask = Rect(vec2(x, y), -.5, .5, -.1, .1, blur);

  col = vec3(.8, 1., 1.) * mask;
  
  gl_FragColor = vec4(col, 1.0);
}