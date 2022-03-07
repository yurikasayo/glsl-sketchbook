#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

#define NUM_LAYERS 8.

mat2 Rot(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, -s, s, c);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = .05/d;
  
  float rays = max(0., 1.-abs(uv.x*uv.y*1000.));
  m += rays*flare;
  uv *= Rot(3.1415/4.);
  rays = max(0., 1.-abs(uv.x*uv.y*1000.));
  m += rays*.3*flare;

  m *= smoothstep(1., .2, d);
  return m;
}

float Hash21(vec2 p) {
  p = fract(p*vec2(123.34, 456.21));
  p += dot(p, p+45.32);
  return fract(p.x*p.y);
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.);

  vec2 gv = fract(uv)-.5;
  vec2 id = floor(uv);

  for (float y=-1.; y<=1.; y++) {
    for (float x=-1.; x<=1.; x++) {
      vec2 offs = vec2(x, y);

      float n = Hash21(id+offs);
      float size = fract(n*345.32);

      float star = Star(gv-offs-vec2(n, fract(n*34.))+.5, smoothstep(.9, 1., size));
      vec3 color = sin(vec3(.2, .3, .9)*fract(n*2345.2)*123.2)*.5+.5;
      color = color*vec3(1., .5, 1.+size);

      star *= sin(u_time*3.+n*6.2831)*.5+1.;
      col += star*size*color;
    }
  }

  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  vec2 mouse = (u_mouse.xy-u_resolution.xy*.5)/u_resolution.y;
  float t = u_time*.05;

  uv += mouse * .4;

  uv *= Rot(t);
  vec3 col = vec3(0.);

  for (float i=0.; i<1.; i+=1./NUM_LAYERS) {
    float depth = fract(i+t);

    float scale = mix(20., .5, depth);
    float fade = depth*smoothstep(1., .9, depth);
    col += StarLayer(uv*scale+i*287.32-mouse)*fade;
  }
  // if (gv.x>.48 || gv.y>.48) col.r=1.;

  gl_FragColor = vec4(col, 1.0);
}