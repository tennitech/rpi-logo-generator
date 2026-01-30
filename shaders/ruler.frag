
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_repeats;
uniform float u_units;

void main() {
  vec2 st = vTexCoord;
  
  float totalTicks = u_repeats * u_units + 1.0;
  float tickWidth = 1.0 / (2.0 * totalTicks - 1.0);
  float tickSpacing = tickWidth * 2.0;
  
  float tickIndex = floor(st.x / tickSpacing);
  float tickPos = mod(st.x, tickSpacing);
  
  if (tickPos < tickWidth && tickIndex < totalTicks) {
    float tickHeight = 1.0;
    
    // Determine tick height based on position
    if (tickIndex > 0.0 && tickIndex < totalTicks - 1.0) {
      float posInUnit = mod(tickIndex, u_units);
      if (posInUnit != 0.0) {
        if (u_units == 10.0) {
          if (posInUnit == 5.0) {
            tickHeight = 0.75;
          } else if (mod(posInUnit, 2.0) == 0.0) {
            tickHeight = 0.5;
          } else {
            tickHeight = 0.25;
          }
        } else {
          tickHeight = 0.5;
        }
      }
    }
    
    if (st.y >= (1.0 - tickHeight)) {
      gl_FragColor = vec4(1.0);
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
