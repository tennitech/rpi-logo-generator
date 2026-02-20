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

// Layout constants
const REFERENCE_WIDTH = 250;
const LOGO_SCALE = 1.5;
const LOGO_VERTICAL_OFFSET = -72; // Vertical offset for centering

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
let appSidebar;
let mobileMenuToggle;
let saveButton;
let saveMenu;
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
let gainNode;
let isAudioPlaying = false;

// Crossfader audio system - multiple simultaneous oscillators
let oscillators = {
  sine: null,
  sawtooth: null,
  square: null,
  pulse: null  // Custom pulse wave using AudioWorklet
};
let oscillatorGains = {
  sine: null,
  sawtooth: null,
  square: null,
  pulse: null
};
let pulseWorkletNode = null;
let lastFocusedElement = null; // For accessibility focus management

// Color scheme management
let currentColorMode = 'black-on-white';
const colors = {
  'black-on-white': { bg: '#ffffff', fg: '#000000' },
  'white-on-black': { bg: '#000000', fg: '#ffffff' },
  'white-on-red': { bg: '#d6001c', fg: '#ffffff' },
  'red-on-white': { bg: '#ffffff', fg: '#d6001c' }
};


// Viewport & Playback State
let isPlaying = true;
let zoomLevel = 1.0;
let panOffset = { x: 0, y: 0 };
let isPanningMode = false;

// Zoom/Pan/Playback UI references
let playbackBtn, iconPause, iconPlay, playbackText, playbackDivider;
let zoomInBtn, zoomOutBtn, panBtn, zoomLevelDisplay;

