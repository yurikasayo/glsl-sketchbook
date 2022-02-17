#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

vec2 N22(vec2 p) {
  vec3 a = fract(p.xyx*vec3(123.34, 234.34, 345.65));
  a += dot(a, a+34.45);
  return fract(vec2(a.x*a.y, a.y*a.z));
}

void main(){
  vec2 uv = (2.*gl_FragCoord.xy-u_resolution.xy) / u_resolution.y;

  float t = u_time;

  float minDist = 100.;
  if (false) {
    for (float i=0.; i<50.; i++) {
      vec2 n = N22(vec2(i));
      vec2 p = sin(n*t);

      float d = length(uv-p);

      if (d<minDist) {
        minDist = d;
      }
    }
  } else {
    uv *= 3.;
    vec2 gv = fract(uv)-.5;
    vec2 id = floor(uv);

    for (float y = -1.; y <= 1.; y++) {
      for (float x = -1.; x <= 1.; x++) {
        vec2 offs = vec2(x, y);
        vec2 n = N22(id+offs);
        vec2 p = offs + sin(n*t)*.5;

        float d = length(gv-p);

        if (d<minDist) {
          minDist = d;
        }
      }
    }
  }

  vec3 col = vec3(minDist);

  gl_FragColor = vec4(col, 1.0);
}