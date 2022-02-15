// reference: The Art of Code "The Mandelbrot Fractal Explained!"

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2	u_mouse;

void main(){
  vec2 m = u_mouse.xy / u_resolution.xy;
  float zoom = pow(10., -m.x*3.);

  vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;

  vec2 c = uv*zoom*3.;
  c += vec2(-.69555, .37999);

  vec2 z = vec2(0.);
  float iter = 0.;

  const float max_iter = 200.;

  for (float i=0.; i < max_iter; i++) {
    z = vec2(z.x*z.x - z.y*z.y, 2.*z.x*z.y) + c;
    if (length(z)>2.) break;
    
    iter++;
  }

  float f = iter/max_iter;
  //f = step(.5, f);

  vec3 col = vec3(f);
  gl_FragColor = vec4(col, 1.);
}