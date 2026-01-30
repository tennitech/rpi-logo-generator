
precision mediump float;
varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_numericData;
uniform float u_numericLength;

void main() {
  vec2 st = vTexCoord;
  
  if (u_numericLength <= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Calculate which digit position we're in
  float digitIndex = floor(st.x * u_numericLength);
  float digitProgress = fract(st.x * u_numericLength);
  
  // Get the digit value from the texture
  float texX = (digitIndex + 0.5) / u_numericLength;
  vec4 digitData = texture2D(u_numericData, vec2(texX, 0.5));
  float digitValue = digitData.r;
  
  // Map digit values to height percentages
  float targetHeight = 0.0;
  
  // Check if it's a decimal point (value 10)
  if (abs(digitValue - 10.0) < 0.1) {
    // Decimal point: small space, no visible content
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  } else {
    // Map digits 0-9 to height percentages
    if (abs(digitValue - 0.0) < 0.1) targetHeight = 0.1;      // 0 = 10%
    else if (abs(digitValue - 1.0) < 0.1) targetHeight = 0.2; // 1 = 20%
    else if (abs(digitValue - 2.0) < 0.1) targetHeight = 0.3; // 2 = 30%
    else if (abs(digitValue - 3.0) < 0.1) targetHeight = 0.4; // 3 = 40%
    else if (abs(digitValue - 4.0) < 0.1) targetHeight = 0.5; // 4 = 50%
    else if (abs(digitValue - 5.0) < 0.1) targetHeight = 0.6; // 5 = 60%
    else if (abs(digitValue - 6.0) < 0.1) targetHeight = 0.7; // 6 = 70%
    else if (abs(digitValue - 7.0) < 0.1) targetHeight = 0.8; // 7 = 80%
    else if (abs(digitValue - 8.0) < 0.1) targetHeight = 0.9; // 8 = 90%
    else if (abs(digitValue - 9.0) < 0.1) targetHeight = 1.0; // 9 = 100%
  }
  
  // Create vertical bar from bottom up to target height
  float barBottom = 1.0 - targetHeight;
  
  if (st.y >= barBottom) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White foreground
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Transparent background
  }
}
