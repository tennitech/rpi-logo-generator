// Shader loading utility
async function loadShaderFile(path) {
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (error) {
    console.error(`Error loading shader file ${path}:`, error);
    return null;
  }
}

// Load shader from files
async function loadShader(vertPath, fragPath) {
  try {
    const vertSource = await loadShaderFile(vertPath);
    const fragSource = await loadShaderFile(fragPath);
    if (vertSource && fragSource) {
      return createShader(vertSource, fragSource);
    }
  } catch (error) {
    console.error('Error loading shader:', error);
  }
  return null;
}

// Fixed logo paths (updated to match new 250px reference SVG exactly)
const paths = {
  r: "M213.54 30.4413C213.535 30.3153 213.529 30.1893 213.524 30.0688C213.025 19.6551 209.147 12.0188 202.644 7.0447C202.491 6.92966 202.338 6.81462 202.184 6.71054C196.032 2.20215 187.629 0 177.583 0H117.692L116.125 1.5667V110.185L117.692 111.751H132.406L133.972 110.185V66.3605L135.533 64.7938H177.583C186.775 64.7938 194.948 62.6902 201.182 58.39C201.472 58.1928 201.751 57.9956 202.031 57.7874C207.942 53.3941 211.946 46.9136 213.179 38.2584C213.222 37.9516 213.261 37.6393 213.299 37.3216C213.337 37.0094 213.37 36.6917 213.398 36.3739C213.42 36.1493 213.441 35.9247 213.452 35.7001C213.54 34.6264 213.578 33.5254 213.578 32.3969C213.578 31.7341 213.567 31.0822 213.54 30.4413ZM135.533 48.5186L133.972 46.9519V17.8419L135.539 16.2752H176.487C190.522 16.2752 195.737 20.6466 195.737 32.3969C195.737 44.1472 190.522 48.5186 176.487 48.5186H135.533Z",
  p: "M250.042 110.185L248.475 111.751H233.761L232.195 110.185V1.5667L233.767 0H248.481L250.047 1.5667V110.185H250.042Z",
  i: "M86.2053 111.751L83.2307 110.102L55.0903 66.3276L52.0335 64.7992H19.4559L17.8892 66.366V110.19L16.328 111.757H1.61407L0.0473633 110.19V1.5667L1.61407 0H60.4094C84.6769 0 97.5009 11.2025 97.5009 32.3969C97.5009 48.5186 89.6126 59.02 74.6631 62.8491V64.3993L95.9342 97.8151V110.091L94.2743 111.751H86.2053ZM60.4094 48.5186C74.444 48.5186 79.6591 44.1472 79.6591 32.3969C79.6591 20.6466 74.444 16.2752 60.4094 16.2752H19.4614L17.8892 17.8419V46.9519L19.4559 48.5186H60.4094Z",
  bar: "M247.851 129.855L249.406 131.411V146.018L247.851 147.573H2.00064L0.445312 146.018V131.411L2.00064 129.855H247.856H247.851Z"
};

// Global variables
let styleSelect;
let colorModeSelect;
let binaryInput;
let binaryGroup;
let rulerGroup;
let rulerRepeatsSlider;
let rulerRepeatsDisplay;
let rulerUnitsSlider;
let rulerUnitsDisplay;
let tickerSlider;
let tickerDisplay;
let tickerGroup;
let tickerRatioSlider;
let tickerRatioDisplay;
let tickerWidthRatioSlider;
let tickerWidthRatioDisplay;
let waveformGroup;
let waveformTypeSlider;
let waveformTypeDisplay;
let waveformFrequencySlider;
let waveformFrequencyDisplay;
let waveformSpeedSlider;
let waveformSpeedDisplay;
let circlesGroup;
let circlesDensitySlider;
let circlesDensityDisplay;
let circlesSizeVariationSlider;
let circlesSizeVariationDisplay;
let circlesOverlapSlider;
let circlesOverlapDisplay;
let circlesFillSelect;
let circlesModeSelect;
let circlesPackingControls;
let circlesGridControls;
let circlesRowsSlider;
let circlesRowsDisplay;
let circlesGridDensitySlider;
let circlesGridDensityDisplay;
let circlesSizeVariationYSlider;
let circlesSizeVariationYDisplay;
let circlesSizeVariationXSlider;
let circlesSizeVariationXDisplay;
let circlesGridOverlapSlider;
let circlesGridOverlapDisplay;
let circlesLayoutSelect;
let numericGroup;
let numericInput;
let numericModeSelect;

// Static circle data cache
let staticCircleData = null;
let lastCircleParams = null;
let controlPanel;
let controlToggle;
let toggleText;
let tickerShader1, tickerShader2, binaryShader;
let currentShader = 1;
let barBuffer;
let binaryData = [];
let binaryLength = 0;
let numericData = [];
let numericLength = 0;
let numericTexture = null;



// Audio variables
let audioContext;
let oscillator;
let gainNode;
let isAudioPlaying = false;
let audioWorkletNode;

// Color scheme management
let currentColorMode = 'black-on-white';
const colors = {
  'black-on-white': { bg: '#ffffff', fg: '#000000' },
  'white-on-black': { bg: '#000000', fg: '#ffffff' },
  'white-on-red': { bg: '#d6001c', fg: '#ffffff' },
  'red-on-white': { bg: '#ffffff', fg: '#d6001c' }
};

// Logo positioning - centers the 111.76px tall logo vertically in the viewport
const LOGO_VERTICAL_OFFSET = -72;

// Convert text to binary
function textToBinary(text) {
  if (!text || typeof text !== 'string') text = "RPI"; // Default text

  // Remove spaces from the text and limit length to prevent crashes
  text = text.replace(/\s/g, '').substring(0, 10); // Limit to 10 characters max

  let binary = [];
  for (let i = 0; i < text.length; i++) {
    let charCode = text.charCodeAt(i);
    // Ensure valid character code
    if (isNaN(charCode) || charCode < 0 || charCode > 127) {
      charCode = 65; // Default to 'A' for invalid characters
    }
    for (let j = 7; j >= 0; j--) {
      binary.push((charCode >> j) & 1);
    }
  }
  return binary;
}

// Evaluate mathematical formulas safely
function evaluateFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    return "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
  }

  // Clean the input
  const cleanFormula = formula.trim();
  
  // If it's already a number, return it
  if (!isNaN(cleanFormula) && !isNaN(parseFloat(cleanFormula))) {
    return cleanFormula;
  }

  try {
    // Create a safe evaluation context with allowed mathematical functions
    const safeContext = {
      Math: Math,
      PI: Math.PI,
      E: Math.E,
      sqrt: Math.sqrt,
      pow: Math.pow,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      log: Math.log,
      exp: Math.exp,
      abs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      min: Math.min,
      max: Math.max
    };

    // Replace ^ with ** for exponentiation (JavaScript syntax)
    let processedFormula = cleanFormula.replace(/\^/g, '**');
    
    // Replace common mathematical constants if used without Math prefix
    processedFormula = processedFormula.replace(/\bPI\b/g, 'Math.PI');
    processedFormula = processedFormula.replace(/\bE\b/g, 'Math.E');
    
    // Basic security check - only allow numbers, operators, parentheses, dots, and Math functions
    const allowedPattern = /^[0-9+\-*/().^Math\s_a-zA-Z]*$/;
    if (!allowedPattern.test(processedFormula)) {
      throw new Error('Invalid characters in formula');
    }

    // Evaluate the formula using Function constructor (safer than eval)
    const evalFunction = new Function('Math', `return ${processedFormula}`);
    const result = evalFunction(Math);
    
    // Check if result is a valid number
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Formula result is not a valid number');
    }
    
    // Convert to string with appropriate precision
    return result.toString();
    
  } catch (error) {
    console.warn('Formula evaluation failed:', error);
    // Return the original input if evaluation fails
    return cleanFormula;
  }
}

// Convert numeric string to digit array
function parseNumericString(numericString) {
  if (!numericString || typeof numericString !== 'string') {
    numericString = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
  }

  // First, try to evaluate as a formula
  const evaluatedString = evaluateFormula(numericString);

  let digits = [];
  for (let i = 0; i < evaluatedString.length; i++) {
    const char = evaluatedString[i];
    if (char === '.') {
      digits.push(10); // Use 10 to represent decimal point
    } else if (char >= '0' && char <= '9') {
      digits.push(parseInt(char));
    }
    // Skip any other characters
  }
  
  // Limit to reasonable length to prevent performance issues
  return digits.slice(0, 200);
}

// Create texture from numeric data
function createNumericTexture(digits) {
  if (!digits || digits.length === 0) return null;
  
  // Create a 1D texture with the digit values
  const width = Math.min(digits.length, 200);
  const height = 1;
  const data = new Float32Array(width * height * 4); // RGBA
  
  for (let i = 0; i < width; i++) {
    const index = i * 4;
    data[index] = digits[i] / 10.0; // Normalize to 0-1 range
    data[index + 1] = 0.0;
    data[index + 2] = 0.0;
    data[index + 3] = 1.0;
  }
  
  // Create p5.js graphics buffer for the texture
  const textureGraphics = createGraphics(width, height);
  textureGraphics.loadPixels();
  
  for (let i = 0; i < width; i++) {
    const pixelIndex = i * 4;
    textureGraphics.pixels[pixelIndex] = data[i * 4] * 255;     // R
    textureGraphics.pixels[pixelIndex + 1] = 0;                 // G
    textureGraphics.pixels[pixelIndex + 2] = 0;                 // B
    textureGraphics.pixels[pixelIndex + 3] = 255;               // A
  }
  
  textureGraphics.updatePixels();
  return textureGraphics;
}

// Shader storage
let shaders = {
  binary: null,
  ticker: null,
  ruler: null,
  waveform: null,
  circles: null,
  numeric: null
};



// Convert SVG path to p5.js shape
function drawSVGPath(pathData) {
  const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi);
  if (!commands) return;

  beginShape();
  let currentX = 0, currentY = 0;
  let startX = 0, startY = 0;

  for (let cmd of commands) {
    const type = cmd[0];
    const coords = cmd.slice(1).trim().match(/[+-]?\d*\.?\d+/g);

    if (!coords && type.toUpperCase() !== 'Z') continue;

    switch (type.toUpperCase()) {
      case 'M':
        if (coords && coords.length >= 2) {
          currentX = parseFloat(coords[0]);
          currentY = parseFloat(coords[1]);
          startX = currentX;
          startY = currentY;
          vertex(currentX, currentY);
        }
        break;
      case 'L':
        if (coords && coords.length >= 2) {
          currentX = parseFloat(coords[0]);
          currentY = parseFloat(coords[1]);
          vertex(currentX, currentY);
        }
        break;
      case 'H':
        if (coords && coords.length >= 1) {
          currentX = parseFloat(coords[0]);
          vertex(currentX, currentY);
        }
        break;
      case 'V':
        if (coords && coords.length >= 1) {
          currentY = parseFloat(coords[0]);
          vertex(currentX, currentY);
        }
        break;
      case 'C':
        if (coords && coords.length >= 6) {
          bezierVertex(
            parseFloat(coords[0]), parseFloat(coords[1]),
            parseFloat(coords[2]), parseFloat(coords[3]),
            parseFloat(coords[4]), parseFloat(coords[5])
          );
          currentX = parseFloat(coords[4]);
          currentY = parseFloat(coords[5]);
        }
        break;
      case 'Z':
        vertex(startX, startY);
        break;
    }
  }
  endShape(CLOSE);
}

// Helper function to draw SVG paths on a graphics buffer
function drawSVGPathOnGraphics(pg, pathData) {
  const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi);
  if (!commands) return;

  pg.beginShape();
  let currentX = 0, currentY = 0;
  let startX = 0, startY = 0;

  for (let cmd of commands) {
    const type = cmd[0];
    const coords = cmd.slice(1).trim().match(/[+-]?\d*\.?\d+/g);

    if (!coords && type.toUpperCase() !== 'Z') continue;

    switch (type.toUpperCase()) {
      case 'M':
        if (coords && coords.length >= 2) {
          currentX = parseFloat(coords[0]);
          currentY = parseFloat(coords[1]);
          startX = currentX;
          startY = currentY;
          pg.vertex(currentX, currentY);
        }
        break;
      case 'L':
        if (coords && coords.length >= 2) {
          currentX = parseFloat(coords[0]);
          currentY = parseFloat(coords[1]);
          pg.vertex(currentX, currentY);
        }
        break;
      case 'H':
        if (coords && coords.length >= 1) {
          currentX = parseFloat(coords[0]);
          pg.vertex(currentX, currentY);
        }
        break;
      case 'V':
        if (coords && coords.length >= 1) {
          currentY = parseFloat(coords[0]);
          pg.vertex(currentX, currentY);
        }
        break;
      case 'C':
        if (coords && coords.length >= 6) {
          pg.bezierVertex(
            parseFloat(coords[0]), parseFloat(coords[1]),
            parseFloat(coords[2]), parseFloat(coords[3]),
            parseFloat(coords[4]), parseFloat(coords[5])
          );
          currentX = parseFloat(coords[4]);
          currentY = parseFloat(coords[5]);
        }
        break;
      case 'Z':
        pg.vertex(startX, startY);
        break;
    }
  }
  pg.endShape(CLOSE);
}

