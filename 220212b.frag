// reference: The Art of Code "Calculating Ray-Sphere Intersections"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float remap01 (float a, float b, float t) {
  return (t-a) / (b-a);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * u_resolution.xy) / u_resolution.y;
  
  vec3 col = vec3(0.);

  vec3 ro = vec3(0.);
  vec3 rd = normalize(vec3(uv.x, uv.y, 1.));

  vec3 s = vec3(0., 0., 4.);
  float r = 1.;

  float t = dot(s-ro, rd);
  vec3 p = ro + rd*t;

  float y = length(s-p);

  if (y < r) {
    float x = sqrt(r*r - y*y);
    float t1 = t - x;
    float t2 = t + x;

    float c = remap01(s.z, s.z-r, t1);
    col = vec3(c);
  } else {
    
  }

  gl_FragColor = vec4(col, 1.0);
}