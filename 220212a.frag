// reference: The Art of Code "Using Polar Coordinates to create art."

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * u_resolution.xy) / u_resolution.y;
  vec2 st = vec2(atan(uv.x, uv.y), length(uv));

  uv = vec2(st.x/6.2831+.5+u_time*.1+st.y, st.y);

  float x = uv.x*7.;
  float m = min(fract(x), fract(1.-x));
  float c = smoothstep(0., .1, m*.3+.2-uv.y);

  gl_FragColor = vec4(vec3(c), 1.0);
}