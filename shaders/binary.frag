
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 st = vTexCoord;

  // Create a binary-like pattern based on position
  float scale = 20.0; // Number of bits across the width
  float bitPos = floor(st.x * scale);

  // Use a hash function to create pseudo-random binary values
  float hash = fract(sin(bitPos * 12.9898) * 43758.5453);
  float isBit = step(0.5, hash);

  // Create the visual pattern
  float pattern = 0.0;
  if (isBit > 0.5) {
    // Full height bars for 1s
    pattern = 1.0;
  } else {
    // Shorter bars for 0s (centered vertically)
    float barHeight = 0.4;
    float barCenter = 0.5;
    float barTop = barCenter + barHeight * 0.5;
    float barBottom = barCenter - barHeight * 0.5;
    pattern = step(barBottom, st.y) * (1.0 - step(barTop, st.y));
  }

  gl_FragColor = vec4(vec3(pattern), 1.0);
}