// Helper function to draw bar patterns on graphics buffer
function drawBarPatternOnGraphics(pg, barStartX, barY, exactBarWidth, rectHeight) {
  // Get current foreground color
  const colorScheme = colors[currentColorMode];
  const fgColor = colorScheme ? colorScheme.fg : '#000000';

  pg.fill(fgColor);
  pg.noStroke();
  pg.rectMode(CORNER);

  if (currentShader === 0) {
    // Solid bar
    pg.rect(barStartX, barY, exactBarWidth, rectHeight);
  } else if (currentShader === 1) {
    // Ruler pattern
    const rulerRepeats = parseInt(rulerRepeatsSlider.value);
    const rulerUnits = parseInt(rulerUnitsSlider.value);
    const rulerTotalTicks = rulerRepeats * rulerUnits + 1;
    const rulerTickWidth = exactBarWidth / (2 * rulerTotalTicks - 1);
    const rulerTickSpacing = rulerTickWidth * 2;

    for (let i = 0; i < rulerTotalTicks; i++) {
      const tickX = barStartX + i * rulerTickSpacing;
      let tickHeight;

      if (i === 0 || i === rulerTotalTicks - 1) {
        tickHeight = rectHeight;
      } else if (i % rulerUnits === 0) {
        tickHeight = rectHeight;
      } else {
        const positionInUnit = i % rulerUnits;
        if (rulerUnits === 10) {
          if (positionInUnit === 5) {
            tickHeight = rectHeight * 0.75;
          } else if (positionInUnit % 2 === 0) {
            tickHeight = rectHeight * 0.5;
          } else {
            tickHeight = rectHeight * 0.25;
          }
        } else {
          if (positionInUnit === Math.floor(rulerUnits / 2)) {
            tickHeight = rectHeight * 0.75;
          } else {
            tickHeight = rectHeight * 0.5;
          }
        }
      }

      const tickY = barY + rectHeight - tickHeight;
      pg.rect(tickX, tickY, rulerTickWidth, tickHeight);
    }
  } else if (currentShader === 2) {
    // Ticker pattern
    const tickerRatio = parseInt(tickerRatioSlider.value);
    const tickerWidthRatio = parseInt(tickerWidthRatioSlider.value);
    const tickerBottomTicks = parseInt(tickerSlider.value);
    const tickerTopTicks = tickerBottomTicks * tickerRatio;
    const tickerHalfHeight = rectHeight / 2;
    const tickerSpacing = exactBarWidth / tickerTopTicks;
    const tickerTopWidth = tickerSpacing / 2;
    const tickerBottomWidth = tickerTopWidth * tickerWidthRatio;

    // Top row
    for (let i = 0; i < tickerTopTicks; i++) {
      const x = barStartX + i * tickerSpacing;
      pg.rect(x, barY, tickerTopWidth, tickerHalfHeight);
    }

    // Bottom row
    for (let i = 0; i < tickerBottomTicks; i++) {
      const topIndex = i * tickerRatio;
      const x = barStartX + topIndex * tickerSpacing;
      pg.rect(x, barY + tickerHalfHeight, tickerBottomWidth, tickerHalfHeight);
    }
  } else if (currentShader === 3) {
    // Binary pattern
    const binaryText = binaryInput.value || "RPI";
    const binaryDataArray = textToBinary(binaryText);

    if (binaryDataArray.length > 0) {
      const bitWidth = exactBarWidth / binaryDataArray.length;
      const binaryRowHeight = rectHeight / 3;
      const binaryTopRowY = barY;
      const binaryMiddleRowY = barY + binaryRowHeight;
      const binaryBottomRowY = barY + binaryRowHeight * 2;

      for (let i = 0; i < binaryDataArray.length; i++) {
        const x = barStartX + i * bitWidth;

        if (binaryDataArray[i] === 1) {
          pg.rect(x, binaryTopRowY, bitWidth, binaryRowHeight);
          pg.rect(x, binaryBottomRowY, bitWidth, binaryRowHeight);
        } else {
          // 0 = single bar in middle row
          pg.rect(x, binaryMiddleRowY, bitWidth, binaryRowHeight);
        }
      }
    }
  } else if (currentShader === 4) {
    // Waveform pattern
    const frequency = parseInt(waveformFrequencySlider.value);
    const waveType = parseFloat(waveformTypeSlider.value);
    const speed = parseFloat(waveformSpeedSlider.value);
    const time = millis() / 1000.0;

    // Helper function for smooth waveform generation
    function generateWaveValue(phase, type) {
      const normalizedPhase = phase - Math.floor(phase);
      const wrappedPhase = normalizedPhase < 0 ? normalizedPhase + 1 : normalizedPhase;

      if (type < 1.0) {
        // Sine to sawtooth interpolation
        const sine = (Math.sin(phase * 2 * Math.PI) + 1) * 0.5;
        const saw = wrappedPhase;
        return sine + (saw - sine) * type;
      } else if (type < 2.0) {
        // Sawtooth to square interpolation
        const saw = wrappedPhase;
        const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
        const t = type - 1.0;
        return saw + (square - saw) * t;
      } else {
        // Square to pulse interpolation
        const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
        const pulse = wrappedPhase > 0.8 ? 1.0 : 0.0;
        const t = type - 2.0;
        return square + (pulse - square) * t;
      }
    }

    // Calculate optimal number of points
    const basePoints = Math.max(300, exactBarWidth * 3);
    const frequencyMultiplier = Math.max(1, frequency / 10);
    const points = Math.ceil(basePoints * frequencyMultiplier);

    pg.fill(fgColor);
    pg.noStroke();

    // Draw as a filled polygon
    pg.beginShape();

    // Start from bottom-left corner
    pg.vertex(barStartX, barY + rectHeight);

    // Generate the waveform curve
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * exactBarWidth;
      const rawPhase = ((x / exactBarWidth) * frequency) - (time * speed);
      const wave = generateWaveValue(rawPhase, waveType);
      const y = barY + rectHeight * (1.0 - Math.max(0, Math.min(1, wave)));

      pg.vertex(barStartX + x, y);
    }

    // Complete the polygon by going to bottom-right corner
    pg.vertex(barStartX + exactBarWidth, barY + rectHeight);

    pg.endShape(pg.CLOSE);
  } else if (currentShader === 5) {
    // Circles pattern
    const density = parseInt(circlesDensitySlider.value);
    const sizeVariation = parseInt(circlesSizeVariationSlider.value);
    const overlapAmount = parseInt(circlesOverlapSlider.value);
    const fillStyle = circlesFillSelect.value;

    pg.fill(fillStyle === 'fill' ? fgColor : 'transparent');
    pg.stroke(fillStyle === 'stroke' ? fgColor : 'transparent');
    pg.strokeWeight(1);

    drawCirclePattern(pg, barStartX, barY, exactBarWidth, rectHeight, density, sizeVariation, overlapAmount);
  } else if (currentShader === 6) {
    // Numeric pattern - get visualization mode
    const numericString = numericInput.value || "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
    const digits = parseNumericString(numericString);
    const mode = numericModeSelect ? numericModeSelect.value : 'height';

    if (digits.length > 0) {
      const digitWidth = exactBarWidth / digits.length;

      if (mode === 'height') {
        // Height Encoding mode - digit height bars with inner stroke
        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const x = barStartX + i * digitWidth;

          // Skip decimal points (value 10) - they create spacing
          if (digit === 10) {
            continue;
          }

          // Map digits 0-9 to height percentages
          let heightPercent = 0.0;
          switch (digit) {
            case 0: heightPercent = 0.1; break;  // 10%
            case 1: heightPercent = 0.2; break;  // 20%
            case 2: heightPercent = 0.3; break;  // 30%
            case 3: heightPercent = 0.4; break;  // 40%
            case 4: heightPercent = 0.5; break;  // 50%
            case 5: heightPercent = 0.6; break;  // 60%
            case 6: heightPercent = 0.7; break;  // 70%
            case 7: heightPercent = 0.8; break;  // 80%
            case 8: heightPercent = 0.9; break;  // 90%
            case 9: heightPercent = 1.0; break;  // 100%
          }

          const barHeight = rectHeight * heightPercent;
          const barBottomY = barY + rectHeight - barHeight; // Position from bottom

          pg.rect(x, barBottomY, digitWidth, barHeight);
        }
      } else if (mode === 'dotmatrix') {
        // Dot Matrix mode - dots distributed evenly across the full height of the bar
        const horizontalGap = 1; // Minimum gap between digit columns
        const dotHeight = 1.5; // Height of each dot
        
        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const x = barStartX + i * digitWidth;

          // Skip decimal points (value 10) - they create spacing
          if (digit === 10) {
            continue;
          }

          // Calculate dot width to stretch across most of the digit column width
          // Leave half the horizontal gap on each side
          const dotWidth = digitWidth - horizontalGap;
          const dotX = x + horizontalGap / 2;
          
          // For digits > 0, distribute dots evenly across the full bar height
          if (digit > 0) {
            // Calculate the available space for dots
            const availableHeight = rectHeight - dotHeight; // Reserve space for dot height
            
            // Distribute dots evenly across the available height
            for (let dotIndex = 0; dotIndex < digit; dotIndex++) {
              let dotY;
              
              if (digit === 1) {
                // Single dot: center it vertically
                dotY = barY + (rectHeight - dotHeight) / 2;
              } else {
                // Multiple dots: distribute evenly from top to bottom
                const spacing = availableHeight / (digit - 1);
                dotY = barY + dotIndex * spacing;
              }
              
              // Use rounded rectangle that stretches across the digit width
              pg.rect(dotX, dotY, dotWidth, dotHeight, dotHeight/2);
            }
          }
        }
      }
    }
  }
}

