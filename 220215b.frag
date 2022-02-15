#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float N21(vec2 p) {
  return fract(sin(p.x*100.+p.y*654.)*5647.);
}

float SmoothNoise(vec2 uv) {
  vec2 lv = fract(uv);
  vec2 id = floor(uv);

  lv = lv*lv*(3.-2.*lv);
  float bl = N21(id);
  float br = N21(id+vec2(1., 0.));
  float b = mix(bl, br, lv.x);

  float tl = N21(id+vec2(0., 1.));
  float tr = N21(id+vec2(1., 1.));
  float t = mix(tl, tr, lv.x);

  return mix(b, t, lv.y);
}

float SmoothNoise2(vec2 uv) {
  float c = SmoothNoise(uv*4.);
  c += SmoothNoise(uv*8.)*.5;
  c += SmoothNoise(uv*16.)*.25;
  c += SmoothNoise(uv*32.)*.125;
  c += SmoothNoise(uv*64.)*.0625;

  return c / 2.;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  float c = SmoothNoise2(uv+u_time*.1);
  vec3 col = vec3(c);
  
  //col.rg = lv;

  gl_FragColor = vec4(col, 1.);
}