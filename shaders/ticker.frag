
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 st = vTexCoord;

  // Define tick parameters
  float tickWidth = 0.05; // Width of each tick mark
  float tickSpacing = 0.1; // Spacing between tick marks

  // Calculate tick position
  float tickPos = mod(st.x, tickSpacing);
  bool inTick = tickPos < tickWidth;

  // Create two layers of ticks
  float topTickHeight = 0.5; // Top ticks go from middle to top
  float bottomTickHeight = 1.0; // Bottom ticks go full height

  // Top layer (shorter ticks)
  bool topTick = inTick && st.y > (1.0 - topTickHeight);

  // Bottom layer (full height ticks)
  bool bottomTick = inTick;

  // Combine the layers
  float pattern = 0.0;
  if (bottomTick) pattern = 1.0;
  if (topTick) pattern = 1.0;

  gl_FragColor = vec4(vec3(pattern), 1.0);
}
