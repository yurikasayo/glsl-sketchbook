precision mediump float;

uniform vec2 u_resolution;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.x - 0.5;
  float len = length(uv);
  vec3 color = vec3(step(len, 0.2));
  gl_FragColor = vec4(color, 1.0);
}