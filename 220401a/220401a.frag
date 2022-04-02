#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;
uniform sampler2D u_texture_0;

void main(){
  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;

  vec3 color = texture2D(u_texture_0, uv+.5).xyz;

  gl_FragColor = vec4(color, 1.0);
}