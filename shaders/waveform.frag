
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform float u_frequency;
uniform float u_speed;
uniform float u_waveform; // 0=sine, 1=sawtooth, 2=square, 3=pulse

float sineWave(float x) {
  return sin(x * 6.28318530718) * 0.5 + 0.5;
}

float sawtoothWave(float x) {
  return fract(x);
}

float squareWave(float x) {
  return step(0.5, fract(x));
}

float pulseWave(float x) {
  return step(0.8, fract(x));
}

float morphWave(float x, float morphValue) {
  float sine = sineWave(x);
  float sawtooth = sawtoothWave(x);
  float square = squareWave(x);
  float pulse = pulseWave(x);
  
  // Smooth interpolation between waveforms
  if (morphValue < 1.0) {
    // Between sine and sawtooth
    return mix(sine, sawtooth, morphValue);
  } else if (morphValue < 2.0) {
    // Between sawtooth and square
    return mix(sawtooth, square, morphValue - 1.0);
  } else {
    // Between square and pulse
    return mix(square, pulse, morphValue - 2.0);
  }
}

void main() {
  vec2 st = vTexCoord;
  
  // Animate the waveform moving left to right
  float animatedX = st.x + u_time * u_speed * 0.1;
  
  // Apply frequency scaling
  float scaledX = animatedX * u_frequency;
  
  // Generate morphed waveform
  float wave = morphWave(scaledX, u_waveform);
  
  // Create waveform that fills the bar area
  float waveHeight = 0.9; // Height of the waveform (90% of bar height)
  float waveY = (1.0 - waveHeight) * 0.5 + wave * waveHeight;
  
  // Create thick waveform line
  float lineThickness = 0.08;
  float distance = abs(st.y - waveY);
  
  // Use step function for solid fill instead of alpha blending
  float waveform = 1.0 - step(lineThickness, distance);
  
  // Fill the entire bar area with the waveform pattern
  gl_FragColor = vec4(waveform, waveform, waveform, 1.0);
}