async function setup() {
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('p5-container');



  // Initialize binary data first
  updateBinaryData("RPI");
  
  // Initialize numeric data
  updateNumericData("3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679");

  // Load shaders from files
  try {
    shaders.binary = await loadShader('shaders/vertex.glsl', 'shaders/binary.frag');
    shaders.ticker = await loadShader('shaders/vertex.glsl', 'shaders/ticker.frag');
    shaders.ruler = await loadShader('shaders/vertex.glsl', 'shaders/ruler.frag');
    shaders.waveform = await loadShader('shaders/vertex.glsl', 'shaders/waveform.frag');
    shaders.circles = await loadShader('shaders/vertex.glsl', 'shaders/circles.frag');
    shaders.numeric = await loadShader('shaders/vertex.glsl', 'shaders/numeric.frag');
    console.log('Shaders loaded successfully');
  } catch (error) {
    console.error('Error loading shaders:', error);
  }

  // Get control references
  styleSelect = document.getElementById('style-select');
  colorModeSelect = document.getElementById('color-mode-select');
  binaryInput = document.getElementById('binary-input');
  binaryGroup = document.getElementById('binary-group');
  rulerGroup = document.getElementById('ruler-group');
  rulerRepeatsSlider = document.getElementById('ruler-repeats-slider');
  rulerRepeatsDisplay = document.getElementById('ruler-repeats-display');
  rulerUnitsSlider = document.getElementById('ruler-units-slider');
  rulerUnitsDisplay = document.getElementById('ruler-units-display');
  tickerSlider = document.getElementById('ticker-slider');
  tickerDisplay = document.getElementById('ticker-display');
  tickerGroup = document.getElementById('ticker-group');
  tickerRatioSlider = document.getElementById('ticker-ratio-slider');
  tickerRatioDisplay = document.getElementById('ticker-ratio-display');
  tickerWidthRatioSlider = document.getElementById('ticker-width-ratio-slider');
  tickerWidthRatioDisplay = document.getElementById('ticker-width-ratio-slider');
  waveformGroup = document.getElementById('waveform-group');
  waveformTypeSlider = document.getElementById('waveform-type-slider');
  waveformTypeDisplay = document.getElementById('waveform-type-display');
  waveformFrequencySlider = document.getElementById('waveform-frequency-slider');
  waveformFrequencyDisplay = document.getElementById('waveform-frequency-display');
  waveformSpeedSlider = document.getElementById('waveform-speed-slider');
  waveformSpeedDisplay = document.getElementById('waveform-speed-display');
  circlesGroup = document.getElementById('circles-group');
  circlesDensitySlider = document.getElementById('circles-density-slider');
  circlesDensityDisplay = document.getElementById('circles-density-display');
  circlesSizeVariationSlider = document.getElementById('circles-size-variation-slider');
  circlesSizeVariationDisplay = document.getElementById('circles-size-variation-display');
  circlesOverlapSlider = document.getElementById('circles-overlap-slider');
  circlesOverlapDisplay = document.getElementById('circles-overlap-display');
  circlesFillSelect = document.getElementById('circles-fill-select');
  circlesModeSelect = document.getElementById('circles-mode-select');
  circlesPackingControls = document.getElementById('circles-packing-controls');
  circlesGridControls = document.getElementById('circles-grid-controls');
  circlesRowsSlider = document.getElementById('circles-rows-slider');
  circlesRowsDisplay = document.getElementById('circles-rows-display');
  circlesGridDensitySlider = document.getElementById('circles-grid-density-slider');
  circlesGridDensityDisplay = document.getElementById('circles-grid-density-display');
  circlesSizeVariationYSlider = document.getElementById('circles-size-variation-y-slider');
  circlesSizeVariationYDisplay = document.getElementById('circles-size-variation-y-display');
  circlesSizeVariationXSlider = document.getElementById('circles-size-variation-x-slider');
  circlesSizeVariationXDisplay = document.getElementById('circles-size-variation-x-display');
  circlesGridOverlapSlider = document.getElementById('circles-grid-overlap-slider');
  circlesGridOverlapDisplay = document.getElementById('circles-grid-overlap-display');
  circlesLayoutSelect = document.getElementById('circles-layout-select');
  numericGroup = document.getElementById('numeric-group');
  numericInput = document.getElementById('numeric-input');
  numericModeSelect = document.getElementById('numeric-mode-select');
  controlPanel = document.getElementById('control-panel');
  controlToggle = document.getElementById('control-toggle');
  toggleText = document.getElementById('toggle-text');

  // Get save control references
  const saveButton = document.getElementById('save-button');
  const saveMenu = document.getElementById('save-menu');
  const savePngButton = document.getElementById('save-png');
  const saveSvgButton = document.getElementById('save-svg');

  // Setup ruler sliders with display updates
  rulerRepeatsSlider.addEventListener('input', function() {
    updateRulerRepeatsDisplay();
    updateUrlParameters();
  });
  rulerUnitsSlider.addEventListener('input', function() {
    updateRulerUnitsDisplay();
    updateUrlParameters();
  });
  updateRulerRepeatsDisplay(); // Set initial value
  updateRulerUnitsDisplay(); // Set initial value

  // Setup ticker slider with display update
  tickerSlider.addEventListener('input', function() {
    updateTickerDisplay();
    updateUrlParameters();
  });
  updateTickerDisplay(); // Set initial value

  // Setup ticker ratio slider with display update
  tickerRatioSlider.addEventListener('input', function() {
    updateTickerRatioDisplay();
    updateUrlParameters();
  });
  updateTickerRatioDisplay(); // Set initial value

  // Setup ticker width ratio slider with display update
  tickerWidthRatioSlider.addEventListener('input', function() {
    updateTickerWidthRatioDisplay();
    updateUrlParameters();
  });
  updateTickerWidthRatioDisplay(); // Set initial value

  // Setup waveform sliders with display updates and audio parameter updates
  waveformTypeSlider.addEventListener('input', function() {
    updateWaveformTypeDisplay();
    updateAudioParameters();
    updateUrlParameters();
  });
  waveformFrequencySlider.addEventListener('input', function() {
    updateWaveformFrequencyDisplay();
    updateAudioParameters();
    updateUrlParameters();
  });
  waveformSpeedSlider.addEventListener('input', function() {
    updateWaveformSpeedDisplay();
    updateUrlParameters();
  });

  // Set default values only if no URL parameters
  if (!window.location.search) {
    waveformTypeSlider.value = "0"; // SINE
    waveformFrequencySlider.value = "24"; // Frequency 24
    waveformSpeedSlider.value = "0.7"; // Speed 0.7
  }

  updateWaveformTypeDisplay(); // Set initial value
  updateWaveformFrequencyDisplay(); // Set initial value
  updateWaveformSpeedDisplay(); // Set initial value

  // Setup circles sliders with display updates and debouncing
  let circleUpdateTimeout;

  function debouncedCircleUpdate() {
    clearTimeout(circleUpdateTimeout);
    circleUpdateTimeout = setTimeout(() => {
      // Force redraw after parameter changes
      redraw();
      updateUrlParameters();
    }, 50); // 50ms debounce
  }

  circlesDensitySlider.addEventListener('input', () => {
    updateCirclesDensityDisplay();
    debouncedCircleUpdate();
  });
  circlesSizeVariationSlider.addEventListener('input', () => {
    updateCirclesSizeVariationDisplay();
    debouncedCircleUpdate();
  });
  circlesOverlapSlider.addEventListener('input', () => {
    updateCirclesOverlapDisplay();
    debouncedCircleUpdate();
  });

  updateCirclesDensityDisplay(); // Set initial value
  updateCirclesSizeVariationDisplay(); // Set initial value
  updateCirclesOverlapDisplay(); // Set initial value

  // Setup circles mode selector
  circlesModeSelect.addEventListener('change', function() {
    handleCirclesModeChange();
    updateUrlParameters();
  });

  // Setup circles fill selector
  circlesFillSelect.addEventListener('change', function() {
    updateUrlParameters();
  });

  // Setup grid mode sliders with display updates and debouncing
  circlesRowsSlider.addEventListener('input', () => {
    updateCirclesRowsDisplay();
    debouncedCircleUpdate();
  });
  circlesGridDensitySlider.addEventListener('input', () => {
    updateCirclesGridDensityDisplay();
    debouncedCircleUpdate();
  });
  circlesSizeVariationYSlider.addEventListener('input', () => {
    updateCirclesSizeVariationYDisplay();
    debouncedCircleUpdate();
  });
  circlesSizeVariationXSlider.addEventListener('input', () => {
    updateCirclesSizeVariationXDisplay();
    debouncedCircleUpdate();
  });
  circlesGridOverlapSlider.addEventListener('input', () => {
    updateCirclesGridOverlapDisplay();
    debouncedCircleUpdate();
  });
  circlesLayoutSelect.addEventListener('change', function() {
    debouncedCircleUpdate();
  });

  updateCirclesRowsDisplay(); // Set initial value
  updateCirclesGridDensityDisplay(); // Set initial value
  updateCirclesSizeVariationYDisplay(); // Set initial value
  updateCirclesSizeVariationXDisplay(); // Set initial value
  updateCirclesGridOverlapDisplay(); // Set initial value

  // Setup control panel toggle with better mobile support
  controlToggle.addEventListener('click', toggleControlPanel);
  controlToggle.addEventListener('touchend', function(e) {
    e.preventDefault();
    toggleControlPanel();
  });

  // Add click/touch outside to close functionality with improved mobile handling
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('touchend', handleClickOutside);

  // Setup save functionality
  saveButton.addEventListener('click', toggleSaveMenu);
  savePngButton.addEventListener('click', savePNG);
  saveSvgButton.addEventListener('click', saveSVG);

  // Close save menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!saveButton.contains(event.target) && !saveMenu.contains(event.target)) {
      saveMenu.classList.add('hidden');
    }
  });

  // Setup style selector
  styleSelect.addEventListener('change', function() {
    handleStyleChange();
    updateUrlParameters();
  });

  // Setup color mode selector
  colorModeSelect.addEventListener('change', function() {
    handleColorModeChange();
    updateUrlParameters();
  });

  // Setup binary input with real-time updates
  binaryInput.addEventListener('input', function() {
    handleBinaryInput();
    updateUrlParameters();
  });
  binaryInput.addEventListener('keyup', function() {
    handleBinaryInput();
    updateUrlParameters();
  });
  binaryInput.addEventListener('paste', function() {
    handleBinaryInput();
    updateUrlParameters();
  });
  if (!window.location.search) {
    binaryInput.value = "RPI"; // Set default value only if no URL params
  }

  // Setup numeric input with real-time updates
  numericInput.addEventListener('input', function() {
    updateNumericData(numericInput.value);
    updateUrlParameters();
  });
  numericInput.addEventListener('keyup', function() {
    updateNumericData(numericInput.value);
    updateUrlParameters();
  });
  numericInput.addEventListener('paste', function() {
    setTimeout(() => {
      updateNumericData(numericInput.value);
      updateUrlParameters();
    }, 10);
  });
  numericInput.addEventListener('blur', function() {
    // When user leaves the field, show the evaluated result
    const evaluated = evaluateFormula(numericInput.value);
    if (evaluated !== numericInput.value && !isNaN(parseFloat(evaluated))) {
      // Only update display if it's a valid number and different from input
      console.log('Formula evaluated:', numericInput.value, '->', evaluated);
    }
  });

  // Setup numeric mode selector
  numericModeSelect.addEventListener('change', function() {
    updateUrlParameters();
  });

  // Apply URL parameters if present, otherwise use defaults
  applyUrlParameters();

  // If no URL parameters were present, set defaults
  if (!window.location.search) {
    styleSelect.value = "solid";
    currentShader = 0;
    applyColorMode('black-on-white');
  }

  // Initialize Web Audio API
  initializeAudio();

  // Add global keyboard event listener for more reliable shift detection
  document.addEventListener('keydown', function(event) {
    // Only handle keyboard events on non-mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return; // Skip keyboard shortcuts on mobile
    }

    // Handle spacebar for audio playback
    if (event.code === 'Space' && !event.shiftKey) {
      event.preventDefault();
      if (!isAudioPlaying) {
        startAudio();
      }
      return;
    }

    if (event.code === 'Space' && event.shiftKey) {
      event.preventDefault();

      // Cycle through all seven modes: solid -> ruler -> ticker -> binary -> waveform -> circles -> numeric -> solid
      // Get current style from dropdown to ensure sync
      const currentStyle = styleSelect ? styleSelect.value : 'solid';
      const styleValues = ['solid', 'ruler', 'ticker', 'binary', 'waveform', 'circles', 'numeric'];
      const currentIndex = styleValues.indexOf(currentStyle);
      const nextIndex = (currentIndex + 1) % 7;
      const nextStyle = styleValues[nextIndex];

      // Safely update the dropdown if it exists
      if (styleSelect) {
        styleSelect.value = nextStyle;
      }

      // Trigger the change event to update UI visibility which will set currentShader correctly
      handleStyleChange();
      updateUrlParameters();

      console.log('Keyboard toggle - style:', nextStyle);
    }

    // Handle color mode shortcuts: Shift + Up/Down arrows
    if (event.shiftKey && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
      event.preventDefault();

      const colorModes = ['black-on-white', 'white-on-black', 'white-on-red', 'red-on-white'];
      const currentIndex = colorModes.indexOf(currentColorMode);

      let nextIndex;
      if (event.code === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + colorModes.length) % colorModes.length;
      } else {
        nextIndex = (currentIndex + 1) % colorModes.length;
      }

      const nextColorMode = colorModes[nextIndex];

      // Update dropdown
      if (colorModeSelect) {
        colorModeSelect.value = nextColorMode;
      }

      // Apply color mode
      applyColorMode(nextColorMode);
      updateUrlParameters();

      console.log('Keyboard toggle - color mode:', nextColorMode);
    }
  });

  // Add keyup event listener for spacebar release
  document.addEventListener('keyup', function(event) {
    // Only handle keyboard events on non-mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    if (event.code === 'Space' && !event.shiftKey) {
      event.preventDefault();
      stopAudio();
    }
  });
}

function handleBinaryInput() {
  const text = binaryInput.value || "RPI";
  updateBinaryData(text);
}

function updateBinaryData(text) {
  binaryData = textToBinary(text);
  binaryLength = binaryData.length;
}

function updateNumericData(numericString) {
  numericData = parseNumericString(numericString);
  numericLength = numericData.length;
  
  // Create texture for shader
  if (numericTexture) {
    numericTexture.remove();
  }
  numericTexture = createNumericTexture(numericData);
}



function updateRulerRepeatsDisplay() {
  // Display the current ruler repeats slider value
  const sliderValue = parseInt(rulerRepeatsSlider.value);
  rulerRepeatsDisplay.textContent = sliderValue;
}

function updateRulerUnitsDisplay() {
  // Display the current ruler units slider value
  const sliderValue = parseInt(rulerUnitsSlider.value);
  rulerUnitsDisplay.textContent = sliderValue;
}

function updateTickerDisplay() {
  // Display the current ticker slider value
  const sliderValue = parseInt(tickerSlider.value);
  tickerDisplay.textContent = sliderValue;
}

function updateTickerRatioDisplay() {
  // Display the current ticker ratio slider value as ratio
  const sliderValue = parseInt(tickerRatioSlider.value);
  tickerRatioDisplay.textContent = sliderValue + ':1';
}

function updateTickerWidthRatioDisplay() {
  // Display the current ticker width ratio slider value as ratio
  const sliderValue = parseInt(tickerWidthRatioSlider.value);
  tickerWidthRatioDisplay.textContent = '1:' + sliderValue;
}

function updateWaveformTypeDisplay() {
  const sliderValue = parseFloat(waveformTypeSlider.value);
  let displayText = '';

  if (sliderValue < 0.5) {
    displayText = 'SINE';
  } else if (sliderValue < 1.5) {
    displayText = 'SAWTOOTH';
  } else if (sliderValue < 2.5) {
    displayText = 'SQUARE';
  } else {
    displayText = 'PULSE';
  }

  waveformTypeDisplay.textContent = displayText;
}

function updateWaveformFrequencyDisplay() {
  const sliderValue = parseInt(waveformFrequencySlider.value);
  waveformFrequencyDisplay.textContent = sliderValue;
}

function updateWaveformSpeedDisplay() {
  const sliderValue = parseFloat(waveformSpeedSlider.value);
  waveformSpeedDisplay.textContent = sliderValue.toFixed(1);
}

function updateCirclesDensityDisplay() {
  const sliderValue = parseInt(circlesDensitySlider.value);
  circlesDensityDisplay.textContent = sliderValue;
  // Invalidate cache when density changes
  staticCircleData = null;
}

function updateCirclesSizeVariationDisplay() {
  const sliderValue = parseInt(circlesSizeVariationSlider.value);
  circlesSizeVariationDisplay.textContent = sliderValue;
  // Invalidate cache when size variation changes
  staticCircleData = null;
}

function updateCirclesOverlapDisplay() {
  const sliderValue = parseInt(circlesOverlapSlider.value);
  circlesOverlapDisplay.textContent = sliderValue;
  // Invalidate cache when overlap changes
  staticCircleData = null;
}

function handleCirclesModeChange() {
  const selectedMode = circlesModeSelect.value;
  
  if (selectedMode === 'grid') {
    circlesPackingControls.style.display = 'none';
    circlesGridControls.style.display = 'block';
  } else {
    circlesPackingControls.style.display = 'block';
    circlesGridControls.style.display = 'none';
  }
  
  // Invalidate cache when mode changes
  staticCircleData = null;
  redraw();
}

function updateCirclesRowsDisplay() {
  const sliderValue = parseInt(circlesRowsSlider.value);
  circlesRowsDisplay.textContent = sliderValue;
  // Invalidate cache when rows change
  staticCircleData = null;
}

function updateCirclesGridDensityDisplay() {
  const sliderValue = parseInt(circlesGridDensitySlider.value);
  circlesGridDensityDisplay.textContent = sliderValue;
  // Invalidate cache when grid density changes
  staticCircleData = null;
}

function updateCirclesSizeVariationYDisplay() {
  const sliderValue = parseInt(circlesSizeVariationYSlider.value);
  circlesSizeVariationYDisplay.textContent = sliderValue;
  // Invalidate cache when Y variation changes
  staticCircleData = null;
}

function updateCirclesSizeVariationXDisplay() {
  const sliderValue = parseInt(circlesSizeVariationXSlider.value);
  circlesSizeVariationXDisplay.textContent = sliderValue;
  // Invalidate cache when X variation changes
  staticCircleData = null;
}

function updateCirclesGridOverlapDisplay() {
  const sliderValue = parseInt(circlesGridOverlapSlider.value);
  circlesGridOverlapDisplay.textContent = sliderValue;
  // Invalidate cache when grid overlap changes
  staticCircleData = null;
}

function toggleControlPanel() {
  const isHidden = controlPanel.classList.contains('hidden');

  if (isHidden) {
    controlPanel.classList.remove('hidden');
    toggleText.textContent = 'HIDE';
  } else {
    controlPanel.classList.add('hidden');
    toggleText.textContent = 'CONTROLS';
  }
}

function handleClickOutside(event) {
  // Prevent duplicate events on mobile
  if (event.type === 'touchend' && event.cancelable) {
    event.preventDefault();
  }

  // Don't close if clicking on the toggle button or inside the control panel
  if (controlToggle && controlToggle.contains(event.target) || 
      controlPanel && controlPanel.contains(event.target)) {
    return;
  }

  // Close the panel if it's open
  if (controlPanel && !controlPanel.classList.contains('hidden')) {
    controlPanel.classList.add('hidden');
    if (toggleText) {
      toggleText.textContent = 'CONTROLS';
    }
  }
}

function handleStyleChange() {
  // Get the selected style from dropdown
  const selectedStyle = styleSelect? styleSelect.value : 'solid';

  // Set currentShader based on selected style
  switch (selectedStyle) {
    case 'solid':
      currentShader = 0;
      break;
    case 'ruler':
      currentShader = 1;
      break;
    case 'ticker':
      currentShader = 2;
      break;
    case 'binary':
      currentShader = 3;
      break;
    case 'waveform':
      currentShader = 4;
      break;
    case 'circles':
      currentShader = 5;
      break;
    case 'numeric':
      currentShader = 6;
      break;
    default:
      currentShader = 0;
      break;
  }

  // Safely update UI elements only if they exist
  if (binaryGroup && rulerGroup && tickerGroup && waveformGroup && circlesGroup && numericGroup) {
    // Hide all groups first
    binaryGroup.style.display = 'none';
    rulerGroup.style.display = 'none';
    tickerGroup.style.display = 'none';
    waveformGroup.style.display = 'none';
    circlesGroup.style.display = 'none';
    numericGroup.style.display = 'none';

    // Show the appropriate group
    switch (selectedStyle) {
      case 'ruler':
        rulerGroup.style.display = 'block';
        break;
      case 'ticker':
        tickerGroup.style.display = 'block';
        break;
      case 'binary':
        binaryGroup.style.display = 'block';
        break;
      case 'waveform':
        waveformGroup.style.display = 'block';
        break;
      case 'circles':
        circlesGroup.style.display = 'block';
        break;
      case 'numeric':
        numericGroup.style.display = 'block';
        break;
    }
  }

  console.log('Style changed to:', selectedStyle, 'currentShader:', currentShader);
}

