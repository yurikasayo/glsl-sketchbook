#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

float DistLine(vec3 ro, vec3 rd, vec3 p) {
  return length(cross(p-ro, rd))/length(rd);
}

float DrawPoint(vec3 ro, vec3 rd, vec3 p) {
  float d = DistLine(ro, rd, p);
  d = smoothstep(.1, .09, d);
  return d;
}

void main(){
  float t = u_time;

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ro = vec3(3. * sin(t), 2., -3.*cos(t));

  vec3 lookat = vec3(.5);

  float zoom = 1.;

  vec3 f = normalize(lookat-ro);
  vec3 r = cross(vec3(0., 1., 0.), f);
  vec3 u = cross(f, r);

  vec3 c = ro + f*zoom;
  vec3 i = c + uv.x*r + uv.y*u;

  vec3 rd = i - ro;

  float d = 0.;

  d += DrawPoint(ro, rd, vec3(0., 0., 0.));
  d += DrawPoint(ro, rd, vec3(0., 0., 1.));
  d += DrawPoint(ro, rd, vec3(0., 1., 0.));
  d += DrawPoint(ro, rd, vec3(0., 1., 1.));
  d += DrawPoint(ro, rd, vec3(1., 0., 0.));
  d += DrawPoint(ro, rd, vec3(1., 0., 1.));
  d += DrawPoint(ro, rd, vec3(1., 1., 0.));
  d += DrawPoint(ro, rd, vec3(1., 1., 1.));



  gl_FragColor = vec4(vec3(d), 1.);
}