// Convert text to binary
function textToBinary(text) {
  if (!text || typeof text !== 'string') text = "RPI"; // Default text

  // Remove only tabs and newlines, keep regular spaces and limit length to prevent crashes
  text = text.replace(/[\t\n\r]/g, '').substring(0, 100); // Limit to 100 characters max

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


// Helper function to draw SVG paths on a graphics buffer


// Helper function to draw bar patterns on graphics buffer


async function setup() {
  // Create canvas that fills the container
  const container = document.getElementById('p5-container');
  const width = container ? container.offsetWidth : windowWidth;
  const height = container ? container.offsetHeight : windowHeight;

  let canvas = createCanvas(width, height, WEBGL);
  canvas.parent('p5-container');

  // Handle WebGL context loss to prevent crashes
  canvas.elt.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL core context lost. Suspending animation loop.');
    noLoop();
  });

  canvas.elt.addEventListener('webglcontextrestored', () => {
    console.log('WebGL core context restored. Resuming animation loop.');
    loop();
  });



  // Initialize binary data first
  updateBinaryData("RPI");

  // Initialize numeric data
  updateNumericData("3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679");

  // Load shaders from files
  try {
    shaders.binary = await loadShader('assets/shaders/vertex.glsl', 'assets/shaders/binary.frag');
    shaders.ticker = await loadShader('assets/shaders/vertex.glsl', 'assets/shaders/ticker.frag');
    shaders.ruler = await loadShader('assets/shaders/vertex.glsl', 'assets/shaders/ruler.frag');
    shaders.waveform = await loadShader('assets/shaders/vertex.glsl', 'assets/shaders/waveform.frag');
    shaders.circles = await loadShader('assets/shaders/vertex.glsl', 'assets/shaders/circles.frag');
    shaders.numeric = await loadShader('assets/shaders/vertex.glsl', 'assets/shaders/numeric.frag');
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
  tickerWidthRatioDisplay = document.getElementById('ticker-width-ratio-display');
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

  // Get new control references for Phase 2c
  playbackBtn = document.getElementById('playback-btn');
  iconPause = document.getElementById('icon-pause');
  iconPlay = document.getElementById('icon-play');
  playbackText = document.getElementById('playback-text');
  playbackDivider = document.getElementById('playback-divider');

  zoomInBtn = document.getElementById('zoom-in-btn');
  zoomOutBtn = document.getElementById('zoom-out-btn');
  panBtn = document.getElementById('pan-btn');
  zoomLevelDisplay = document.getElementById('zoom-level');

  // Setup Playback Listeners
  if (playbackBtn) {
    playbackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePlayback();
    });
  }

  // Setup Zoom Listeners
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => zoomCanvas(0.1));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => zoomCanvas(-0.1));
  }

  // Setup Pan Listener
  if (panBtn) {
    panBtn.addEventListener('click', togglePanMode);
  }
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
  appSidebar = document.getElementById('app-sidebar');
  mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  // Get save control references (globals declared at top so toggleSaveMenu can access them)
  saveButton = document.getElementById('save-button');
  saveMenu = document.getElementById('save-menu');
  const savePngButton = document.getElementById('save-png');
  const saveSvgButton = document.getElementById('save-svg');

  // Setup ruler sliders with display updates
  rulerRepeatsSlider.addEventListener('input', function () {
    updateRulerRepeatsDisplay();
    updateUrlParameters();
    requestUpdate();
  });
  rulerUnitsSlider.addEventListener('input', function () {
    updateRulerUnitsDisplay();
    updateUrlParameters();
    requestUpdate();
  });
  updateRulerRepeatsDisplay(); // Set initial value
  updateRulerUnitsDisplay(); // Set initial value

  // Setup ticker slider with display update
  tickerSlider.addEventListener('input', function () {
    updateTickerDisplay();
    updateUrlParameters();
    requestUpdate();
  });
  updateTickerDisplay(); // Set initial value

  // Setup ticker ratio slider with display update
  tickerRatioSlider.addEventListener('input', function () {
    updateTickerRatioDisplay();
    updateUrlParameters();
    requestUpdate();
  });
  updateTickerRatioDisplay(); // Set initial value

  // Setup ticker width ratio slider with display update
  tickerWidthRatioSlider.addEventListener('input', function () {
    updateTickerWidthRatioDisplay();
    updateUrlParameters();
    requestUpdate();
  });
  updateTickerWidthRatioDisplay(); // Set initial value

  // Setup waveform sliders with display updates and audio parameter updates
  waveformTypeSlider.addEventListener('input', function () {
    updateWaveformTypeDisplay();
    updateAudioParameters();
    updateUrlParameters();
    requestUpdate();
  });
  waveformFrequencySlider.addEventListener('input', function () {
    updateWaveformFrequencyDisplay();
    updateAudioParameters();
    updateUrlParameters();
    requestUpdate();
  });
  waveformSpeedSlider.addEventListener('input', function () {
    updateWaveformSpeedDisplay();
    updateUrlParameters();
    requestUpdate();
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
  circlesModeSelect.addEventListener('change', function () {
    handleCirclesModeChange();
    updateUrlParameters();
  });

  // Setup circles fill selector
  circlesFillSelect.addEventListener('change', function () {
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
  circlesLayoutSelect.addEventListener('change', function () {
    debouncedCircleUpdate();
  });

  updateCirclesRowsDisplay(); // Set initial value
  updateCirclesGridDensityDisplay(); // Set initial value
  updateCirclesSizeVariationYDisplay(); // Set initial value
  updateCirclesSizeVariationXDisplay(); // Set initial value
  updateCirclesGridOverlapDisplay(); // Set initial value

  // Setup mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMobileMenu();
    });
  }

  // Add click/touch outside to close functionality with improved mobile handling
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('touchend', handleClickOutside);

  // Focus trap and Escape key support for sidebar
  appSidebar.addEventListener('keydown', function (e) {
    // Only trap focus on mobile when sidebar is active
    if (window.innerWidth <= 768 && !appSidebar.classList.contains('active')) return;

    // Handle Escape to close (mobile only)
    if (e.key === 'Escape' && window.innerWidth <= 768) {
      e.stopPropagation();
      toggleMobileMenu();
      return;
    }

    // Handle Tab to trap focus
    if (e.key === 'Tab') {
      const focusableContent = appSidebar.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

      if (focusableContent.length === 0) return;

      const first = focusableContent[0];
      const last = focusableContent[focusableContent.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  });

  // Setup save functionality - use delegation for robustness
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('#save-button');
    if (btn) {
      toggleSaveMenu(e);
    }
  });

  if (savePngButton) {
    savePngButton.addEventListener('click', savePNG);
  }
  if (saveSvgButton) {
    saveSvgButton.addEventListener('click', saveSVG);
  }

  const copyEmbedButton = document.getElementById('copy-embed');
  if (copyEmbedButton) {
    copyEmbedButton.addEventListener('click', (e) => {
      e.stopPropagation();

      // Get current URL which includes all active parameters
      const embedUrl = window.location.href;
      const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" allowfullscreen style="border: none; overflow: hidden; background: transparent;"></iframe>`;

      navigator.clipboard.writeText(embedCode).then(() => {
        Toast.show('Embed code copied to clipboard!', 'success');
      }).catch(err => {
        console.error('Failed to copy:', err);
        Toast.show('Failed to copy embed code: ' + err.message, 'error');
      });

      // Hide menu
      if (saveMenu) saveMenu.classList.add('hidden');
    });
  }

  // Close save menu when clicking outside
  document.addEventListener('click', function (event) {
    const btn = document.getElementById('save-button');
    const menu = document.getElementById('save-menu');

    if (btn && menu && !btn.contains(event.target) && !menu.contains(event.target)) {
      if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Setup style selector
  styleSelect.addEventListener('change', function () {
    handleStyleChange();
    updateUrlParameters();
  });

  // Setup color mode selector
  colorModeSelect.addEventListener('change', function () {
    handleColorModeChange();
    updateUrlParameters();
  });

  // Setup binary input with real-time updates
  binaryInput.addEventListener('input', function () {
    handleBinaryInput();
    updateUrlParameters();
    requestUpdate();
  });
  binaryInput.addEventListener('keyup', function () {
    handleBinaryInput();
    updateUrlParameters();
    requestUpdate();
  });
  binaryInput.addEventListener('paste', function () {
    handleBinaryInput();
    updateUrlParameters();
    requestUpdate();
  });
  if (!window.location.search) {
    binaryInput.value = "RPI"; // Set default value only if no URL params
  }

  // Setup numeric input with real-time updates
  numericInput.addEventListener('input', function () {
    updateNumericData(numericInput.value);
    updateUrlParameters();
    requestUpdate();
  });
  numericInput.addEventListener('keyup', function () {
    updateNumericData(numericInput.value);
    updateUrlParameters();
    requestUpdate();
  });
  numericInput.addEventListener('paste', function () {
    setTimeout(() => {
      updateNumericData(numericInput.value);
      updateUrlParameters();
      requestUpdate();
    }, 10);
  });
  numericInput.addEventListener('blur', function () {
    // When user leaves the field, show the evaluated result
    const evaluated = evaluateFormula(numericInput.value);
    if (evaluated !== numericInput.value && !isNaN(parseFloat(evaluated))) {
      // Only update display if it's a valid number and different from input
      console.log('Formula evaluated:', numericInput.value, '->', evaluated);
    }
  });

  // Setup numeric mode selector
  numericModeSelect.addEventListener('change', function () {
    updateUrlParameters();
    requestUpdate();
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

  // Initialize custom dropdowns
  setupCustomDropdowns();

  // Add global keyboard event listener for more reliable shift detection
  document.addEventListener('keydown', function (event) {
    // Only handle keyboard events on non-mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return; // Skip keyboard shortcuts on mobile
    }

    // Handle spacebar for playback
    if (event.code === 'Space' && !event.shiftKey) {
      // Only toggle if current style is animated
      // Animated styles: Ticker (2), Waveform (4)
      if (currentShader === 2 || currentShader === 4) {
        event.preventDefault();
        togglePlayback();
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
        // Dispatch change event to update UI elements and trigger handleStyleChange
        styleSelect.dispatchEvent(new Event('change'));
      }

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

      // Update dropdown and trigger change event for UI sync
      if (colorModeSelect) {
        colorModeSelect.value = nextColorMode;
        colorModeSelect.dispatchEvent(new Event('change'));
      }

      console.log('Keyboard toggle - color mode:', nextColorMode);
    }
  });

  // Add keyup event listener for spacebar release
  document.addEventListener('keyup', function (event) {
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
  // Use profanity filter if available
  let cleanText = text;
  if (window.ProfanityFilter && typeof window.ProfanityFilter.sanitizeText === 'function') {
    cleanText = window.ProfanityFilter.sanitizeText(text);
    if (cleanText !== text) {
      console.log('Profanity filtered from binary input');
      // Update input field if it matches current text to show user the filtered version
      if (binaryInput && binaryInput.value === text) {
        binaryInput.value = cleanText;
      }
    }
  }

  binaryData = {
    text: cleanText,
    binary: textToBinary(cleanText)
  };
  binaryLength = binaryData.binary.length;
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
  setTickerWidthRatioDisplayValue(tickerWidthRatioSlider, tickerWidthRatioDisplay);
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

function toggleMobileMenu() {
  const isActive = appSidebar.classList.contains('active');

  if (!isActive) {
    // Opening sidebar
    lastFocusedElement = document.activeElement;
    appSidebar.classList.add('active');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');

    // Move focus to first interactive element in sidebar
    setTimeout(() => {
      const firstFocusable = appSidebar.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  } else {
    // Closing sidebar
    appSidebar.classList.remove('active');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');

    // Restore focus
    if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    } else if (mobileMenuToggle) {
      mobileMenuToggle.focus();
    }
  }
}

function handleClickOutside(event) {
  // Only apply on mobile where sidebar overlays content
  if (window.innerWidth > 768) return;

  // Prevent duplicate events on mobile
  if (event.type === 'touchend' && event.cancelable) {
    event.preventDefault();
  }

  // Don't close if clicking on the toggle button or inside the sidebar
  if (mobileMenuToggle && mobileMenuToggle.contains(event.target) ||
    appSidebar && appSidebar.contains(event.target)) {
    return;
  }

  // Close the sidebar if it's open
  if (appSidebar && appSidebar.classList.contains('active')) {
    toggleMobileMenu();
  }
}

function toggleSaveMenu(e) {
  if (e) e.stopPropagation();

  if (saveMenu) {
    saveMenu.classList.toggle('hidden');
    const isExpanded = !saveMenu.classList.contains('hidden');
    if (saveButton) saveButton.setAttribute('aria-expanded', isExpanded);
  }
}

function handleStyleChange() {
  // Get the selected style from dropdown
  const selectedStyle = styleSelect ? styleSelect.value : 'solid';

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
    // Show the appropriate group and handle playback controls
    let isAnimated = false;

    switch (selectedStyle) {
      case 'ruler':
        rulerGroup.style.display = 'block';
        break;
      case 'ticker':
        tickerGroup.style.display = 'block';
        isAnimated = true;
        break;
      case 'binary':
        binaryGroup.style.display = 'block';
        break;
      case 'waveform':
        waveformGroup.style.display = 'block';
        isAnimated = true;
        break;
      case 'circles':
        circlesGroup.style.display = 'block';
        break;
      case 'numeric':
        numericGroup.style.display = 'block';
        break;
    }

    // Toggle playback controls visibility
    if (playbackBtn && playbackDivider) {
      if (isAnimated) {
        playbackBtn.classList.remove('hidden');
        playbackDivider.classList.remove('hidden');
        // Reset to playing state when switching to an animated mode, or keep?
        // Let's ensure loop is on if we switch to it, or respect current state?
        // Better to reset to playing for UX.
        if (!isPlaying) togglePlayback();
      } else {
        playbackBtn.classList.add('hidden');
        playbackDivider.classList.add('hidden');
        // Ensure we loop for static draws (or noLoop logic might interfere with interactions?)
        // Static modes usually call noLoop() or just draw once?
        // This app seems to run draw loop constantly for all modes currently.
        if (!isPlaying) togglePlayback(); // Resume loop if it was paused
      }
    }
  }

  console.log('Style changed to:', selectedStyle, 'currentShader:', currentShader);
  requestUpdate();
}

function handleColorModeChange() {
  const selectedColorMode = colorModeSelect ? colorModeSelect.value : 'black-on-white';
  applyColorMode(selectedColorMode);
}

function applyColorMode(colorMode) {
  currentColorMode = colorMode;

  // Remove all theme classes first
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-red', 'theme-inverted');

  // Add appropriate theme class
  switch (colorMode) {
    case 'black-on-white':
      document.body.classList.add('theme-light');
      break;
    case 'white-on-black':
      document.body.classList.add('theme-dark');
      break;
    case 'white-on-red':
      document.body.classList.add('theme-red');
      break;
    case 'red-on-white':
      document.body.classList.add('theme-inverted'); // Assuming inverted style for now
      break;
    default:
      document.body.classList.add('theme-light');
  }

  // Update control element colors (only needed for complex elements like sliders or SVG icons that rely on JS)
  // Most styling is now handled by CSS variables
  updateControlElementColors(colors[colorMode]);

  console.log('Color mode applied:', colorMode);
  requestUpdate();
}

function requestUpdate() {
  if (!isPlaying) {
    redraw();
  }
}

function updateControlElementColors(colorScheme) {
  // Update select dropdown arrows (needs JS because it's a data URI)
  const selects = document.querySelectorAll('.control-select');
  selects.forEach(select => {
    const arrowColor = colorScheme.fg === '#ffffff' ? 'white' : 'black';
    const arrowSvg = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><polygon points="6,8 2,4 10,4" fill="${arrowColor}"/></svg>')`;
    select.style.setProperty('--dropdown-arrow', arrowSvg);
  });
}







// Advanced circle packing algorithm based on Collins & Stephenson paper


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



// Audio functions
async function initializeAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Load the pulse wave worklet
    await audioContext.audioWorklet.addModule('js/pulse-worklet.js');

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

    // Create custom pulse wave using AudioWorklet
    try {
      pulseWorkletNode = new AudioWorkletNode(audioContext, 'pulse-processor');

      // Set initial frequency
      pulseWorkletNode.port.postMessage({
        type: 'frequency',
        value: mappedFrequency
      });

      // Set initial pulse width (20% to match visual)
      pulseWorkletNode.port.postMessage({
        type: 'pulseWidth',
        value: 0.2
      });

      oscillators.pulse = pulseWorkletNode;
      oscillatorGains.pulse = audioContext.createGain();
      oscillatorGains.pulse.gain.setValueAtTime(0, audioContext.currentTime);

      oscillators.pulse.connect(oscillatorGains.pulse);
      oscillatorGains.pulse.connect(gainNode);

    } catch (error) {
      console.error('Failed to create pulse worklet:', error);
      // Fallback: create a square wave oscillator
      oscillators.pulse = audioContext.createOscillator();
      oscillators.pulse.type = 'square';
      oscillators.pulse.frequency.setValueAtTime(mappedFrequency, audioContext.currentTime);

      oscillatorGains.pulse = audioContext.createGain();
      oscillatorGains.pulse.gain.setValueAtTime(0, audioContext.currentTime);

      oscillators.pulse.connect(oscillatorGains.pulse);
      oscillatorGains.pulse.connect(gainNode);
      oscillators.pulse.start();
    }

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
        if (type === 'pulse' && pulseWorkletNode) {
          // AudioWorklet nodes don't have a stop method, disconnect instead
          pulseWorkletNode.disconnect();
          pulseWorkletNode = null;
        } else if (oscillators[type].stop) {
          oscillators[type].stop(audioContext.currentTime + 0.05);
        }
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

// Simple single oscillator approach like the original

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
    numericMode: params.get('numericMode') || 'dotmatrix',

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
    if (numericModeSelect && numericModeSelect.value !== 'dotmatrix') {
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
    Object.values(oscillators).forEach((osc, index) => {
      if (osc) {
        const oscType = Object.keys(oscillators)[index];
        if (oscType === 'pulse' && pulseWorkletNode) {
          // Send frequency update to pulse worklet
          pulseWorkletNode.port.postMessage({
            type: 'frequency',
            value: mappedFrequency
          });
        } else if (osc.frequency) {
          osc.frequency.exponentialRampToValueAtTime(mappedFrequency, audioContext.currentTime + 0.1);
        }
      }
    });

    // Calculate mix ratios for smooth morphing with proper pulse wave integration
    let sineGain = 0;
    let sawGain = 0;
    let squareGain = 0;
    let pulseGain = 0;

    // Use smooth crossfading between waveforms
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
      // Square to pulse (2.0 to 3.0)
      const t = waveType - 2.0;
      squareGain = Math.max(0, 1.0 - t);
      pulseGain = Math.min(1.0, t);

      // Update pulse width based on slider position
      // Map from 20% to 80% duty cycle as slider moves from 2.0 to 3.0
      const pulseWidth = 0.2 + t * 0.6;

      // Send pulse width update to worklet
      if (pulseWorkletNode) {
        pulseWorkletNode.port.postMessage({
          type: 'pulseWidth',
          value: pulseWidth
        });
      }
    }

    // Normalize gains to prevent volume changes
    const totalGain = sineGain + sawGain + squareGain + pulseGain;
    if (totalGain > 0) {
      sineGain /= totalGain;
      sawGain /= totalGain;
      squareGain /= totalGain;
      pulseGain /= totalGain;
    }

    // Apply master volume scaling
    const masterVolume = 0.1;
    sineGain *= masterVolume;
    sawGain *= masterVolume;
    squareGain *= masterVolume;
    pulseGain *= masterVolume;

    // Use smooth ramp time for gentle transitions
    const rampTime = 0.05;
    if (oscillatorGains.sine) {
      oscillatorGains.sine.gain.linearRampToValueAtTime(sineGain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.sawtooth) {
      oscillatorGains.sawtooth.gain.linearRampToValueAtTime(sawGain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.square) {
      oscillatorGains.square.gain.linearRampToValueAtTime(squareGain, audioContext.currentTime + rampTime);
    }
    if (oscillatorGains.pulse) {
      oscillatorGains.pulse.gain.linearRampToValueAtTime(pulseGain, audioContext.currentTime + rampTime);
    }

  } catch (error) {
    console.error('Failed to update audio parameters:', error);
  }
}

function windowResized() {
  const container = document.getElementById('p5-container');
  if (container) {
    resizeCanvas(container.offsetWidth, container.offsetHeight);
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }
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
  const currentWidth = REFERENCE_WIDTH;
  const logoHeight = 111.76; // Exact height from 250px reference

  // Reset shader for regular drawing
  resetShader();



  // Draw the SVG logo
  push();
  translate(-width / 2, -height / 2); // Convert to screen coordinates for WEBGL
  translate(width / 2, height / 2);

  // Scale the logo appropriately
  scale(LOGO_SCALE);

  // Viewport View Transformation (Zoom & Pan)
  translate(panOffset.x, panOffset.y);
  scale(zoomLevel);

  // Center the logo
  translate(-currentWidth / 2, LOGO_VERTICAL_OFFSET);

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
  translate(-width / 2, -height / 2); // Convert to screen coordinates for WEBGL
  translate(width / 2, height / 2);

  // Scale the same as logo
  scale(LOGO_SCALE);

  // Viewport View Transformation
  translate(panOffset.x, panOffset.y);
  scale(zoomLevel);

  // Center the same as logo
  translate(-currentWidth / 2, LOGO_VERTICAL_OFFSET);

  // Position the bar to match 250px reference exactly
  translate(0, 132.911); // Match exact bar Y position from 250px reference

  // Calculate bar dimensions to match 250px reference exactly
  const exactBarWidth = REFERENCE_WIDTH; // Exact width from 250px reference
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

    // Helper function for smooth waveform generation (restored from original working version)
    function generateWaveValue(phase, type) {
      // Normalize phase to [0, 1] range more carefully
      const normalizedPhase = phase - Math.floor(phase);
      const wrappedPhase = normalizedPhase < 0 ? normalizedPhase + 1 : normalizedPhase;

      // Define all wave types in proper scope
      const sine = (Math.sin(phase * 2 * Math.PI) + 1) * 0.5;
      const saw = wrappedPhase;
      const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
      const pulse = wrappedPhase > 0.8 ? 1.0 : 0.0;

      if (type < 1.0) {
        // Sine to sawtooth interpolation
        return sine + (saw - sine) * type;
      } else if (type < 2.0) {
        // Sawtooth to square interpolation
        const t = type - 1.0;
        return saw + (square - saw) * t;
      } else {
        // Square to pulse interpolation
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
    const mode = numericModeSelect ? numericModeSelect.value : 'dotmatrix';

    if (digits.length > 0) {
      const digitWidth = exactBarWidth / digits.length;
      const barY = 0; // We're already positioned at the correct Y coordinate for the bar

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
          const barYPos = rectHeight - barHeight; // Position from bottom

          rect(x, barYPos, digitWidth - 1, barHeight);
        }


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

          // Handle decimal points (value 10) - render as bottom-aligned rounded rectangle
          if (digit === 10) {
            const dotWidth = digitWidth - horizontalGap;
            const dotX = x + horizontalGap / 2;
            const dotY = barY + rectHeight - dotHeight; // Position at bottom

            rect(dotX, dotY, dotWidth, dotHeight, dotHeight / 2);
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
              rect(dotX, dotY, dotWidth, dotHeight, dotHeight / 2);
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

// --- Phase 2c: Playback & Viewport Logic ---

function togglePlayback() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    loop();
    if (iconPlay) iconPlay.classList.add('hidden');
    if (iconPause) iconPause.classList.remove('hidden');
    if (playbackText) playbackText.textContent = "SPACE TO PAUSE";
    if (playbackBtn) playbackBtn.setAttribute('aria-label', 'Pause Animation');
  } else {
    noLoop();
    if (iconPause) iconPause.classList.add('hidden');
    if (iconPlay) iconPlay.classList.remove('hidden');
    if (playbackText) playbackText.textContent = "SPACE TO PLAY";
    if (playbackBtn) playbackBtn.setAttribute('aria-label', 'Play Animation');
  }
}

function zoomCanvas(amount) {
  zoomLevel += amount;
  zoomLevel = constrain(zoomLevel, 0.5, 3.0); // Limit zoom 50% to 300%

  if (zoomLevelDisplay) {
    zoomLevelDisplay.textContent = Math.round(zoomLevel * 100) + '%';
  }

  if (!isPlaying) redraw();
}

function togglePanMode() {
  isPanningMode = !isPanningMode;

  if (panBtn) {
    if (isPanningMode) {
      panBtn.style.color = 'var(--accent-color)';
      panBtn.style.background = 'var(--rpi-gray-100)';
      document.body.style.cursor = 'move';
    } else {
      panBtn.style.color = '';
      panBtn.style.background = '';
      document.body.style.cursor = 'default';
    }
  }
}

function mouseDragged() {
  if (isPanningMode) {
    panOffset.x += movedX;
    panOffset.y += movedY;
    if (!isPlaying) redraw();
    return false; // Prevent default browser drag
  }
}

// --- Custom Dropdown Logic ---
function setupCustomDropdowns() {
  const selects = document.querySelectorAll('.control-select');

  selects.forEach(select => {
    // Check if already initialized to avoid duplicates
    if (select.parentNode.classList.contains('custom-select-wrapper')) return;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Create trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    const selectedOption = select.options[select.selectedIndex];
    trigger.textContent = selectedOption ? selectedOption.textContent : 'Select...';
    wrapper.appendChild(trigger);

    // Create options list
    const optionsList = document.createElement('div');
    optionsList.className = 'custom-select-options';
    wrapper.appendChild(optionsList);

    // Populate options
    Array.from(select.options).forEach(option => {
      const customOption = document.createElement('div');
      customOption.className = 'custom-option';
      customOption.textContent = option.textContent;
      customOption.dataset.value = option.value;

      if (option.selected) {
        customOption.classList.add('selected');
      }

      customOption.addEventListener('click', (e) => {
        e.stopPropagation();

        // Update native select
        select.value = option.value;
        select.dispatchEvent(new Event('change'));

        // Update UI
        trigger.textContent = option.textContent;
        wrapper.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        customOption.classList.add('selected');
        wrapper.classList.remove('open');
      });

      optionsList.appendChild(customOption);
    });

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close all other dropdowns
      document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });

    // Listen for external updates to the select (e.g. from keyboard shortcuts)
    select.addEventListener('change', () => {
      const newSelected = select.options[select.selectedIndex];
      trigger.textContent = newSelected.textContent;
      wrapper.querySelectorAll('.custom-option').forEach(opt => {
        if (opt.dataset.value === select.value) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });
    });
  });

  // click outside to close dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    }
  });
}

// Ensure custom dropdowns are initialized when DOM is ready
document.addEventListener('DOMContentLoaded', setupCustomDropdowns);