function handleColorModeChange() {
  const selectedColorMode = colorModeSelect ? colorModeSelect.value : 'black-on-white';
  applyColorMode(selectedColorMode);
}

function applyColorMode(colorMode) {
  currentColorMode = colorMode;
  const colorScheme = colors[colorMode];

  if (colorScheme) {
    // Update body background
    document.body.style.backgroundColor = colorScheme.bg;

    // Update control panel background and text colors
    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) {
      controlPanel.style.backgroundColor = colorScheme.bg;
      controlPanel.style.color = colorScheme.fg;

      // Update border color
      if (colorMode === 'white-on-black' || colorMode === 'white-on-red') {
        controlPanel.style.borderLeftColor = colorScheme.fg;
      } else {
        controlPanel.style.borderLeftColor = '#000';
      }
    }

    // Update control toggle colors
    const controlToggle = document.getElementById('control-toggle');
    if (controlToggle) {
      controlToggle.style.color = colorScheme.fg;
    }

    // Update all control elements
    updateControlElementColors(colorScheme);

    console.log('Color mode applied:', colorMode);
  }
}

function updateControlElementColors(colorScheme) {
  // Update select elements and dropdown arrows
  const selects = document.querySelectorAll('.control-select');
  selects.forEach(select => {
    select.style.backgroundColor = colorScheme.bg;
    select.style.color = colorScheme.fg;
    select.style.borderColor = colorScheme.fg;

    // Set dropdown arrow color
    const arrowColor = colorScheme.fg === '#ffffff' ? 'white' : 'black';
    const arrowSvg = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><polygon points="6,8 2,4 10,4" fill="${arrowColor}"/></svg>')`;
    select.style.setProperty('--dropdown-arrow', arrowSvg);
  });

  // Update input elements
  const inputs = document.querySelectorAll('.control-input');
  inputs.forEach(input => {
    input.style.backgroundColor = colorScheme.bg;
    input.style.color = colorScheme.fg;
    input.style.borderColor = colorScheme.fg;
  });

  // Update labels
  const labels = document.querySelectorAll('.control-label, .slider-labels');
  labels.forEach(label => {
    label.style.color = colorScheme.fg;
  });

  // Update sliders and slider thumbs
  const sliders = document.querySelectorAll('.control-slider');
  sliders.forEach(slider => {
    slider.style.setProperty('--slider-track-color', colorScheme.fg);
    slider.style.setProperty('--slider-thumb-color', colorScheme.fg);
  });

  // Update save button
  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.style.color = colorScheme.fg;
  }

  // Update save menu
  const saveMenu = document.getElementById('save-menu');
  if (saveMenu) {
    saveMenu.style.backgroundColor = colorScheme.bg;
    saveMenu.style.borderColor = colorScheme.fg;
  }

  // Update save options
  const saveOptions = document.querySelectorAll('.save-option');
  saveOptions.forEach(option => {
    option.style.color = colorScheme.fg;
    option.style.backgroundColor = colorScheme.bg;
    option.style.setProperty('--fg-color', colorScheme.fg);
    option.style.setProperty('--bg-color', colorScheme.bg);
  });
}

function toggleSaveMenu() {
  const saveMenu = document.getElementById('save-menu');
  saveMenu.classList.toggle('hidden');
}

function savePNG() {
  console.log('Save PNG called');

  try {
    // Hide control panel temporarily
    const wasHidden = controlPanel.classList.contains('hidden');
    if (!wasHidden) {
      controlPanel.classList.add('hidden');
    }

    setTimeout(() => {
      // Create a temporary graphics buffer with transparent background
    const currentWidth = 250; // Exact width from 250px reference
    const logoHeight = 151; // 112px letters + 20.5px spacing + 18px bar = 150.5px, rounded to 151

      // Create off-screen graphics buffer with transparent background
      const exportGraphics = createGraphics(Math.ceil(currentWidth * 1.5) + 40, Math.ceil(logoHeight * 1.5) + 40);

      // Don't set a background - leave it transparent
      exportGraphics.clear();

      // Draw the logo on the graphics buffer
      exportGraphics.push();
      exportGraphics.translate(20, 20); // Add some padding
      exportGraphics.scale(1.5);

      // Get current foreground color
      const colorScheme = colors[currentColorMode];
      const fgColor = colorScheme ? colorScheme.fg : '#000000';

      // Draw letter paths
      exportGraphics.fill(fgColor);
      exportGraphics.noStroke();
      drawSVGPathOnGraphics(exportGraphics, paths.r);
      drawSVGPathOnGraphics(exportGraphics, paths.p);
      drawSVGPathOnGraphics(exportGraphics, paths.i);

      // Draw the bar pattern - position exactly 20.5px below letters
      const barY = 134; // 112px letters + 20.5px spacing
      const barHeight = 18; // Exact height from specification
      const exactBarWidth = 250; // Exact width from 250px reference
      const barStartX = 0; // Exact X position from 250px reference

      // Always draw the bar - solid, ruler, binary, or ticker
      if (currentShader === 0) {
        // Solid bar with corner details
        const cornerSize = 1.5;

        exportGraphics.beginShape();
        // Start from top-left corner (cut)
        exportGraphics.vertex(barStartX + cornerSize, barY);
        exportGraphics.vertex(barStartX + exactBarWidth - cornerSize, barY); // Top edge
        exportGraphics.vertex(barStartX + exactBarWidth, barY + cornerSize); // Top-right corner cut
        exportGraphics.vertex(barStartX + exactBarWidth, barY + barHeight - cornerSize); // Right edge
        exportGraphics.vertex(barStartX + exactBarWidth - cornerSize, barY + barHeight); // Bottom-right corner cut
        exportGraphics.vertex(barStartX + cornerSize, barY + barHeight); // Bottom edge
        exportGraphics.vertex(barStartX, barY + barHeight - cornerSize); // Bottom-left corner cut
        exportGraphics.vertex(barStartX, barY + cornerSize); // Left edge to top-left corner cut
        exportGraphics.endShape(exportGraphics.CLOSE);
      } else {
        drawBarPatternOnGraphics(exportGraphics, barStartX, barY, exactBarWidth, barHeight);
      }

      exportGraphics.pop();

      // Get the graphics buffer canvas and export it
      const exportCanvas = exportGraphics.canvas;

      // Create download link
      const link = document.createElement('a');
      link.download = 'RPI-logo.png';
      link.href = exportCanvas.toDataURL('image/png');

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Transparent PNG save completed successfully');

      // Restore control panel
      if (!wasHidden) {
        controlPanel.classList.remove('hidden');
      }

      // Hide save menu
      document.getElementById('save-menu').classList.add('hidden');

    }, 100);

  } catch (error) {
    console.error('PNG save error:', error);
    console.error('Error stack:', error.stack);
    alert('Save failed: ' + error.message);
  }
}

function saveSVG() {
  const currentWidth = 250; // Exact width from 250px reference
  const logoHeight = 149.411; // Exact height including bar from 250px reference

  // Get current colors
  const colorScheme = colors[currentColorMode];
  const fgColor = colorScheme ? colorScheme.fg : '#000000';

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${currentWidth}" height="${logoHeight}" viewBox="0 0 ${currentWidth} ${logoHeight}" xmlns="http://www.w3.org/2000/svg">
  <path d="${paths.r}" fill="${fgColor}"/>
  <path d="${paths.p}" fill="${fgColor}"/>
  <path d="${paths.i}" fill="${fgColor}"/>`;

  // Add the bar using exact 250px reference calculations
  const barY = 132.911; // Exact Y position from 250px reference
  const barHeight = 18; // Exact height from specification
  const exactBarWidth = 250; // Exact width from 250px reference
  const barStartX = 0; // Exact X position from 250px reference

  if (currentShader === 0) {
    // Solid bar with corner details on all four corners
    const cornerSize = 1.5;
    const pathData = `M ${barStartX + cornerSize} ${barY} L ${barStartX + exactBarWidth - cornerSize} ${barY} L ${barStartX + exactBarWidth} ${barY + cornerSize} L ${barStartX + exactBarWidth} ${barY + barHeight - cornerSize} L ${barStartX + exactBarWidth - cornerSize} ${barY + barHeight} L ${barStartX + cornerSize} ${barY + barHeight} L ${barStartX} ${barY + barHeight - cornerSize} L ${barStartX} ${barY + cornerSize} Z`;
    svgContent += `\n  <path d="${pathData}" fill="${fgColor}"/>`;
  } else {
    // For other modes, create the pattern as individual rectangles
    svgContent += createBarPattern(barStartX, barY, exactBarWidth, barHeight);
  }

  svgContent += `\n</svg>`;

  // Download SVG
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RPI-logo.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Hide save menu
  document.getElementById('save-menu').classList.add('hidden');
}

function drawCirclePattern(pg, barStartX, barY, barWidth, barHeight, density, sizeVariation, overlapAmount) {
  try {
    const selectedMode = circlesModeSelect ? circlesModeSelect.value : 'packing';
    
    if (selectedMode === 'grid') {
      // Grid mode
      const rows = parseInt(circlesRowsSlider.value);
      const gridDensity = parseInt(circlesGridDensitySlider.value);
      const sizeVariationY = parseInt(circlesSizeVariationYSlider.value);
      const sizeVariationX = parseInt(circlesSizeVariationXSlider.value);
      const gridOverlap = parseInt(circlesGridOverlapSlider.value);
      const layout = circlesLayoutSelect.value;
      
      // Create parameter string for caching
      const params = `grid-${rows}-${gridDensity}-${sizeVariationY}-${sizeVariationX}-${gridOverlap}-${layout}-${barWidth}-${barHeight}`;
      
      // Only regenerate if parameters changed
      if (!staticCircleData || lastCircleParams !== params) {
        staticCircleData = generateGridCircles(barWidth, barHeight, rows, gridDensity, sizeVariationY, sizeVariationX, gridOverlap, layout);
        lastCircleParams = params;
      }
    } else {
      // Packing mode (existing functionality)
      const params = `packing-${density}-${sizeVariation}-${overlapAmount}-${barWidth}-${barHeight}`;
      
      // Only regenerate if parameters changed
      if (!staticCircleData || lastCircleParams !== params) {
        staticCircleData = generateStaticPackedCircles(barWidth, barHeight, density, sizeVariation, overlapAmount);
        lastCircleParams = params;
      }
    }

    // Safety check for data validity
    if (!staticCircleData || staticCircleData.length === 0) {
      console.warn('No valid circle data generated');
      return;
    }

    // Draw circles using the cached static data
    for (let i = 0; i < staticCircleData.length; i++) {
      const circle = staticCircleData[i];

      // Safety check for valid circle data
      if (!circle || typeof circle.x !== 'number' || typeof circle.y !== 'number' || typeof circle.r !== 'number') {
        continue;
      }

      if (pg) {
        pg.ellipse(barStartX + circle.x, barY + circle.y, circle.r * 2, circle.r * 2);
      } else {
        ellipse(barStartX + circle.x, barY + circle.y, circle.r * 2, circle.r * 2);
      }
    }
  } catch (error) {
    console.error('Error in drawCirclePattern:', error);
    // Draw a simple fallback pattern
    if (pg) {
      pg.ellipse(barStartX + barWidth/2, barY + barHeight/2, Math.min(barWidth, barHeight) * 0.8, Math.min(barWidth, barHeight) * 0.8);
    } else {
      ellipse(barStartX + barWidth/2, barY + barHeight/2, Math.min(barWidth, barHeight) * 0.8, Math.min(barWidth, barHeight) * 0.8);
    }
  }
}

// Advanced circle packing algorithm based on Collins & Stephenson paper
function generateStaticPackedCircles(barWidth, barHeight, density, sizeVariation, overlapAmount) {
  // Safety guards
  if (barWidth <= 0 || barHeight <= 0) return [];
  if (density < 10) density = 10;
  if (density > 100) density = 100;
  if (sizeVariation < 0) sizeVariation = 0;
  if (sizeVariation > 100) sizeVariation = 100;
  if (overlapAmount < 0) overlapAmount = 0;
  if (overlapAmount > 100) overlapAmount = 100;

  const area = barWidth * barHeight;
  let circles = [];

  // Multi-phase packing approach
  const phases = calculatePhaseParameters(density, sizeVariation, area, barHeight);
  
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
    const phase = phases[phaseIndex];
    const phaseCircles = executePackingPhase(
      barWidth, barHeight, circles, phase, overlapAmount
    );
    circles = circles.concat(phaseCircles);
    
    // Early termination if we've achieved good density
    const currentCoverage = calculateCoverage(circles, area);
    if (currentCoverage >= (density / 100) * 0.95) {
      break;
    }
  }

  // Gap-filling phase using spatial analysis
  const gapFillingCircles = executeGapFillingPhase(
    barWidth, barHeight, circles, density, sizeVariation, overlapAmount
  );
  circles = circles.concat(gapFillingCircles);

  console.log(`Generated ${circles.length} circles with ${Math.round(calculateCoverage(circles, area) * 100)}% coverage`);
  return circles;
}

// Calculate phase parameters based on density and size variation
function calculatePhaseParameters(density, sizeVariation, area, barHeight) {
  const phases = [];
  
  // Maximum radius is constrained by bar height (radius = height/2)
  const absoluteMaxRadius = barHeight / 2; // 9px for 18px bar height
  
  // Calculate size range based on size variation
  // 0% variation: use moderate size range
  // 100% variation: use full range from tiny to maximum possible
  const minPossibleRadius = Math.min(0.5, absoluteMaxRadius * 0.05); // Very small minimum
  const sizeRange = absoluteMaxRadius - minPossibleRadius;
  const variationFactor = sizeVariation / 100;
  
  // Base sizes scale with density and variation
  const baseSizeFactor = Math.sqrt(area) / 50;
  const baseRadius = Math.min(baseSizeFactor * (1.2 + density / 200), absoluteMaxRadius * 0.8);
  
  // Phase 1: Large circles (can reach maximum size with high variation)
  const largeMinRadius = Math.max(minPossibleRadius, baseRadius * (1 - variationFactor * 0.6));
  const largeMaxRadius = Math.min(absoluteMaxRadius, baseRadius * (1 + variationFactor * 1.2));
  
  phases.push({
    minRadius: largeMinRadius,
    maxRadius: largeMaxRadius,
    attempts: Math.floor(density * 15),
    candidatesPerAttempt: 25
  });

  // Phase 2: Medium circles
  const mediumBaseRadius = baseRadius * 0.65;
  const mediumMinRadius = Math.max(minPossibleRadius, mediumBaseRadius * (1 - variationFactor * 0.7));
  const mediumMaxRadius = Math.min(absoluteMaxRadius * 0.8, mediumBaseRadius * (1 + variationFactor * 0.8));
  
  phases.push({
    minRadius: mediumMinRadius,
    maxRadius: mediumMaxRadius,
    attempts: Math.floor(density * 30),
    candidatesPerAttempt: 35
  });

  // Phase 3: Small circles
  const smallBaseRadius = baseRadius * 0.4;
  const smallMinRadius = Math.max(minPossibleRadius, smallBaseRadius * (1 - variationFactor * 0.8));
  const smallMaxRadius = Math.min(absoluteMaxRadius * 0.6, smallBaseRadius * (1 + variationFactor * 0.6));
  
  phases.push({
    minRadius: smallMinRadius,
    maxRadius: smallMaxRadius,
    attempts: Math.floor(density * 60),
    candidatesPerAttempt: 45
  });

  // Phase 4: Micro circles for gap filling
  const microBaseRadius = baseRadius * 0.25;
  const microMinRadius = minPossibleRadius;
  const microMaxRadius = Math.min(absoluteMaxRadius * 0.4, microBaseRadius * (1 + variationFactor * 0.4));
  
  phases.push({
    minRadius: microMinRadius,
    maxRadius: microMaxRadius,
    attempts: Math.floor(density * 100),
    candidatesPerAttempt: 30
  });

  return phases;
}

// Execute a single packing phase
function executePackingPhase(barWidth, barHeight, existingCircles, phase, overlapAmount) {
  const newCircles = [];
  const minDistanceMultiplier = overlapAmount === 0 ? 2.0 : (2.0 - (overlapAmount / 100 * 1.8));
  
  // Create spatial grid for faster collision detection
  const spatialGrid = createSpatialGrid(barWidth, barHeight, existingCircles, phase.maxRadius);
  
  for (let attempt = 0; attempt < phase.attempts; attempt++) {
    let bestCandidate = null;
    let bestScore = -Infinity;
    
    // Generate candidates using improved sampling
    for (let candidate = 0; candidate < phase.candidatesPerAttempt; candidate++) {
      const radius = phase.minRadius + Math.random() * (phase.maxRadius - phase.minRadius);
      const x = radius + Math.random() * (barWidth - 2 * radius);
      const y = radius + Math.random() * (barHeight - 2 * radius);
      
      if (!hasCollisionFast(x, y, radius, existingCircles, newCircles, spatialGrid, minDistanceMultiplier)) {
        // Score based on distance to nearest circles and position diversity
        const score = calculatePlacementScore(x, y, radius, existingCircles, newCircles, barWidth, barHeight);
        
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = { x, y, r: radius };
        }
      }
    }
    
    if (bestCandidate) {
      newCircles.push(bestCandidate);
      updateSpatialGrid(spatialGrid, bestCandidate);
    }
  }
  
  return newCircles;
}

// Execute gap-filling phase using spatial analysis
function executeGapFillingPhase(barWidth, barHeight, existingCircles, density, sizeVariation, overlapAmount) {
  const gapFillingCircles = [];
  const minDistanceMultiplier = overlapAmount === 0 ? 2.0 : (2.0 - (overlapAmount / 100 * 1.8));
  
  // Analyze gaps in the current packing
  const gaps = identifyGaps(barWidth, barHeight, existingCircles);
  
  // Fill each gap with appropriately sized circles
  for (const gap of gaps) {
    if (gap.maxRadius < barWidth / 100) continue; // Skip very small gaps
    
    const targetRadius = gap.maxRadius * 0.8; // Leave some margin
    const radiusVariation = targetRadius * (sizeVariation / 400);
    
    // Try multiple attempts to fill this gap
    for (let attempt = 0; attempt < 20; attempt++) {
      const radius = Math.max(
        targetRadius * 0.5,
        targetRadius + (Math.random() - 0.5) * radiusVariation
      );
      
      if (!hasCollisionWithAllCircles(gap.x, gap.y, radius, existingCircles, gapFillingCircles, minDistanceMultiplier)) {
        gapFillingCircles.push({ x: gap.x, y: gap.y, r: radius });
        break;
      }
    }
  }
  
  return gapFillingCircles;
}

// Create spatial grid for faster collision detection
function createSpatialGrid(width, height, circles, maxRadius) {
  const cellSize = maxRadius * 2;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => []));
  
  // Populate grid with existing circles
  for (const circle of circles) {
    const minCol = Math.max(0, Math.floor((circle.x - circle.r) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((circle.x + circle.r) / cellSize));
    const minRow = Math.max(0, Math.floor((circle.y - circle.r) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((circle.y + circle.r) / cellSize));
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        grid[row][col].push(circle);
      }
    }
  }
  
  return { grid, cellSize, cols, rows };
}

// Update spatial grid with new circle
function updateSpatialGrid(spatialGrid, circle) {
  const { grid, cellSize, cols, rows } = spatialGrid;
  const minCol = Math.max(0, Math.floor((circle.x - circle.r) / cellSize));
  const maxCol = Math.min(cols - 1, Math.floor((circle.x + circle.r) / cellSize));
  const minRow = Math.max(0, Math.floor((circle.y - circle.r) / cellSize));
  const maxRow = Math.min(rows - 1, Math.floor((circle.y + circle.r) / cellSize));
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      grid[row][col].push(circle);
    }
  }
}

// Fast collision detection using spatial grid
function hasCollisionFast(x, y, radius, existingCircles, newCircles, spatialGrid, minDistanceMultiplier) {
  // Check bounds
  if (x - radius < 0 || x + radius > spatialGrid.cols * spatialGrid.cellSize || 
      y - radius < 0 || y + radius > spatialGrid.rows * spatialGrid.cellSize) {
    return true;
  }
  
  // Check against grid cells
  const { grid, cellSize } = spatialGrid;
  const minCol = Math.max(0, Math.floor((x - radius) / cellSize));
  const maxCol = Math.min(grid[0].length - 1, Math.floor((x + radius) / cellSize));
  const minRow = Math.max(0, Math.floor((y - radius) / cellSize));
  const maxRow = Math.min(grid.length - 1, Math.floor((y + radius) / cellSize));
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      for (const other of grid[row][col]) {
        const dx = x - other.x;
        const dy = y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (radius + other.r) * minDistanceMultiplier;
        
        if (distance < minDistance) {
          return true;
        }
      }
    }
  }
  
  // Check against new circles in this phase
  for (const other of newCircles) {
    const dx = x - other.x;
    const dy = y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (radius + other.r) * minDistanceMultiplier;
    
    if (distance < minDistance) {
      return true;
    }
  }
  
  return false;
}

// Calculate placement score for candidate position
function calculatePlacementScore(x, y, radius, existingCircles, newCircles, width, height) {
  let minDistance = Infinity;
  const allCircles = [...existingCircles, ...newCircles];
  
  // Find distance to nearest circle
  for (const other of allCircles) {
    const dx = x - other.x;
    const dy = y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy) - other.r - radius;
    minDistance = Math.min(minDistance, distance);
  }
  
  // Prefer positions that are:
  // 1. Far from other circles (maximal spacing)
  // 2. Not too close to edges (avoid edge effects)
  // 3. In areas with lower circle density
  
  const edgeDistance = Math.min(x - radius, width - x - radius, y - radius, height - y - radius);
  const edgeScore = Math.min(1.0, edgeDistance / (radius * 2));
  
  const densityScore = calculateLocalDensityScore(x, y, radius, allCircles, width, height);
  
  return minDistance * 0.6 + edgeScore * 0.2 + densityScore * 0.2;
}

// Calculate local density score (lower density = higher score)
function calculateLocalDensityScore(x, y, radius, circles, width, height) {
  const searchRadius = radius * 8;
  let localArea = 0;
  let occupiedArea = 0;
  
  // Calculate local density in surrounding area
  for (const circle of circles) {
    const dx = x - circle.x;
    const dy = y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < searchRadius + circle.r) {
      // Calculate overlap area between search circle and existing circle
      const overlap = calculateCircleOverlap(x, y, searchRadius, circle.x, circle.y, circle.r);
      occupiedArea += overlap;
    }
  }
  
  localArea = Math.PI * searchRadius * searchRadius;
  const density = occupiedArea / localArea;
  
  return Math.max(0, 1.0 - density);
}

// Calculate overlap area between two circles
function calculateCircleOverlap(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance >= r1 + r2) return 0; // No overlap
  if (distance <= Math.abs(r1 - r2)) {
    // One circle inside the other
    return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
  }
  
  // Partial overlap - use lens formula
  const a = r1 * r1;
  const b = r2 * r2;
  const d = distance;
  const x = (a - b + d * d) / (2 * d);
  const z = x - d;
  const y = Math.sqrt(a - x * x);
  
  return a * Math.acos(x / r1) + b * Math.acos(-z / r2) - y * d;
}

// Identify gaps in the current packing
function identifyGaps(width, height, circles) {
  const gaps = [];
  const samplePoints = Math.min(2000, width * height / 50); // Adaptive sampling
  
  for (let i = 0; i < samplePoints; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    // Find the largest circle that could fit at this point
    let maxRadius = Math.min(x, width - x, y, height - y);
    
    for (const circle of circles) {
      const dx = x - circle.x;
      const dy = y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      maxRadius = Math.min(maxRadius, distance - circle.r);
    }
    
    // If we can fit a reasonable-sized circle, mark it as a gap
    if (maxRadius > width / 200) {
      gaps.push({ x, y, maxRadius });
    }
  }
  
  // Sort gaps by size (largest first) and return top candidates
  gaps.sort((a, b) => b.maxRadius - a.maxRadius);
  return gaps.slice(0, Math.min(100, gaps.length));
}

// Check collision with all circles (used in gap filling)
function hasCollisionWithAllCircles(x, y, radius, existingCircles, newCircles, minDistanceMultiplier) {
  const allCircles = [...existingCircles, ...newCircles];
  
  for (const other of allCircles) {
    const dx = x - other.x;
    const dy = y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (radius + other.r) * minDistanceMultiplier;
    
    if (distance < minDistance) {
      return true;
    }
  }
  
  return false;
}

// Calculate coverage percentage
function calculateCoverage(circles, totalArea) {
  let occupiedArea = 0;
  for (const circle of circles) {
    occupiedArea += Math.PI * circle.r * circle.r;
  }
  return Math.min(1.0, occupiedArea / totalArea);
}

// Generate grid-based circles
function generateGridCircles(barWidth, barHeight, rows, gridDensity, sizeVariationY, sizeVariationX, gridOverlap, layout) {
  const circles = [];
  
  // Safety guards
  if (barWidth <= 0 || barHeight <= 0 || rows < 1) return [];
  
  // Calculate base circle radius that fits the number of rows
  const baseRadius = (barHeight / (rows * 2)) * (gridDensity / 100);
  const rowHeight = barHeight / rows;
  
  // Calculate how many circles fit horizontally based on circle diameter
  const circleDiameter = baseRadius * 2;
  const baseColsPerRow = Math.floor(barWidth / circleDiameter);
  
  // Add extra circles based on overlap
  const overlapFactor = 1 + (gridOverlap / 100);
  const colsPerRow = Math.floor(baseColsPerRow * overlapFactor);
  
  for (let row = 0; row < rows; row++) {
    const rowProgress = rows > 1 ? row / (rows - 1) : 0.5; // 0 to 1 from top to bottom
    
    // Calculate Y position for this row
    const baseY = rowHeight * row + rowHeight / 2;
    
    // Calculate size variation for Y (top to bottom)
    const yVariationFactor = 1 + (sizeVariationY / 100) * (1 - rowProgress * 2); // -1 to 1, then scaled
    
    // Determine number of columns and spacing for this row
    let currentCols = colsPerRow;
    let horizontalSpacing;
    let startOffset = 0;
    
    if (layout === 'stagger') {
      if (row % 2 === 0) {
        // Even rows (0, 2, 4...): regular spacing
        horizontalSpacing = barWidth / Math.max(1, currentCols - 1);
        startOffset = 0;
      } else {
        // Odd rows (1, 3, 5...): offset by half circle diameter and use same number of circles
        horizontalSpacing = barWidth / Math.max(1, currentCols - 1);
        startOffset = circleDiameter / 2;
      }
    } else {
      // Straight layout: regular spacing
      horizontalSpacing = barWidth / Math.max(1, currentCols - 1);
      startOffset = 0;
    }
    
    for (let col = 0; col < currentCols; col++) {
      const colProgress = currentCols > 1 ? col / (currentCols - 1) : 0.5; // 0 to 1 from left to right
      
      // Calculate X position for this column
      const baseX = startOffset + col * horizontalSpacing;
      
      // Skip circles that would go outside the bar width
      if (baseX < baseRadius || baseX > barWidth - baseRadius) {
        continue;
      }
      
      // Calculate size variation for X (left to right)
      const xVariationFactor = 1 + (sizeVariationX / 100) * (colProgress * 2 - 1); // -1 to 1, then scaled
      
      // Combine both variation factors
      const combinedVariationFactor = yVariationFactor * xVariationFactor;
      const finalRadius = Math.max(0.5, baseRadius * combinedVariationFactor);
      
      // Ensure circles stay within bounds
      const clampedX = Math.max(finalRadius, Math.min(barWidth - finalRadius, baseX));
      const clampedY = Math.max(finalRadius, Math.min(barHeight - finalRadius, baseY));
      
      circles.push({
        x: clampedX,
        y: clampedY,
        r: finalRadius
      });
    }
  }
  
  console.log(`Generated ${circles.length} grid circles in ${rows} rows`);
  return circles;
}

// Optimized grid generation for zero size variation
function generateOptimizedGrid(barWidth, barHeight, baseRadius, minDistanceMultiplier) {
  const circles = [];
  
  // Calculate spacing based on the minimum distance multiplier
  const spacing = baseRadius * minDistanceMultiplier;
  
  // Use hexagonal packing for optimal space utilization
  const rowHeight = spacing * Math.sqrt(3) / 2;
  const rows = Math.floor(barHeight / rowHeight);
  const cols = Math.floor(barWidth / spacing);
  
  // Center the grid
  const offsetX = (barWidth - (cols - 1) * spacing) / 2;
  const offsetY = (barHeight - (rows - 1) * rowHeight) / 2;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Alternate row offset for hexagonal packing
      const xOffset = (row % 2) * spacing * 0.5;
      const x = offsetX + col * spacing + xOffset;
      const y = offsetY + row * rowHeight;
      
      // Ensure circle fits within bounds
      if (x >= baseRadius && x <= barWidth - baseRadius && 
          y >= baseRadius && y <= barHeight - baseRadius) {
        circles.push({ x, y, r: baseRadius });
      }
    }
  }
  
  console.log(`Generated ${circles.length} circles in optimized grid`);
  return circles;
}



function createBarPattern(barStartX, barY, exactBarWidth, barHeight) {
  let pattern = '';

  // Get current foreground color
  const colorScheme = colors[currentColorMode];
  const fgColor = colorScheme ? colorScheme.fg : '#000000';

  if (currentShader === 1) {
    // Ruler pattern - match canvas exactly
    const repeats = parseInt(rulerRepeatsSlider.value);
    const units = parseInt(rulerUnitsSlider.value);
    const totalTicks = repeats * units + 1;
    const tickWidth = exactBarWidth / (2 * totalTicks - 1);
    const tickSpacing = tickWidth * 2;

    for (let i = 0; i < totalTicks; i++) {
      const tickX = barStartX + i * tickSpacing;
      let tickHeight;

      if (i === 0 || i === totalTicks - 1) {
        // Start and end ticks are full height
        tickHeight = barHeight;
      } else if (i % units === 0) {
        // Major ticks at unit boundaries are full height
        tickHeight = barHeight;
      } else {
        // Minor ticks vary by position within unit
        const positionInUnit = i % units;
        if (units === 10) {
          if (positionInUnit === 5) {
            tickHeight = barHeight * 0.75;
          } else if (positionInUnit % 2 === 0) {
            tickHeight = barHeight * 0.5;
          } else {
            tickHeight = barHeight * 0.25;
          }
        } else {
          if (positionInUnit === Math.floor(units / 2)) {
            tickHeight = barHeight * 0.75;
          } else {
            tickHeight = barHeight * 0.5;
          }
        }
      }

      const tickY = barY + barHeight - tickHeight;
      pattern += `\n    <rect x="${tickX}" y="${tickY}" width="${tickWidth}" height="${tickHeight}" fill="${fgColor}"/>`;
    }
  } else if (currentShader === 2) {
    // Ticker pattern - match canvas exactly
    const ratio = parseInt(tickerRatioSlider.value);
    const widthRatio = parseInt(tickerWidthRatioSlider.value);
    const bottomTicks = parseInt(tickerSlider.value);
    const topTicks = bottomTicks * ratio;
    const halfHeight = barHeight / 2;
    const tickSpacing = exactBarWidth / topTicks;
    const topTickWidth = tickSpacing / 2;
    const bottomTickWidth = topTickWidth * widthRatio;

    // Top row
    for (let i = 0; i < topTicks; i++) {
      const x = barStartX + i * tickSpacing;
      pattern += `\n    <rect x="${x}" y="${barY}" width="${topTickWidth}" height="${halfHeight}" fill="${fgColor}"/>`;
    }

    // Bottom row
    for (let i = 0; i < bottomTicks; i++) {
      const topIndex = i * ratio;
      const x = barStartX + topIndex * tickSpacing;
      pattern += `\n    <rect x="${x}" y="${barY + halfHeight}" width="${bottomTickWidth}" height="${halfHeight}" fill="${fgColor}"/>`;
    }
  } else if (currentShader === 3) {
    // Binary pattern - match canvas exactly
    const text = binaryInput.value || "RPI";
    const validBinaryData = textToBinary(text);

    if (validBinaryData.length === 0) {
      return pattern; // Return empty if no data
    }

    const actualBitWidth = exactBarWidth / validBinaryData.length;
    const rowHeight = barHeight / 3;

    for (let i = 0; i < validBinaryData.length; i++) {
      const x = barStartX + i * actualBitWidth;

      if (validBinaryData[i] === 1) {
        // 1 = double bars at top and bottom rows
        pattern += `\n    <rect x="${x}" y="${barY}" width="${actualBitWidth}" height="${rowHeight}" fill="${fgColor}"/>`;
        pattern += `\n    <rect x="${x}" y="${barY + rowHeight * 2}" width="${actualBitWidth}" height="${rowHeight}" fill="${fgColor}"/>`;
      } else {
        // 0 = single bar in middle row
        pattern += `\n    <rect x="${x}" y="${barY + rowHeight}" width="${actualBitWidth}" height="${rowHeight}" fill="${fgColor}"/>`;
      }
    }
  } else if (currentShader === 4) {
    // Waveform pattern - create a filled path for SVG export
    const frequency = parseInt(waveformFrequencySlider.value);
    const waveType = parseFloat(waveformTypeSlider.value);
    const points = 200; // Number of points to draw the waveform

    // Helper function for smooth waveform generation (same as canvas)
    function generateWaveValue(phase, type) {
      const normalizedPhase = phase - Math.floor(phase);
      const wrappedPhase = normalizedPhase < 0 ? normalizedPhase + 1 : normalizedPhase;

      if (type < 1.0) {
        // Sine to sawtooth interpolation
        const sine = (Math.sin(phase * 2 * Math.PI) + 1) * 0.5;
        const saw = wrappedPhase;
        return sine + (saw - sine) * type;
      } else if (type < 2.0) {
        // Sawtooth to square interpolation
        const saw = wrappedPhase;
        const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
        const t = type - 1.0;
        return saw + (square - saw) * t;
      } else {
        // Square to pulse interpolation
        const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
        const pulse = wrappedPhase > 0.8 ? 1.0 : 0.0;
        const t = type - 2.0;
        return square + (pulse - square) * t;
      }
    }

    // Create a filled path
    let pathData = `M ${barStartX} ${barY + barHeight}`; // Start at bottom-left

    // Generate the waveform curve
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * exactBarWidth;
      const rawPhase = (x / exactBarWidth) * frequency;
      const wave = generateWaveValue(rawPhase, waveType);
      const y = barY + barHeight * (1.0 - Math.max(0, Math.min(1, wave)));

      pathData += ` L ${barStartX + x} ${y}`;
    }

    // Complete the polygon by going to bottom-right corner
    pathData += ` L ${barStartX + exactBarWidth} ${barY + barHeight} Z`;

    pattern += `\n    <path d="${pathData}" fill="${fgColor}"/>`;
  } else if (currentShader === 5) {
    // Circles pattern
    const selectedMode = circlesModeSelect ? circlesModeSelect.value : 'packing';
    const fillStyle = circlesFillSelect.value;
    let circleData;

    if (selectedMode === 'grid') {
      // Grid mode
      const rows = parseInt(circlesRowsSlider.value);
      const gridDensity = parseInt(circlesGridDensitySlider.value);
      const sizeVariationY = parseInt(circlesSizeVariationYSlider.value);
      const sizeVariationX = parseInt(circlesSizeVariationXSlider.value);
      const gridOverlap = parseInt(circlesGridOverlapSlider.value);
      const layout = circlesLayoutSelect.value;
      
      circleData = generateGridCircles(exactBarWidth, barHeight, rows, gridDensity, sizeVariationY, sizeVariationX, gridOverlap, layout);
    } else {
      // Packing mode
      const density = parseInt(circlesDensitySlider.value);
      const sizeVariation = parseInt(circlesSizeVariationSlider.value);
      const overlapAmount = parseInt(circlesOverlapSlider.value);
      
      circleData = generateStaticPackedCircles(exactBarWidth, barHeight, density, sizeVariation, overlapAmount);
    }

    // Create SVG circles
    for (let i = 0; i < circleData.length; i++) {
      const circle = circleData[i];

      if (fillStyle === 'fill') {
        pattern += `\n    <circle cx="${barStartX + circle.x}" cy="${barY + circle.y}" r="${circle.r}" fill="${fgColor}"/>`;
      } else {
        pattern += `\n    <circle cx="${barStartX + circle.x}" cy="${barY + circle.y}" r="${circle.r}" fill="none" stroke="${fgColor}" stroke-width="1"/>`;
      }
    }
  } else if (currentShader === 6) {
    // Numeric pattern - get visualization mode
    const numericString = numericInput.value || "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
    const digits = parseNumericString(numericString);
    const mode = numericModeSelect ? numericModeSelect.value : 'height';

    if (digits.length > 0) {
      const digitWidth = exactBarWidth / digits.length;

      if (mode === 'height') {
        // Height Encoding mode - digit height bars with inner border
        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const x = barStartX + i * digitWidth;

          // Skip decimal points (value 10) - they create spacing
          if (digit === 10) {
            continue;
          }

          // Map digits 0-9 to height percentages
          let heightPercent = 0.0;
          switch (digit) {
            case 0: heightPercent = 0.1; break;  // 10%
            case 1: heightPercent = 0.2; break;  // 20%
            case 2: heightPercent = 0.3; break;  // 30%
            case 3: heightPercent = 0.4; break;  // 40%
            case 4: heightPercent = 0.5; break;  // 50%
            case 5: heightPercent = 0.6; break;  // 60%
            case 6: heightPercent = 0.7; break;  // 70%
            case 7: heightPercent = 0.8; break;  // 80%
            case 8: heightPercent = 0.9; break;  // 90%
            case 9: heightPercent = 1.0; break;  // 100%
          }

          const rectHeight = barHeight * heightPercent;
          const rectY = barY + barHeight - rectHeight; // Position from bottom

          pattern += `\n    <rect x="${x}" y="${rectY}" width="${digitWidth}" height="${rectHeight}" fill="${fgColor}"/>`;
        }

        // Add 1px inner stroke around the entire bar
        pattern += `\n    <rect x="${barStartX + 0.5}" y="${barY + 0.5}" width="${exactBarWidth - 1}" height="${barHeight - 1}" fill="none" stroke="${fgColor}" stroke-width="1"/>`;
        
      } else if (mode === 'dotmatrix') {
        // Dot Matrix mode - dots distributed evenly across the full height of the bar
        const horizontalGap = 1; // Minimum gap between digit columns
        const dotHeight = 1.5; // Height of each dot
        
        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const x = barStartX + i * digitWidth;

          // Skip decimal points (value 10) - they create spacing
          if (digit === 10) {
            continue;
          }

          // Calculate dot width to stretch across most of the digit column width
          // Leave half the horizontal gap on each side
          const dotWidth = digitWidth - horizontalGap;
          const dotX = x + horizontalGap / 2;
          
          // For digits > 0, distribute dots evenly across the full bar height
          if (digit > 0) {
            // Calculate the available space for dots
            const availableHeight = barHeight - dotHeight; // Reserve space for dot height
            
            // Distribute dots evenly across the available height
            for (let dotIndex = 0; dotIndex < digit; dotIndex++) {
              let dotY;
              
              if (digit === 1) {
                // Single dot: center it vertically
                dotY = barY + (barHeight - dotHeight) / 2;
              } else {
                // Multiple dots: distribute evenly from top to bottom
                const spacing = availableHeight / (digit - 1);
                dotY = barY + dotIndex * spacing;
              }
              
              // Use rounded rectangle that stretches across the digit width
              pattern += `\n    <rect x="${dotX}" y="${dotY}" width="${dotWidth}" height="${dotHeight}" rx="${dotHeight/2}" fill="${fgColor}"/>`;
            }
          }
        }
      }
    }
  }

  return pattern;
}

// Audio functions
async function initializeAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create gain node for volume control and smooth fade in/out
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;

    console.log('Audio context initialized successfully');
  } catch (error) {
    console.error('Failed to initialize audio context:', error);
  }
}

async function startAudio() {
  // Only play audio when waveform mode is selected
  if (!audioContext || isAudioPlaying || currentShader !== 4) return;

  try {
    // Resume audio context if suspended (required by browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Get current parameters
    const frequency = parseInt(waveformFrequencySlider.value);

    // Map frequency from 10-100 to C1-C5 (32.70Hz to 523.25Hz)
    const minFreq = 32.70; // C1
    const maxFreq = 523.25; // C5
    const normalizedFreq = (frequency - 10) / 90; // Normalize 10-100 to 0-1
    const mappedFrequency = minFreq + (normalizedFreq * (maxFreq - minFreq));

    // Create basic oscillators for smooth morphing
    const waveTypes = ['sine', 'sawtooth', 'square'];

    waveTypes.forEach(type => {
      // Create oscillator
      oscillators[type] = audioContext.createOscillator();
      oscillators[type].type = type;
      oscillators[type].frequency.setValueAtTime(mappedFrequency, audioContext.currentTime);

      // Create individual gain node for each oscillator
      oscillatorGains[type] = audioContext.createGain();
      oscillatorGains[type].gain.setValueAtTime(0, audioContext.currentTime);

      // Connect oscillator -> gain -> master gain -> destination
      oscillators[type].connect(oscillatorGains[type]);
      oscillatorGains[type].connect(gainNode);

      // Start oscillator
      oscillators[type].start();
    });

    // Create pulse wave oscillators using two sawtooth waves
    // This technique creates a true pulse wave by combining two sawtooth waves with phase offset

    // First sawtooth for pulse wave (normal phase)
    oscillators.pulse1 = audioContext.createOscillator();
    oscillators.pulse1.type = 'sawtooth';
    oscillators.pulse1.frequency.setValueAtTime(mappedFrequency, audioContext.currentTime);

    oscillatorGains.pulse1.gain.setValueAtTime(0, audioContext.currentTime);

    oscillators.pulse1.connect(oscillatorGains.pulse1);
    oscillators.pulse1.connect(gainNode);
    oscillators.pulse1.start();

    // Second sawtooth for pulse wave (with phase delay to create pulse width control)
    // Create a delay node to offset the phase
    const delayNode = audioContext.createDelay(1.0);

    oscillators.pulse2 = audioContext.createOscillator();
    oscillators.pulse2.type = 'sawtooth';
    oscillators.pulse2.frequency.setValueAtTime(mappedFrequency, audioContext.currentTime);

    oscillatorGains.pulse2 = audioContext.createGain();
    oscillatorGains.pulse2.gain.setValueAtTime(0, audioContext.currentTime);

    // Calculate delay time for pulse width (start with 50% duty cycle)
    const pulsePhaseDelay = 0.5 / mappedFrequency; // 50% of the period
    delayNode.delayTime.setValueAtTime(pulsePhaseDelay, audioContext.currentTime);

    // Invert the second sawtooth by using negative gain and adding DC offset
    const invertGain = audioContext.createGain();
    invertGain.gain.setValueAtTime(-1, audioContext.currentTime);

    // Connect: oscillator -> delay -> invert -> gain -> master gain
    oscillators.pulse2.connect(delayNode);
    delayNode.connect(invertGain);
    invertGain.connect(oscillatorGains.pulse2);
    oscillatorGains.pulse2.connect(gainNode);
    oscillators.pulse2.start();

    // Set master gain
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + 0.05);

    isAudioPlaying = true;

    // Set initial waveform mix
    updateAudioParameters();

    console.log('Audio started - Frequency:', mappedFrequency, 'Type: morphing oscillators with pulse wave');

  } catch (error) {
    console.error('Failed to start audio:', error);
  }
}

function stopAudio() {
  if (!isAudioPlaying) return;

  try {
    // Fade out master gain
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);

    // Stop all oscillators after fade out
    Object.keys(oscillators).forEach(type => {
      if (oscillators[type]) {
        oscillators[type].stop(audioContext.currentTime + 0.05);
        oscillators[type] = null;
      }
      if (oscillatorGains[type]) {
        oscillatorGains[type] = null;
      }
    });

    isAudioPlaying = false;

    console.log('Audio stopped');

  } catch (error) {
    console.error('Failed to stop audio:', error);
  }
}

// Audio oscillator management for smooth morphing
let oscillators = {
  sine: null,
  sawtooth: null,
  square: null,
  pulse1: null, // First sawtooth for pulse wave
  pulse2: null  // Second sawtooth for pulse wave (inverted phase)
};
let oscillatorGains = {
  sine: null,
  sawtooth: null,
  square: null,
  pulse1: null,
  pulse2: null
};

// URL parameter management
function getUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  return {
    style: params.get('style') || 'solid',
    colorMode: params.get('colorMode') || 'black-on-white',
    
    // Binary parameters
    binaryText: params.get('binaryText') || 'RPI',
    
    // Numeric parameters
    numericValue: params.get('numericValue') || '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679',
    numericMode: params.get('numericMode') || 'height',
    
    // Ruler parameters
    rulerRepeats: parseInt(params.get('rulerRepeats')) || 10,
    rulerUnits: parseInt(params.get('rulerUnits')) || 4,
    
    // Ticker parameters
    tickerRepeats: parseInt(params.get('tickerRepeats')) || 34,
    tickerRatio: parseInt(params.get('tickerRatio')) || 2,
    tickerWidthRatio: parseInt(params.get('tickerWidthRatio')) || 2,
    
    // Waveform parameters
    waveformType: parseFloat(params.get('waveformType')) || 0,
    waveformFrequency: parseInt(params.get('waveformFrequency')) || 24,
    waveformSpeed: parseFloat(params.get('waveformSpeed')) || 0.7,
    
    // Circles parameters
    circlesMode: params.get('circlesMode') || 'packing',
    circlesFill: params.get('circlesFill') || 'stroke',
    circlesDensity: parseInt(params.get('circlesDensity')) || 50,
    circlesSizeVariation: parseInt(params.get('circlesSizeVariation')) || 0,
    circlesOverlap: parseInt(params.get('circlesOverlap')) || 0,
    
    // Grid circles parameters
    circlesRows: parseInt(params.get('circlesRows')) || 2,
    circlesGridDensity: parseInt(params.get('circlesGridDensity')) || 100,
    circlesSizeVariationY: parseInt(params.get('circlesSizeVariationY')) || 0,
    circlesSizeVariationX: parseInt(params.get('circlesSizeVariationX')) || 0,
    circlesGridOverlap: parseInt(params.get('circlesGridOverlap')) || 0,
    circlesLayout: params.get('circlesLayout') || 'straight'
  };
}

function updateUrlParameters() {
  const params = new URLSearchParams();
  
  // Only add parameters that differ from defaults to keep URLs clean
  if (styleSelect && styleSelect.value !== 'solid') {
    params.set('style', styleSelect.value);
  }
  
  if (colorModeSelect && colorModeSelect.value !== 'black-on-white') {
    params.set('colorMode', colorModeSelect.value);
  }
  
  // Add style-specific parameters only when that style is active
  if (styleSelect && styleSelect.value === 'binary') {
    if (binaryInput && binaryInput.value !== 'RPI') {
      params.set('binaryText', binaryInput.value);
    }
  }
  
  if (styleSelect && styleSelect.value === 'numeric') {
    if (numericInput && numericInput.value !== '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679') {
      params.set('numericValue', numericInput.value);
    }
    if (numericModeSelect && numericModeSelect.value !== 'height') {
      params.set('numericMode', numericModeSelect.value);
    }
  }
  
  if (styleSelect && styleSelect.value === 'ruler') {
    if (rulerRepeatsSlider && parseInt(rulerRepeatsSlider.value) !== 10) {
      params.set('rulerRepeats', rulerRepeatsSlider.value);
    }
    if (rulerUnitsSlider && parseInt(rulerUnitsSlider.value) !== 4) {
      params.set('rulerUnits', rulerUnitsSlider.value);
    }
  }
  
  if (styleSelect && styleSelect.value === 'ticker') {
    if (tickerSlider && parseInt(tickerSlider.value) !== 34) {
      params.set('tickerRepeats', tickerSlider.value);
    }
    if (tickerRatioSlider && parseInt(tickerRatioSlider.value) !== 2) {
      params.set('tickerRatio', tickerRatioSlider.value);
    }
    if (tickerWidthRatioSlider && parseInt(tickerWidthRatioSlider.value) !== 2) {
      params.set('tickerWidthRatio', tickerWidthRatioSlider.value);
    }
  }
  
  if (styleSelect && styleSelect.value === 'waveform') {
    if (waveformTypeSlider && parseFloat(waveformTypeSlider.value) !== 0) {
      params.set('waveformType', waveformTypeSlider.value);
    }
    if (waveformFrequencySlider && parseInt(waveformFrequencySlider.value) !== 24) {
      params.set('waveformFrequency', waveformFrequencySlider.value);
    }
    if (waveformSpeedSlider && parseFloat(waveformSpeedSlider.value) !== 0.7) {
      params.set('waveformSpeed', waveformSpeedSlider.value);
    }
  }
  
  if (styleSelect && styleSelect.value === 'circles') {
    if (circlesModeSelect && circlesModeSelect.value !== 'packing') {
      params.set('circlesMode', circlesModeSelect.value);
    }
    if (circlesFillSelect && circlesFillSelect.value !== 'stroke') {
      params.set('circlesFill', circlesFillSelect.value);
    }
    
    if (circlesModeSelect && circlesModeSelect.value === 'packing') {
      if (circlesDensitySlider && parseInt(circlesDensitySlider.value) !== 50) {
        params.set('circlesDensity', circlesDensitySlider.value);
      }
      if (circlesSizeVariationSlider && parseInt(circlesSizeVariationSlider.value) !== 0) {
        params.set('circlesSizeVariation', circlesSizeVariationSlider.value);
      }
      if (circlesOverlapSlider && parseInt(circlesOverlapSlider.value) !== 0) {
        params.set('circlesOverlap', circlesOverlapSlider.value);
      }
    } else {
      if (circlesRowsSlider && parseInt(circlesRowsSlider.value) !== 2) {
        params.set('circlesRows', circlesRowsSlider.value);
      }
      if (circlesGridDensitySlider && parseInt(circlesGridDensitySlider.value) !== 100) {
        params.set('circlesGridDensity', circlesGridDensitySlider.value);
      }
      if (circlesSizeVariationYSlider && parseInt(circlesSizeVariationYSlider.value) !== 0) {
        params.set('circlesSizeVariationY', circlesSizeVariationYSlider.value);
      }
      if (circlesSizeVariationXSlider && parseInt(circlesSizeVariationXSlider.value) !== 0) {
        params.set('circlesSizeVariationX', circlesSizeVariationXSlider.value);
      }
      if (circlesGridOverlapSlider && parseInt(circlesGridOverlapSlider.value) !== 0) {
        params.set('circlesGridOverlap', circlesGridOverlapSlider.value);
      }
      if (circlesLayoutSelect && circlesLayoutSelect.value !== 'straight') {
        params.set('circlesLayout', circlesLayoutSelect.value);
      }
    }
  }
  
  // Update URL without reloading the page
  const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}

function applyUrlParameters() {
  const params = getUrlParameters();
  
  // Apply style
  if (styleSelect) {
    styleSelect.value = params.style;
  }
  
  // Apply color mode
  if (colorModeSelect) {
    colorModeSelect.value = params.colorMode;
  }
  applyColorMode(params.colorMode);
  
  // Apply binary parameters
  if (binaryInput) {
    binaryInput.value = params.binaryText;
  }
  
  // Apply numeric parameters
  if (numericInput) {
    numericInput.value = params.numericValue;
    updateNumericData(params.numericValue);
  }
  if (numericModeSelect) {
    numericModeSelect.value = params.numericMode;
  }
  
  // Apply ruler parameters
  if (rulerRepeatsSlider) {
    rulerRepeatsSlider.value = params.rulerRepeats;
  }
  if (rulerUnitsSlider) {
    rulerUnitsSlider.value = params.rulerUnits;
  }
  
  // Apply ticker parameters
  if (tickerSlider) {
    tickerSlider.value = params.tickerRepeats;
  }
  if (tickerRatioSlider) {
    tickerRatioSlider.value = params.tickerRatio;
  }
  if (tickerWidthRatioSlider) {
    tickerWidthRatioSlider.value = params.tickerWidthRatio;
  }
  
  // Apply waveform parameters
  if (waveformTypeSlider) {
    waveformTypeSlider.value = params.waveformType;
  }
  if (waveformFrequencySlider) {
    waveformFrequencySlider.value = params.waveformFrequency;
  }
  if (waveformSpeedSlider) {
    waveformSpeedSlider.value = params.waveformSpeed;
  }
  
  // Apply circles parameters
  if (circlesModeSelect) {
    circlesModeSelect.value = params.circlesMode;
  }
  if (circlesFillSelect) {
    circlesFillSelect.value = params.circlesFill;
  }
  if (circlesDensitySlider) {
    circlesDensitySlider.value = params.circlesDensity;
  }
  if (circlesSizeVariationSlider) {
    circlesSizeVariationSlider.value = params.circlesSizeVariation;
  }
  if (circlesOverlapSlider) {
    circlesOverlapSlider.value = params.circlesOverlap;
  }
  
  // Apply grid circles parameters
  if (circlesRowsSlider) {
    circlesRowsSlider.value = params.circlesRows;
  }
  if (circlesGridDensitySlider) {
    circlesGridDensitySlider.value = params.circlesGridDensity;
  }
  if (circlesSizeVariationYSlider) {
    circlesSizeVariationYSlider.value = params.circlesSizeVariationY;
  }
  if (circlesSizeVariationXSlider) {
    circlesSizeVariationXSlider.value = params.circlesSizeVariationX;
  }
  if (circlesGridOverlapSlider) {
    circlesGridOverlapSlider.value = params.circlesGridOverlap;
  }
  if (circlesLayoutSelect) {
    circlesLayoutSelect.value = params.circlesLayout;
  }
  
  // Update all displays and trigger style change
  updateAllDisplays();
  handleStyleChange();
  handleCirclesModeChange();
  
  // Update binary data
  updateBinaryData(params.binaryText);
}

function updateAllDisplays() {
  // Update all slider displays
  updateRulerRepeatsDisplay();
  updateRulerUnitsDisplay();
  updateTickerDisplay();
  updateTickerRatioDisplay();
  updateTickerWidthRatioDisplay();
  updateWaveformTypeDisplay();
  updateWaveformFrequencyDisplay();
  updateWaveformSpeedDisplay();
  updateCirclesDensityDisplay();
  updateCirclesSizeVariationDisplay();
  updateCirclesOverlapDisplay();
  updateCirclesRowsDisplay();
  updateCirclesGridDensityDisplay();
  updateCirclesSizeVariationYDisplay();
  updateCirclesSizeVariationXDisplay();
  updateCirclesGridOverlapDisplay();
}

function updateAudioParameters() {
  if (!isAudioPlaying || currentShader !== 4) return;

  try {
    const frequency = parseInt(waveformFrequencySlider.value);
    const waveType = parseFloat(waveformTypeSlider.value);

    // Map frequency from 10-100 to C1-C5 (32.70Hz to 523.25Hz)
    const minFreq = 32.70; // C1
    const maxFreq = 523.25; // C5
    const normalizedFreq = (frequency - 10) / 90; // Normalize 10-100 to 0-1
    const mappedFrequency = minFreq + (normalizedFreq * (maxFreq - minFreq));

    // Update frequency on all active oscillators
    Object.values(oscillators).forEach(osc => {
      if (osc) {
        osc.frequency.exponentialRampToValueAtTime(mappedFrequency, audioContext.currentTime + 0.1);
      }
    });

    // Calculate mix ratios for smooth morphing
    let sineGain = 0;
    let sawGain = 0;
    let squareGain = 0;
    let pulse1Gain = 0;
    let pulse2Gain = 0;

    if (waveType <= 1.0) {
      // Sine to sawtooth (0.0 to 1.0)
      sineGain = Math.max(0, 1.0 - waveType);
      sawGain = Math.min(1.0, waveType);
    } else if (waveType <= 2.0) {
      // Sawtooth to square (1.0 to 2.0)
      const t = waveType - 1.0;
      sawGain = Math.max(0, 1.0 - t);
      squareGain = Math.min(1.0, t);
    } else {
      // Square to pulse (2.0 to 3.0) - create real pulse wave
      const t = waveType - 2.0; // 0 to 1
      squareGain = Math.max(0, 1.0 - t);

      // For pulse wave, use two sawtooth oscillators with opposite phases
      // The pulse width is controlled by the relative gain between them
      const pulseWidth = 0.2 + t * 0.6; // Pulse width from 20% to 80%
      pulse1Gain = Math.min(1.0, t) * 0.5; // Primary sawtooth
      pulse2Gain = Math.min(1.0, t) * 0.5 * (1.0 - pulseWidth); // Inverted sawtooth with duty cycle control
    }

    // Normalize gains to prevent volume changes
    const totalGain = sineGain + sawGain + squareGain + pulse1Gain + pulse2Gain;
    if (totalGain > 0) {
      sineGain /= totalGain;
      sawGain /= totalGain;
      squareGain /= totalGain;
      pulse1Gain /= totalGain;
      pulse2Gain /= totalGain;
    }

    // Apply master volume scaling
    const masterVolume = 0.1;
    sineGain *= masterVolume;
    sawGain *= masterVolume;
    squareGain *= masterVolume;
    pulse1Gain *= masterVolume;
    pulse2Gain *= masterVolume;

    // Smoothly update gain values
    const rampTime = 0.02; // 20ms for smooth transitions
    if (oscillatorGains.sine) {
      oscillatorGains.sine.gain.linearRampToValueAtTime(sineGain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.sawtooth) {
      oscillatorGains.sawtooth.gain.linearRampToValueAtTime(sawGain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.square) {
      oscillatorGains.square.gain.linearRampToValueAtTime(squareGain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.pulse1) {
      oscillatorGains.pulse1.gain.linearRampToValueAtTime(pulse1Gain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.pulse2) {
      oscillatorGains.pulse2.gain.linearRampToValueAtTime(pulse2Gain, audioContext.currentTime + rampTime);
    }

  } catch (error) {
    console.error('Failed to update audio parameters:', error);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Frame rate limiting for performance
let lastFrameTime = 0;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

function draw() {
  // Limit frame rate to prevent excessive computation
  const currentTime = millis();
  if (currentTime - lastFrameTime < FRAME_INTERVAL) {
    return;
  }
  lastFrameTime = currentTime;

  // Get current color scheme
  const colorScheme = colors[currentColorMode];

  // Set background color based on current color mode
  if (colorScheme) {
    const bgColor = color(colorScheme.bg);
    background(bgColor);
  } else {
    background(255); // Fallback to white
  }

  // Use exact 250px reference dimensions
  const currentWidth = 250;
  const logoHeight = 111.76; // Exact height from 250px reference

  // Reset shader for regular drawing
  resetShader();



  // Draw the SVG logo
  push();
  translate(-width/2, -height/2); // Convert to screen coordinates for WEBGL
  translate(width/2, height/2);

  // Scale the logo appropriately
  scale(1.5);

  // Center the logo
  translate(-currentWidth/2, LOGO_VERTICAL_OFFSET);

  // Draw the actual SVG paths (excluding bar) with current foreground color
  if (colorScheme) {
    const fgColor = color(colorScheme.fg);
    fill(fgColor);
  } else {
    fill(0); // Fallback to black
  }
  noStroke();

  drawSVGPath(paths.r);
  drawSVGPath(paths.p);
  drawSVGPath(paths.i);

  pop();

  // Draw bottom bar
  drawBottomBar(currentWidth);
}

function drawBottomBar(currentWidth) {
  // Use the exact same coordinate system and positioning as the logo
  push();
  translate(-width/2, -height/2); // Convert to screen coordinates for WEBGL
  translate(width/2, height/2);

  // Scale the same as logo
  scale(1.5);

  // Center the same as logo
  translate(-currentWidth/2, LOGO_VERTICAL_OFFSET);

  // Position the bar to match 250px reference exactly
  translate(0, 132.911); // Match exact bar Y position from 250px reference

  // Calculate bar dimensions to match 250px reference exactly
const exactBarWidth = 250; // Exact width from 250px reference
  const rectHeight = 18; // Exact height from 250px reference
  const barStartX = 0; // Exact X position from 250px reference

  // Get current foreground color
  const colorScheme = colors[currentColorMode];
  const fgColor = colorScheme ? color(colorScheme.fg) : color(0);

  // Always draw the bar - solid, ruler, binary, or ticker
  if (currentShader === 0) {
    // Solid mode - draw with current foreground color and corner details
    resetShader();
    fill(fgColor);
    noStroke();
    rectMode(CORNER);

    // Draw rectangle with 45-degree corner cuts on all four corners
    const cornerSize = 1.5;

    beginShape();
    // Start from top-left corner (cut)
    vertex(barStartX + cornerSize, 0);
    vertex(barStartX + exactBarWidth - cornerSize, 0); // Top edge
    vertex(barStartX + exactBarWidth, cornerSize); // Top-right corner cut
    vertex(barStartX + exactBarWidth, rectHeight - cornerSize); // Right edge
    vertex(barStartX + exactBarWidth - cornerSize, rectHeight); // Bottom-right corner cut
    vertex(barStartX + cornerSize, rectHeight); // Bottom edge
    vertex(barStartX, rectHeight - cornerSize); // Bottom-left corner cut
    vertex(barStartX, cornerSize); // Left edge to top-left corner cut
    endShape(CLOSE);

  } else if (currentShader === 1) {
    // Ruler mode - metric ruler pattern with fixed width ticks
    resetShader();
    fill(fgColor);
    noStroke();

    const repeats = parseInt(rulerRepeatsSlider.value);
    const units = parseInt(rulerUnitsSlider.value);

    // Calculate total number of ticks needed (including major ticks)
    const totalTicks = repeats * units + 1; // +1 for the final major tick

    // Calculate tick width so that tick width = gap width
    // Total space = totalTicks * tickWidth + (totalTicks - 1) * gapWidth
    // Since tickWidth = gapWidth, total space = totalTicks * tickWidth + (totalTicks - 1) * tickWidth
    // Total space = tickWidth * (2 * totalTicks - 1)
    const tickWidth = exactBarWidth / (2 * totalTicks - 1);
    const gapWidth = tickWidth; // Equal to tick width
    const tickSpacing = tickWidth + gapWidth;

    // Draw all ticks
    for (let i = 0; i < totalTicks; i++) {
      const tickX = barStartX + i * tickSpacing;

      // Determine tick height based on position
      let tickHeight;

      if (i === 0 || i === totalTicks - 1) {
        // Start and end ticks are full height
        tickHeight = rectHeight;
      } else if (i % units === 0) {
        // Major ticks at unit boundaries are full height
        tickHeight = rectHeight;
      } else {
        // Minor ticks vary by position within unit
        const positionInUnit = i % units;

        if (units === 10) {
          // Metric system (10 units)
          if (positionInUnit === 5) {
            tickHeight = rectHeight * 0.75; // Medium tick at 5
          } else if (positionInUnit % 2 === 0) {
            tickHeight = rectHeight * 0.5; // Small tick at even numbers
          } else {
            tickHeight = rectHeight * 0.25; // Smallest tick at odd numbers
          }
        } else {
          // For other unit counts, use a simpler pattern
          if (positionInUnit === Math.floor(units / 2)) {
            tickHeight = rectHeight * 0.75; // Medium tick at middle
          } else {
            tickHeight = rectHeight * 0.5; // Small ticks elsewhere
          }
        }
      }

      // Draw tick from bottom up
      const tickY = rectHeight - tickHeight;
      rect(tickX, tickY, tickWidth, tickHeight);
    }

  } else if (currentShader === 2) {
    // Ticker mode - aligned top and bottom ticks with proper ratios
    resetShader();
    fill(fgColor);
    noStroke();

    // Split the bar into top and bottom halves
    const halfHeight = rectHeight / 2;

    // Get ratio from sliders
    const ratio = parseInt(tickerRatioSlider.value);
    const widthRatio = parseInt(tickerWidthRatioSlider.value);

    // Calculate tick counts
    const bottomTicks = parseInt(tickerSlider.value);
    const topTicks = bottomTicks * ratio;

    // Calculate spacing - divide available width by number of ticks
    const tickSpacing = exactBarWidth / topTicks;
    const topTickWidth = tickSpacing / 2; // Half spacing for tick, half for gap
    const bottomTickWidth = topTickWidth * widthRatio;

    // Draw top row - every position
    for (let i = 0; i < topTicks; i++) {
      const x = barStartX + i * tickSpacing;
      rect(x, 0, topTickWidth, halfHeight);
    }

    // Draw bottom row - only at positions that align with the ratio
    for (let i = 0; i < bottomTicks; i++) {
      const topIndex = i * ratio;
      const x = barStartX + topIndex * tickSpacing;
      rect(x, halfHeight, bottomTickWidth, halfHeight);
    }

  } else if (currentShader === 3) {
    // Binary mode - 3-row grid: 0 = center bar, 1 = top and bottom bars
    resetShader();
    fill(fgColor);
    noStroke();

    // Get the binary data for the current text (default "RPI")
    const text = binaryInput.value || "RPI";
    const validBinaryData = textToBinary(text);

    // Safety check to prevent division by zero
    if (validBinaryData.length === 0) {
      return; // Skip drawing if no data
    }

    // No gaps between bits - they should touch
    const actualBitWidth = exactBarWidth / validBinaryData.length;

    // Define the 3-row grid
    const rowHeight = rectHeight / 3;
    const topRowY = 0;
    const middleRowY = rowHeight;
    const bottomRowY = rowHeight * 2;

    for (let i = 0; i < validBinaryData.length; i++) {
      const x = barStartX + i * actualBitWidth;

      if (validBinaryData[i] === 1) {
        // 1 = double bars at top and bottom rows
        rect(x, topRowY, actualBitWidth, rowHeight);
        rect(x, bottomRowY, actualBitWidth, rowHeight);
      } else {
        // 0 = single bar in middle row (vertically centered)
        rect(x, middleRowY, actualBitWidth, rowHeight);
      }
    }
  } else if (currentShader === 4) {
    // Waveform mode - draw a procedural waveform within the bar area
    resetShader();

    const frequency = parseInt(waveformFrequencySlider.value);
    const waveType = parseFloat(waveformTypeSlider.value);
    const speed = parseFloat(waveformSpeedSlider.value);
    const time = millis() / 1000.0;

    // Calculate optimal number of points based on frequency and width for ultra-smooth rendering
    // Use much higher point density for high frequencies to prevent aliasing
    const basePoints = Math.max(300, exactBarWidth * 3);
    const frequencyMultiplier = Math.max(1, frequency / 10);
    const points = Math.ceil(basePoints * frequencyMultiplier);

    // Helper function for smooth waveform generation
    function generateWaveValue(phase, type) {
      // Normalize phase to [0, 1] range more carefully
      const normalizedPhase = phase - Math.floor(phase);
      const wrappedPhase = normalizedPhase < 0 ? normalizedPhase + 1 : normalizedPhase;

      if (type < 1.0) {
        // Sine to sawtooth interpolation
        const sine = (Math.sin(phase * 2 * Math.PI) + 1) * 0.5;
        const saw = wrappedPhase;
        return sine + (saw - sine) * type;
      } else if (type < 2.0) {
        // Sawtooth to square interpolation
        const saw = wrappedPhase;
        const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
        const t = type - 1.0;
        return saw + (square - saw) * t;
      } else {
        // Square to pulse interpolation
        const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
        const t = type - 2.0;
        return square + (pulse - square) * t;
      }
    }

    // Use fill instead of stroke for smoother rendering at high frequencies
    fill(fgColor);
    noStroke();

    // Draw as a filled polygon for ultra-smooth appearance
    beginShape();

    // Start from bottom-left corner
    vertex(barStartX, rectHeight);

    // Generate the waveform curve
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * exactBarWidth;

      // Use higher precision phase calculation
      const rawPhase = ((x / exactBarWidth) * frequency) - (time * speed);

      // Generate smooth waveform value
      const wave = generateWaveValue(rawPhase, waveType);

      // Convert to y coordinate within the bar (inverted so 1 is at top)
      const y = rectHeight * (1.0 - Math.max(0, Math.min(1, wave)));

      vertex(barStartX + x, y);
    }

    // Complete the polygon by going to bottom-right corner
    vertex(barStartX + exactBarWidth, rectHeight);

    endShape(CLOSE);
  } else if (currentShader === 5) {
    // Circles mode - draw circle patterns within the bar area
    resetShader();

    const selectedMode = circlesModeSelect ? circlesModeSelect.value : 'packing';
    const fillStyle = circlesFillSelect.value;

    if (fillStyle === 'fill') {
      fill(fgColor);
      noStroke();
    } else {
      noFill();
      stroke(fgColor);
      strokeWeight(1);
    }

    if (selectedMode === 'grid') {
      // Grid mode - parameters will be read inside drawCirclePattern
      drawCirclePattern(null, barStartX, 0, exactBarWidth, rectHeight, 0, 0, 0);
    } else {
      // Packing mode
      const density = parseInt(circlesDensitySlider.value);
      const sizeVariation = parseInt(circlesSizeVariationSlider.value);
      const overlapAmount = parseInt(circlesOverlapSlider.value);
      
      drawCirclePattern(null, barStartX, 0, exactBarWidth, rectHeight, density, sizeVariation, overlapAmount);
    }
  } else if (currentShader === 6) {
    // Numeric mode - get visualization mode
    resetShader();
    
    const numericString = numericInput.value || "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";
    const digits = parseNumericString(numericString);
    const mode = numericModeSelect ? numericModeSelect.value : 'height';

    if (digits.length > 0) {
      const digitWidth = exactBarWidth / digits.length;

      if (mode === 'height') {
        // Height Encoding mode - digit height bars with inner border
        fill(fgColor);
        noStroke();
        rectMode(CORNER);

        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const x = barStartX + i * digitWidth;

          // Skip decimal points (value 10) - they create spacing
          if (digit === 10) {
            continue;
          }

          // Map digits 0-9 to height percentages
          let heightPercent = 0.0;
          switch (digit) {
            case 0: heightPercent = 0.1; break;  // 10%
            case 1: heightPercent = 0.2; break;  // 20%
            case 2: heightPercent = 0.3; break;  // 30%
            case 3: heightPercent = 0.4; break;  // 40%
            case 4: heightPercent = 0.5; break;  // 50%
            case 5: heightPercent = 0.6; break;  // 60%
            case 6: heightPercent = 0.7; break;  // 70%
            case 7: heightPercent = 0.8; break;  // 80%
            case 8: heightPercent = 0.9; break;  // 90%
            case 9: heightPercent = 1.0; break;  // 100%
          }

          const barHeight = rectHeight * heightPercent;
          const barY = rectHeight - barHeight; // Position from bottom

          rect(x, barY, digitWidth, barHeight);
        }

        // Draw 1px inner stroke around the entire bar
        noFill();
        stroke(fgColor);
        strokeWeight(1);
        rect(barStartX + 0.5, 0.5, exactBarWidth - 1, rectHeight - 1);
        
      } else if (mode === 'dotmatrix') {
        // Dot Matrix mode - dots distributed evenly across the full height of the bar
        fill(fgColor);
        noStroke();
        rectMode(CORNER);
        
        const horizontalGap = 1; // Minimum gap between digit columns
        const dotHeight = 1.5; // Height of each dot
        
        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const x = barStartX + i * digitWidth;

          // Skip decimal points (value 10) - they create spacing
          if (digit === 10) {
            continue;
          }

          // Calculate dot width to stretch across most of the digit column width
          // Leave half the horizontal gap on each side
          const dotWidth = digitWidth - horizontalGap;
          const dotX = x + horizontalGap / 2;
          
          // For digits > 0, distribute dots evenly across the full bar height
          if (digit > 0) {
            // Calculate the available space for dots
            const availableHeight = rectHeight - dotHeight; // Reserve space for dot height
            
            // Distribute dots evenly across the available height
            for (let dotIndex = 0; dotIndex < digit; dotIndex++) {
              let dotY;
              
              if (digit === 1) {
                // Single dot: center it vertically
                dotY = (rectHeight - dotHeight) / 2;
              } else {
                // Multiple dots: distribute evenly from top to bottom
                const spacing = availableHeight / (digit - 1);
                dotY = dotIndex * spacing;
              }
              
              // Use rounded rectangle that stretches across the digit width
              rect(dotX, dotY, dotWidth, dotHeight, dotHeight/2);
            }
          }
        }
      }
    }
  } else {
    // Fallback to solid with current foreground color
    resetShader();
    fill(fgColor);
    noStroke();
    rectMode(CORNER);
    rect(barStartX, 0, exactBarWidth, rectHeight);
  }

  pop();
}

