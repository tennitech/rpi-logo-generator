(function () {
  const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

  const COLORS = {
    'black-on-white': { bg: '#ffffff', fg: '#000000', label: 'Black / White', shortLabel: 'blk/wht' },
    'white-on-black': { bg: '#000000', fg: '#ffffff', label: 'White / Black', shortLabel: 'wht/blk' },
    'white-on-red': { bg: '#d6001c', fg: '#ffffff', label: 'White / Red', shortLabel: 'wht/red' },
    'red-on-white': { bg: '#ffffff', fg: '#d6001c', label: 'Red / White', shortLabel: 'red/wht' }
  };

  const STYLES = ['ruler', 'ticker', 'waveform', 'circles'];
  const STYLE_TO_SHADER = {
    ruler: 1,
    ticker: 2,
    waveform: 4,
    circles: 5
  };
  const STYLE_META = {
    ruler: {
      label: 'Ruler',
      short: 'RUL',
      description: 'Calibration ticks distributed across the official bar span.'
    },
    ticker: {
      label: 'Ticker',
      short: 'TCK',
      description: 'Two ratio-locked rows with adjustable cadence and width bias.'
    },
    waveform: {
      label: 'Waveform',
      short: 'WAV',
      description: 'Animated wave energy in preview, clean vector at export.'
    },
    circles: {
      label: 'Circles',
      short: 'CRC',
      description: 'Packed circles using the shared overlap and density rules.'
    }
  };
  const WAVEFORM_TYPES = [
    { value: 0, label: 'Sine' },
    { value: 1, label: 'Saw' },
    { value: 2, label: 'Square' },
    { value: 3, label: 'Pulse' }
  ];
  const DEFAULT_STATE = {
    style: 'ruler',
    colorMode: 'white-on-black',
    rulerRepeats: 10,
    rulerUnits: 4,
    tickerRepeats: 34,
    tickerRatio: 2,
    tickerWidthRatio: 2,
    waveformType: 0,
    waveformFrequency: 24,
    waveformSpeed: 0.7,
    circlesMode: 'packing',
    circlesFill: 'stroke',
    circlesDensity: 50,
    circlesSizeVariation: 0,
    circlesOverlap: 0
  };
  const LOGO_ASSET_PATH = '../assets/images/rpi-logo-5.svg';
  const HANDOFF_DENSITY = ' .,:-=+*#%@';
  const INTRO_DURATION_MS = 2400;
  const HANDOFF_HOLD_MS = 300;
  const HANDOFF_DURATION_MS = 1650;
  const HANDOFF_PARTICLE_LIMIT = 820;
  const LOGO_EXPORT_WIDTH = 250;
  const LOGO_EXPORT_HEIGHT = 150.911;
  const DEFAULT_ZOOM = 0.9;
  const ANIMATION_INTRO_PATH = '../animation/';
  const ANIMATION_INTRO_DURATION_MS = 22660;
  const BACKGROUND_UPDATE_MS = 90;
  const BACKGROUND_SOURCE = `
    SYS INIT RPI BAR GENERATOR TERMINAL SURFACE ACTIVE.
    SIGNAL LOCK VECTOR EXPORT PIPELINE NOMINAL.
    RULER TICKER WAVEFORM CIRCLES AVAILABLE FOR CALIBRATION.
    PARAMETER BUS REPEAT UNITS RATIO DENSITY OVERLAP.
    PREVIEW CONTEXT WORDMARK BAR GEOMETRY VERIFIED.
    ASCII PROJECTION FIELD RUNNING IN RED CHANNEL.
    WARNING WINDOW STACKS HOLD POSITION CLEAR OF BAR SURFACE.
    BUILD TEST BREAK REBUILD REPEAT UNTIL THE SHAPE HOLDS.
    WHAT IF WE TRIED THIS AGAIN WITH MORE RIGOR.
    TROY COORDINATES LAB NOTES SYSTEMS SIGNAL MOTION STRUCTURE.
  `.replace(/\s+/g, ' ').trim();
  const ASCII_CHARACTER_MAP = {
    E: '3',
    I: '1',
    O: '0',
    S: '$',
    T: '+',
    V: '\\/',
    W: '\\/\\/',
    X: '><'
  };
  const BAR_GEOMETRY = {
    x: 0,
    y: 132.911,
    width: 250,
    height: 18
  };

  const app = {
    options: null,
    dom: {},
    state: { ...DEFAULT_STATE },
    logoTemplate: null,
    animationFrame: 0,
    previewInitialized: false,
    introTimer: 0,
    handoffMask: null,
    introRunning: false,
    introRunId: 0,
    viewMode: 'editor',
    zoomLevel: DEFAULT_ZOOM,
    backgroundFrame: 0,
    backgroundRows: [],
    backgroundMetrics: null,
    backgroundLastTick: 0
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function wait(duration) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });
  }

  function hashNoise(a, b, seed) {
    const value = Math.sin((a * 12.9898) + (b * 78.233) + (seed * 37.719)) * 43758.5453;
    return value - Math.floor(value);
  }

  function parseInteger(value, fallback) {
    const numeric = Number.parseInt(value, 10);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function parseFloatValue(value, fallback) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function normalizeStyle(style) {
    return STYLES.includes(style) ? style : DEFAULT_STATE.style;
  }

  function normalizeColorMode(colorMode) {
    return Object.prototype.hasOwnProperty.call(COLORS, colorMode) ? colorMode : DEFAULT_STATE.colorMode;
  }

  function normalizeViewMode(viewMode) {
    return viewMode === 'preview' ? 'preview' : 'editor';
  }

  function normalizeState(nextState) {
    const rulerUnits = clamp(parseInteger(nextState.rulerUnits, DEFAULT_STATE.rulerUnits), 2, 10);
    const evenUnits = Math.max(2, Math.min(10, Math.round(rulerUnits / 2) * 2));

    return {
      style: normalizeStyle(nextState.style),
      colorMode: normalizeColorMode(nextState.colorMode),
      rulerRepeats: clamp(parseInteger(nextState.rulerRepeats, DEFAULT_STATE.rulerRepeats), 4, 20),
      rulerUnits: evenUnits,
      tickerRepeats: clamp(parseInteger(nextState.tickerRepeats, DEFAULT_STATE.tickerRepeats), 5, 40),
      tickerRatio: clamp(parseInteger(nextState.tickerRatio, DEFAULT_STATE.tickerRatio), 1, 5),
      tickerWidthRatio: clamp(parseInteger(nextState.tickerWidthRatio, DEFAULT_STATE.tickerWidthRatio), 1, 5),
      waveformType: clamp(Math.round(parseFloatValue(nextState.waveformType, DEFAULT_STATE.waveformType)), 0, 3),
      waveformFrequency: clamp(parseInteger(nextState.waveformFrequency, DEFAULT_STATE.waveformFrequency), 10, 100),
      waveformSpeed: clamp(parseFloatValue(nextState.waveformSpeed, DEFAULT_STATE.waveformSpeed), 0, 5),
      circlesMode: 'packing',
      circlesFill: nextState.circlesFill === 'fill' ? 'fill' : 'stroke',
      circlesDensity: clamp(parseInteger(nextState.circlesDensity, DEFAULT_STATE.circlesDensity), 10, 100),
      circlesSizeVariation: clamp(parseInteger(nextState.circlesSizeVariation, DEFAULT_STATE.circlesSizeVariation), 0, 100),
      circlesOverlap: clamp(parseInteger(nextState.circlesOverlap, DEFAULT_STATE.circlesOverlap), 0, 100)
    };
  }

  function getUrlState() {
    const params = new URLSearchParams(window.location.search);

    return normalizeState({
      style: normalizeStyle(params.get('style') || DEFAULT_STATE.style),
      colorMode: normalizeColorMode(params.get('colorMode') || DEFAULT_STATE.colorMode),
      rulerRepeats: parseInteger(params.get('rulerRepeats'), DEFAULT_STATE.rulerRepeats),
      rulerUnits: parseInteger(params.get('rulerUnits'), DEFAULT_STATE.rulerUnits),
      tickerRepeats: parseInteger(params.get('tickerRepeats'), DEFAULT_STATE.tickerRepeats),
      tickerRatio: parseInteger(params.get('tickerRatio'), DEFAULT_STATE.tickerRatio),
      tickerWidthRatio: parseInteger(params.get('tickerWidthRatio'), DEFAULT_STATE.tickerWidthRatio),
      waveformType: parseFloatValue(params.get('waveformType'), DEFAULT_STATE.waveformType),
      waveformFrequency: parseInteger(params.get('waveformFrequency'), DEFAULT_STATE.waveformFrequency),
      waveformSpeed: parseFloatValue(params.get('waveformSpeed'), DEFAULT_STATE.waveformSpeed),
      circlesFill: params.get('circlesFill') || DEFAULT_STATE.circlesFill,
      circlesDensity: parseInteger(params.get('circlesDensity'), DEFAULT_STATE.circlesDensity),
      circlesSizeVariation: parseInteger(params.get('circlesSizeVariation'), DEFAULT_STATE.circlesSizeVariation),
      circlesOverlap: parseInteger(params.get('circlesOverlap'), DEFAULT_STATE.circlesOverlap)
    });
  }

  function buildMarkup() {
    return `
      <div class="page-wrapper">
        <main class="main-wrapper generator_page" aria-label="RPI generator prototype">
          <pre class="generator_background_projection" data-background-projection aria-hidden="true"></pre>
          <div class="generator_intro_overlay" data-intro-overlay>
            <iframe
              class="generator_intro_frame"
              data-intro-frame
              title="RPI animation intro"
              loading="eager"
              referrerpolicy="same-origin"
            ></iframe>
            <div class="generator_handoff_stage" data-handoff-stage>
              <pre class="generator_handoff_terminal" data-handoff-terminal aria-hidden="true"></pre>
              <div class="generator_handoff_particles" data-handoff-particles aria-hidden="true"></div>
            </div>
            <button type="button" class="generator_skip_button" data-skip-intro>skip intro</button>
          </div>

          <section class="section_generator">
            <div class="padding-global">
              <div class="container-large">
                <div class="generator_shell" data-shell data-view-mode="editor">
                  <header class="generator_header" data-funnel-target>
                    <div class="generator_header_meta">
                      <p class="stage_kicker" data-handoff-target-text data-ascii-label="RPI / Bar Generator">RPI / Bar generator</p>
                      <div class="stage_badge" data-stage-badge data-handoff-target-text data-ascii-label="${STYLE_META[DEFAULT_STATE.style].label}">${STYLE_META[DEFAULT_STATE.style].label}</div>
                    </div>
                    <div class="view_toggle" role="tablist" aria-label="Generator view mode">
                      <button type="button" class="mode_button is-active" data-view-button="editor" aria-label="Editor" aria-pressed="true"><span data-handoff-target-text data-ascii-label="Editor">Editor</span></button>
                      <button type="button" class="mode_button" data-view-button="preview" aria-label="Preview" aria-pressed="false"><span data-handoff-target-text data-ascii-label="Preview">Preview</span></button>
                    </div>
                  </header>

                  <section class="generator_constellation">
                    <section class="generator_card pod pod_system" data-funnel-target>
                      <p class="generator_card_kicker" data-handoff-target-text data-ascii-label="System / Palette">System / palette</p>
                      <div class="system_grid" data-style-selector>
                        ${STYLES.map((style) => `
                          <button type="button" class="system_button" data-style-button="${style}" aria-label="${STYLE_META[style].label}">
                            <span class="system_button_code" data-handoff-target-text data-ascii-label="${STYLE_META[style].short}">${STYLE_META[style].short}</span>
                            <span class="system_button_title" data-handoff-target-text data-ascii-label="${STYLE_META[style].label}">${STYLE_META[style].label}</span>
                          </button>
                        `).join('')}
                      </div>
                      <div class="palette_grid">
                        ${Object.keys(COLORS).map((mode) => `
                          <button type="button" class="palette_button" data-color-button="${mode}" aria-label="${COLORS[mode].label}">
                            <span class="palette_button_code" data-handoff-target-text data-ascii-label="${COLORS[mode].shortLabel}">${COLORS[mode].shortLabel}</span>
                            <span class="palette_button_label" data-handoff-target-text data-ascii-label="${COLORS[mode].label}">${COLORS[mode].label}</span>
                          </button>
                        `).join('')}
                      </div>
                    </section>

                    <section class="generator_stage_column constellation_stage" data-funnel-target>
                      <div class="stage_shell">
                        <div class="stage_surface" data-preview-surface>
                          <div class="stage_stack" data-logo-stack>
                            <div class="stage_layer is-active" data-layer="0"></div>
                            <div class="stage_layer" data-layer="1"></div>
                          </div>
                        </div>
                      </div>

                      <section class="generator_card export_pane" data-funnel-target>
                        <div class="export_pane_head">
                          <p class="generator_card_kicker" data-handoff-target-text data-ascii-label="Output">Output</p>
                        </div>
                        <div class="readout_rail" data-style-readouts></div>
                        <div class="export_row">
                          <button type="button" class="export_button" data-export="svg" aria-label="Export SVG"><span data-handoff-target-text data-ascii-label="Export SVG">Export SVG</span></button>
                          <button type="button" class="export_button" data-export="png" aria-label="Export PNG"><span data-handoff-target-text data-ascii-label="Export PNG">Export PNG</span></button>
                          <button type="button" class="export_button export_button_subtle" data-replay-intro aria-label="Replay Intro"><span data-handoff-target-text data-ascii-label="Replay Intro">Replay intro</span></button>
                        </div>
                    </section>

                    <section class="generator_card pod pod_controls" data-funnel-target>
                      <div class="controls_head">
                        <div>
                          <p class="generator_card_kicker" data-handoff-target-text data-ascii-label="Active System">Active system</p>
                          <h1 class="controls_title" data-active-title data-handoff-target-text data-ascii-label="${STYLE_META[DEFAULT_STATE.style].label}">${STYLE_META[DEFAULT_STATE.style].label}</h1>
                        </div>
                        <div class="controls_copy" data-detail-copy>${STYLE_META[DEFAULT_STATE.style].description}</div>
                      </div>

                      <div class="control_stack">
                        <div class="control_module" data-style-module="ruler">
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Repeats</span>
                              <output class="control_value" data-output-for="rulerRepeats"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="4" max="20" step="1" data-param="rulerRepeats">
                            </span>
                          </label>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Units</span>
                              <output class="control_value" data-output-for="rulerUnits"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="2" max="10" step="2" data-param="rulerUnits">
                            </span>
                          </label>
                        </div>

                        <div class="control_module" data-style-module="ticker">
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Repeats</span>
                              <output class="control_value" data-output-for="tickerRepeats"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="5" max="40" step="1" data-param="tickerRepeats">
                            </span>
                          </label>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Count ratio</span>
                              <output class="control_value" data-output-for="tickerRatio"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="1" max="5" step="1" data-param="tickerRatio">
                            </span>
                          </label>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Width ratio</span>
                              <output class="control_value" data-output-for="tickerWidthRatio"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="1" max="5" step="1" data-param="tickerWidthRatio">
                            </span>
                          </label>
                        </div>

                        <div class="control_module" data-style-module="waveform">
                          <div class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Wave type</span>
                              <output class="control_value" data-output-for="waveformType"></output>
                            </span>
                            <div class="choice_group">
                              ${WAVEFORM_TYPES.map((option) => `
                                <button type="button" class="choice_button" data-waveform-choice="${option.value}" aria-label="${option.label}">
                                  <span data-handoff-target-text data-ascii-label="${option.label}">${option.label}</span>
                                </button>
                              `).join('')}
                            </div>
                          </div>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Frequency</span>
                              <output class="control_value" data-output-for="waveformFrequency"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="10" max="100" step="1" data-param="waveformFrequency">
                            </span>
                          </label>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Speed</span>
                              <output class="control_value" data-output-for="waveformSpeed"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="0" max="5" step="0.1" data-param="waveformSpeed">
                            </span>
                          </label>
                        </div>

                        <div class="control_module" data-style-module="circles">
                          <div class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Fill</span>
                              <output class="control_value" data-output-for="circlesFill"></output>
                            </span>
                            <div class="choice_group choice_group_small">
                              <button type="button" class="choice_button" data-circles-fill="stroke" aria-label="Stroke"><span data-handoff-target-text data-ascii-label="Stroke">Stroke</span></button>
                              <button type="button" class="choice_button" data-circles-fill="fill" aria-label="Fill"><span data-handoff-target-text data-ascii-label="Fill">Fill</span></button>
                            </div>
                          </div>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Density</span>
                              <output class="control_value" data-output-for="circlesDensity"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="10" max="100" step="1" data-param="circlesDensity">
                            </span>
                          </label>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Variation</span>
                              <output class="control_value" data-output-for="circlesSizeVariation"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="0" max="100" step="1" data-param="circlesSizeVariation">
                            </span>
                          </label>
                          <label class="control_row">
                            <span class="control_label_row">
                              <span class="control_label">Overlap</span>
                              <output class="control_value" data-output-for="circlesOverlap"></output>
                            </span>
                            <span class="slider_shell">
                              <span class="slider_scale"></span>
                              <input class="control_slider" type="range" min="0" max="100" step="1" data-param="circlesOverlap">
                            </span>
                          </label>
                        </div>
                      </div>
                    </section>
                  </section>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    `;
  }

  function cacheDom(root) {
    app.dom = {
      root,
      body: document.body,
      shell: root.querySelector('[data-shell]'),
      backgroundProjection: root.querySelector('[data-background-projection]'),
      introOverlay: root.querySelector('[data-intro-overlay]'),
      introFrame: root.querySelector('[data-intro-frame]'),
      handoffStage: root.querySelector('[data-handoff-stage]'),
      handoffTerminal: root.querySelector('[data-handoff-terminal]'),
      handoffParticles: root.querySelector('[data-handoff-particles]'),
      skipIntroButton: root.querySelector('[data-skip-intro]'),
      previewSurface: root.querySelector('[data-preview-surface]'),
      logoStack: root.querySelector('[data-logo-stack]'),
      styleButtons: Array.from(root.querySelectorAll('[data-style-button]')),
      viewButtons: Array.from(root.querySelectorAll('[data-view-button]')),
      colorButtons: Array.from(root.querySelectorAll('[data-color-button]')),
      paramInputs: Array.from(root.querySelectorAll('[data-param]')),
      styleModules: Array.from(root.querySelectorAll('[data-style-module]')),
      waveformChoices: Array.from(root.querySelectorAll('[data-waveform-choice]')),
      circlesFillChoices: Array.from(root.querySelectorAll('[data-circles-fill]')),
      outputs: Array.from(root.querySelectorAll('[data-output-for]')),
      exportButtons: Array.from(root.querySelectorAll('[data-export]')),
      replayIntroButton: root.querySelector('[data-replay-intro]'),
      readoutRail: root.querySelector('[data-style-readouts]'),
      activeTitle: root.querySelector('[data-active-title]'),
      detailCopy: root.querySelector('[data-detail-copy]'),
      stageBadge: root.querySelector('[data-stage-badge]'),
      asciiLabelTargets: Array.from(root.querySelectorAll('[data-ascii-label]')),
      handoffTextTargets: Array.from(root.querySelectorAll('[data-handoff-target-text]')),
      funnelTargets: Array.from(root.querySelectorAll('[data-funnel-target]'))
    };
  }

  function measureBackgroundGrid() {
    if (!app.dom.backgroundProjection) {
      return null;
    }

    const computed = window.getComputedStyle(app.dom.backgroundProjection);
    const probe = document.createElement('span');
    probe.textContent = 'M';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.fontFamily = computed.fontFamily;
    probe.style.fontSize = computed.fontSize;
    probe.style.lineHeight = computed.lineHeight;
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    probe.remove();

    const cellWidth = rect.width || 6;
    const cellHeight = rect.height || 9;
    const cols = Math.max(84, Math.floor(window.innerWidth / Math.max(cellWidth, 1)));
    const rows = Math.max(24, Math.floor(window.innerHeight / Math.max(cellHeight, 1)));

    return { cols, rows };
  }

  function createBackgroundRow(rowIndex, cols) {
    const maxLength = Math.max(24, Math.min(cols - 8, Math.floor(cols * 0.68)));
    const minLength = Math.max(16, Math.floor(maxLength * 0.42));
    const length = Math.floor(minLength + (hashNoise(rowIndex, cols, 11) * (maxLength - minLength)));
    const typeSpeed = 10 + (hashNoise(rowIndex, cols, 17) * 18);
    const eraseSpeed = 18 + (hashNoise(rowIndex, cols, 23) * 20);
    const holdDuration = 0.9 + (hashNoise(rowIndex, cols, 29) * 1.6);
    const resetDuration = 0.25 + (hashNoise(rowIndex, cols, 31) * 0.85);
    const phase = hashNoise(rowIndex, cols, 37) * 8;
    const sourceOffset = Math.floor(hashNoise(rowIndex, cols, 41) * BACKGROUND_SOURCE.length);
    const indentBase = Math.floor(hashNoise(rowIndex, cols, 43) * Math.max(4, cols * 0.16));
    const direction = rowIndex % 2 === 0 ? 1 : -1;
    let text = '';

    for (let index = 0; index < length; index += 1) {
      const char = BACKGROUND_SOURCE[(sourceOffset + index) % BACKGROUND_SOURCE.length];
      text += char;
    }

    return {
      text,
      typeSpeed,
      eraseSpeed,
      holdDuration,
      resetDuration,
      phase,
      indentBase,
      direction,
      cursorEnabled: hashNoise(rowIndex, cols, 47) > 0.42
    };
  }

  function rebuildBackgroundProjection() {
    app.backgroundMetrics = measureBackgroundGrid();

    if (!app.backgroundMetrics) {
      return;
    }

    app.backgroundRows = Array.from(
      { length: app.backgroundMetrics.rows },
      (_, rowIndex) => createBackgroundRow(rowIndex, app.backgroundMetrics.cols)
    );
  }

  function formatBackgroundRow(row, rowIndex, seconds, cols) {
    const typeDuration = row.text.length / row.typeSpeed;
    const eraseDuration = row.text.length / row.eraseSpeed;
    const cycleDuration = typeDuration + row.holdDuration + eraseDuration + row.resetDuration;
    const localTime = (seconds + row.phase) % cycleDuration;
    let visibleCount = 0;

    if (localTime < typeDuration) {
      visibleCount = Math.floor(localTime * row.typeSpeed);
    } else if (localTime < typeDuration + row.holdDuration) {
      visibleCount = row.text.length;
    } else if (localTime < typeDuration + row.holdDuration + eraseDuration) {
      const eraseProgress = localTime - typeDuration - row.holdDuration;
      visibleCount = Math.max(0, row.text.length - Math.floor(eraseProgress * row.eraseSpeed));
    }

    const drift = Math.round(Math.sin(seconds * 0.22 + (rowIndex * 0.35)) * 2);
    const indent = clamp(row.indentBase + (row.direction * drift), 0, Math.max(0, cols - 4));
    const cursor = row.cursorEnabled && visibleCount > 0 && visibleCount < row.text.length && Math.sin(seconds * 4.4 + row.phase) > 0
      ? '_'
      : '';
    const visibleText = `${row.text.slice(0, visibleCount)}${cursor}`;
    const clipped = visibleText.slice(0, Math.max(0, cols - indent));

    return `${' '.repeat(indent)}${clipped}`;
  }

  function renderBackgroundProjection(timestamp) {
    if (!app.dom.backgroundProjection) {
      return;
    }

    if (REDUCED_MOTION_QUERY.matches) {
      if (!app.backgroundRows.length) {
        rebuildBackgroundProjection();
      }

      const staticRows = app.backgroundRows.map((row, rowIndex) =>
        formatBackgroundRow(row, rowIndex, rowIndex * 0.18, app.backgroundMetrics.cols)
      );
      app.dom.backgroundProjection.textContent = staticRows.join('\n');
      return;
    }

    if (!app.backgroundRows.length || !app.backgroundMetrics) {
      rebuildBackgroundProjection();
    }

    if (timestamp - app.backgroundLastTick >= BACKGROUND_UPDATE_MS) {
      const seconds = timestamp / 1000;
      const rows = app.backgroundRows.map((row, rowIndex) =>
        formatBackgroundRow(row, rowIndex, seconds, app.backgroundMetrics.cols)
      );
      app.dom.backgroundProjection.textContent = rows.join('\n');
      app.backgroundLastTick = timestamp;
    }

    app.backgroundFrame = window.requestAnimationFrame(renderBackgroundProjection);
  }

  function startBackgroundProjection() {
    window.cancelAnimationFrame(app.backgroundFrame);
    rebuildBackgroundProjection();
    app.backgroundLastTick = 0;
    app.backgroundFrame = window.requestAnimationFrame(renderBackgroundProjection);
  }

  function reloadIntroFrame() {
    if (!app.dom.introFrame) {
      return;
    }

    app.dom.introFrame.src = 'about:blank';

    window.requestAnimationFrame(() => {
      app.dom.introFrame.src = ANIMATION_INTRO_PATH;
    });
  }

  function stylizeAsciiLabel(text) {
    return String(text || '')
      .toUpperCase()
      .split('')
      .map((char) => ASCII_CHARACTER_MAP[char] || char)
      .join('');
  }

  function renderAsciiLabels() {
    app.dom.asciiLabelTargets.forEach((element) => {
      const source = element.getAttribute('data-ascii-label') || element.textContent || '';
      element.textContent = stylizeAsciiLabel(source);
    });
  }

  async function loadLogoTemplate() {
    const response = await fetch(LOGO_ASSET_PATH);
    const svgText = await response.text();
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement;
    const paths = Array.from(svg.querySelectorAll('path'));

    app.logoTemplate = {
      width: Number(svg.getAttribute('width')) || LOGO_EXPORT_WIDTH,
      height: Number(svg.getAttribute('height')) || LOGO_EXPORT_HEIGHT,
      viewBox: svg.getAttribute('viewBox') || `0 0 ${LOGO_EXPORT_WIDTH} ${LOGO_EXPORT_HEIGHT}`,
      wordmarkPaths: paths.slice(0, 3).map((path) => path.getAttribute('d'))
    };
  }

  function updateUrl() {
    const params = new URLSearchParams();

    if (app.state.style !== DEFAULT_STATE.style) {
      params.set('style', app.state.style);
    }

    if (app.state.colorMode !== DEFAULT_STATE.colorMode) {
      params.set('colorMode', app.state.colorMode);
    }

    if (app.state.style === 'ruler') {
      if (app.state.rulerRepeats !== DEFAULT_STATE.rulerRepeats) {
        params.set('rulerRepeats', String(app.state.rulerRepeats));
      }
      if (app.state.rulerUnits !== DEFAULT_STATE.rulerUnits) {
        params.set('rulerUnits', String(app.state.rulerUnits));
      }
    }

    if (app.state.style === 'ticker') {
      if (app.state.tickerRepeats !== DEFAULT_STATE.tickerRepeats) {
        params.set('tickerRepeats', String(app.state.tickerRepeats));
      }
      if (app.state.tickerRatio !== DEFAULT_STATE.tickerRatio) {
        params.set('tickerRatio', String(app.state.tickerRatio));
      }
      if (app.state.tickerWidthRatio !== DEFAULT_STATE.tickerWidthRatio) {
        params.set('tickerWidthRatio', String(app.state.tickerWidthRatio));
      }
    }

    if (app.state.style === 'waveform') {
      if (app.state.waveformType !== DEFAULT_STATE.waveformType) {
        params.set('waveformType', String(app.state.waveformType));
      }
      if (app.state.waveformFrequency !== DEFAULT_STATE.waveformFrequency) {
        params.set('waveformFrequency', String(app.state.waveformFrequency));
      }
      if (app.state.waveformSpeed !== DEFAULT_STATE.waveformSpeed) {
        params.set('waveformSpeed', String(app.state.waveformSpeed));
      }
    }

    if (app.state.style === 'circles') {
      if (app.state.circlesFill !== DEFAULT_STATE.circlesFill) {
        params.set('circlesFill', String(app.state.circlesFill));
      }
      if (app.state.circlesDensity !== DEFAULT_STATE.circlesDensity) {
        params.set('circlesDensity', String(app.state.circlesDensity));
      }
      if (app.state.circlesSizeVariation !== DEFAULT_STATE.circlesSizeVariation) {
        params.set('circlesSizeVariation', String(app.state.circlesSizeVariation));
      }
      if (app.state.circlesOverlap !== DEFAULT_STATE.circlesOverlap) {
        params.set('circlesOverlap', String(app.state.circlesOverlap));
      }
    }

    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
  }

  function applyPreviewColors() {
    if (app.viewMode === 'preview') {
      app.dom.body.style.setProperty('--preview-bg', '#000000');
      app.dom.body.style.setProperty('--preview-fg', '#d6001c');
      return;
    }

    const colorPair = COLORS[app.state.colorMode];
    app.dom.body.style.setProperty('--preview-bg', colorPair.bg);
    app.dom.body.style.setProperty('--preview-fg', colorPair.fg);
  }

  function formatOutputValue(key, value) {
    switch (key) {
      case 'tickerRatio':
        return `${value}:1`;
      case 'tickerWidthRatio':
        return `1:${value}`;
      case 'waveformType':
        return WAVEFORM_TYPES.find((type) => type.value === Number(value))?.label || 'Sine';
      case 'waveformSpeed':
        return `${Number(value).toFixed(1)}x`;
      case 'circlesDensity':
      case 'circlesSizeVariation':
      case 'circlesOverlap':
        return `${value}%`;
      case 'circlesFill':
        return value === 'fill' ? 'Fill' : 'Stroke';
      default:
        return `${value}`;
    }
  }

  function updateOutputs() {
    app.dom.outputs.forEach((output) => {
      const key = output.getAttribute('data-output-for');
      output.textContent = formatOutputValue(key, app.state[key]);
    });
  }

  function updateButtons() {
    app.dom.styleButtons.forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-style-button') === app.state.style);
    });

    app.dom.viewButtons.forEach((button) => {
      const isActive = button.getAttribute('data-view-button') === app.viewMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    app.dom.colorButtons.forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-color-button') === app.state.colorMode);
    });

    app.dom.waveformChoices.forEach((button) => {
      button.classList.toggle('is-active', Number(button.getAttribute('data-waveform-choice')) === Number(app.state.waveformType));
    });

    app.dom.circlesFillChoices.forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-circles-fill') === app.state.circlesFill);
    });

    app.dom.styleModules.forEach((module) => {
      module.classList.toggle('is-active', module.getAttribute('data-style-module') === app.state.style);
    });
  }

  function syncInputs() {
    app.dom.paramInputs.forEach((input) => {
      const key = input.getAttribute('data-param');
      input.value = app.state[key];
    });
  }

  function updateSliderProgress() {
    app.dom.paramInputs.forEach((input) => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const value = Number(input.value || min);
      const ratio = max === min ? 0 : ((value - min) / (max - min));
      const shell = input.closest('.slider_shell');
      if (shell) {
        shell.style.setProperty('--slider-percent', `${clamp(ratio, 0, 1) * 100}%`);
      }
    });
  }

  function updateReadouts() {
    const readouts = [];

    if (app.state.style === 'ruler') {
      readouts.push(
        ['Ticks', `${(app.state.rulerRepeats * app.state.rulerUnits) + 1}`],
        ['Repeats', `${app.state.rulerRepeats}`],
        ['Subdivision', `${app.state.rulerUnits} / rep`]
      );
    } else if (app.state.style === 'ticker') {
      readouts.push(
        ['Top row', `${app.state.tickerRepeats * app.state.tickerRatio}`],
        ['Bottom row', `${app.state.tickerRepeats}`],
        ['Width', `1:${app.state.tickerWidthRatio}`]
      );
    } else if (app.state.style === 'waveform') {
      readouts.push(
        ['Wave', formatOutputValue('waveformType', app.state.waveformType)],
        ['Frequency', `${app.state.waveformFrequency}`],
        ['Speed', formatOutputValue('waveformSpeed', app.state.waveformSpeed)]
      );
    } else {
      readouts.push(
        ['Density', `${app.state.circlesDensity}%`],
        ['Variation', `${app.state.circlesSizeVariation}%`],
        ['Overlap', `${app.state.circlesOverlap}%`]
      );
    }

    readouts.push(['Palette', COLORS[app.state.colorMode].shortLabel]);

    app.dom.readoutRail.innerHTML = readouts.map(([label, value]) => `
      <article class="readout_item">
        <div class="readout_label">${label}</div>
        <div class="readout_value">${value}</div>
      </article>
    `).join('');
  }

  function updateUi() {
    applyPreviewColors();
    syncInputs();
    updateOutputs();
    app.dom.activeTitle.setAttribute('data-ascii-label', STYLE_META[app.state.style].label);
    app.dom.activeTitle.textContent = STYLE_META[app.state.style].label;
    app.dom.detailCopy.textContent = STYLE_META[app.state.style].description;
    app.dom.stageBadge.setAttribute('data-ascii-label', STYLE_META[app.state.style].label);
    app.dom.stageBadge.textContent = STYLE_META[app.state.style].label;
    updateButtons();
    updateSliderProgress();
    updateReadouts();
    renderAsciiLabels();
    app.dom.shell.setAttribute('data-view-mode', app.viewMode);
    app.dom.previewSurface.style.setProperty('--stage-zoom', String(app.zoomLevel));
  }

  function textToBinary(text) {
    const source = (text || 'RPI').replace(/[\t\n\r]/g, '').slice(0, 100);
    const binary = [];

    for (let index = 0; index < source.length; index += 1) {
      let code = source.charCodeAt(index);
      if (Number.isNaN(code) || code < 0 || code > 127) {
        code = 65;
      }

      for (let bitIndex = 7; bitIndex >= 0; bitIndex -= 1) {
        binary.push((code >> bitIndex) & 1);
      }
    }

    return binary;
  }

  function textToMorse(text) {
    const dictionary = {
      A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
      G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
      M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
      S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
      Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '3': '...--',
      '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
      '9': '----.', '0': '-----'
    };
    const source = (text || 'RPI').trim().toUpperCase().slice(0, 100);
    const values = [];
    const words = source.split(' ');

    for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
      const word = words[wordIndex];
      for (let letterIndex = 0; letterIndex < word.length; letterIndex += 1) {
        const code = dictionary[word[letterIndex]];
        if (!code) continue;

        for (let symbolIndex = 0; symbolIndex < code.length; symbolIndex += 1) {
          if (code[symbolIndex] === '.') {
            values.push(1);
          } else {
            values.push(1, 1, 1);
          }

          if (symbolIndex < code.length - 1) {
            values.push(0);
          }
        }

        if (letterIndex < word.length - 1) {
          values.push(0, 0, 0);
        }
      }

      if (wordIndex < words.length - 1) {
        values.push(0, 0, 0, 0, 0, 0, 0);
      }
    }

    return values;
  }

  function parseNumericString(numericString) {
    const source = numericString || '3.141592653589793';
    const digits = [];

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (char === '.') {
        digits.push(10);
      } else if (char >= '0' && char <= '9') {
        digits.push(Number.parseInt(char, 10));
      }
    }

    return digits.slice(0, 200);
  }

  function calculatePhaseParameters(density, sizeVariation, area, barHeight) {
    const phases = [];
    const absoluteMaxRadius = barHeight / 2;
    const minPossibleRadius = Math.min(0.5, absoluteMaxRadius * 0.05);
    const variationFactor = sizeVariation / 100;
    const baseSizeFactor = Math.sqrt(area) / 50;
    const baseRadius = Math.min(baseSizeFactor * (1.2 + density / 200), absoluteMaxRadius * 0.8);

    phases.push({
      minRadius: Math.max(minPossibleRadius, baseRadius * (1 - variationFactor * 0.6)),
      maxRadius: Math.min(absoluteMaxRadius, baseRadius * (1 + variationFactor * 1.2)),
      attempts: Math.floor(density * 15),
      candidatesPerAttempt: 25
    });

    const mediumBaseRadius = baseRadius * 0.65;
    phases.push({
      minRadius: Math.max(minPossibleRadius, mediumBaseRadius * (1 - variationFactor * 0.7)),
      maxRadius: Math.min(absoluteMaxRadius * 0.8, mediumBaseRadius * (1 + variationFactor * 0.8)),
      attempts: Math.floor(density * 30),
      candidatesPerAttempt: 35
    });

    const smallBaseRadius = baseRadius * 0.4;
    phases.push({
      minRadius: Math.max(minPossibleRadius, smallBaseRadius * (1 - variationFactor * 0.8)),
      maxRadius: Math.min(absoluteMaxRadius * 0.6, smallBaseRadius * (1 + variationFactor * 0.6)),
      attempts: Math.floor(density * 60),
      candidatesPerAttempt: 45
    });

    const microBaseRadius = baseRadius * 0.25;
    phases.push({
      minRadius: minPossibleRadius,
      maxRadius: Math.min(absoluteMaxRadius * 0.4, microBaseRadius * (1 + variationFactor * 0.4)),
      attempts: Math.floor(density * 100),
      candidatesPerAttempt: 30
    });

    return phases;
  }

  function createSpatialGrid(width, height, circles, maxRadius) {
    const cellSize = maxRadius * 2;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => []));

    circles.forEach((circle) => {
      const minCol = Math.max(0, Math.floor((circle.x - circle.r) / cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((circle.x + circle.r) / cellSize));
      const minRow = Math.max(0, Math.floor((circle.y - circle.r) / cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((circle.y + circle.r) / cellSize));

      for (let row = minRow; row <= maxRow; row += 1) {
        for (let col = minCol; col <= maxCol; col += 1) {
          grid[row][col].push(circle);
        }
      }
    });

    return { grid, cellSize, cols, rows };
  }

  function updateSpatialGrid(spatialGrid, circle) {
    const { grid, cellSize, cols, rows } = spatialGrid;
    const minCol = Math.max(0, Math.floor((circle.x - circle.r) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((circle.x + circle.r) / cellSize));
    const minRow = Math.max(0, Math.floor((circle.y - circle.r) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((circle.y + circle.r) / cellSize));

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        grid[row][col].push(circle);
      }
    }
  }

  function calculateCircleOverlap(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= r1 + r2) return 0;
    if (distance <= Math.abs(r1 - r2)) {
      const minRadius = Math.min(r1, r2);
      return Math.PI * minRadius * minRadius;
    }

    const a = r1 * r1;
    const b = r2 * r2;
    const x = (a - b + distance * distance) / (2 * distance);
    const z = x - distance;
    const y = Math.sqrt(a - x * x);
    return a * Math.acos(x / r1) + b * Math.acos(-z / r2) - y * distance;
  }

  function calculateLocalDensityScore(x, y, radius, circles) {
    const searchRadius = radius * 8;
    let occupiedArea = 0;

    circles.forEach((circle) => {
      const dx = x - circle.x;
      const dy = y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < searchRadius + circle.r) {
        occupiedArea += calculateCircleOverlap(x, y, searchRadius, circle.x, circle.y, circle.r);
      }
    });

    const localArea = Math.PI * searchRadius * searchRadius;
    return Math.max(0, 1 - (occupiedArea / localArea));
  }

  function calculatePlacementScore(x, y, radius, existingCircles, newCircles, width, height) {
    let minDistance = Infinity;
    const allCircles = existingCircles.concat(newCircles);

    allCircles.forEach((circle) => {
      const dx = x - circle.x;
      const dy = y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy) - circle.r - radius;
      minDistance = Math.min(minDistance, distance);
    });

    const edgeDistance = Math.min(x - radius, width - x - radius, y - radius, height - y - radius);
    const edgeScore = Math.min(1, edgeDistance / (radius * 2));
    const densityScore = calculateLocalDensityScore(x, y, radius, allCircles);
    return (minDistance * 0.6) + (edgeScore * 0.2) + (densityScore * 0.2);
  }

  function hasCollisionFast(x, y, radius, existingCircles, newCircles, spatialGrid, minDistanceMultiplier) {
    if (
      x - radius < 0 ||
      x + radius > spatialGrid.cols * spatialGrid.cellSize ||
      y - radius < 0 ||
      y + radius > spatialGrid.rows * spatialGrid.cellSize
    ) {
      return true;
    }

    const { grid, cellSize } = spatialGrid;
    const minCol = Math.max(0, Math.floor((x - radius) / cellSize));
    const maxCol = Math.min(grid[0].length - 1, Math.floor((x + radius) / cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / cellSize));
    const maxRow = Math.min(grid.length - 1, Math.floor((y + radius) / cellSize));

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        for (let index = 0; index < grid[row][col].length; index += 1) {
          const other = grid[row][col][index];
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

    for (let index = 0; index < newCircles.length; index += 1) {
      const other = newCircles[index];
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

  function identifyGaps(width, height, circles) {
    const gaps = [];
    const samplePoints = Math.min(2000, (width * height) / 50);

    for (let index = 0; index < samplePoints; index += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      let maxRadius = Math.min(x, width - x, y, height - y);

      circles.forEach((circle) => {
        const dx = x - circle.x;
        const dy = y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        maxRadius = Math.min(maxRadius, distance - circle.r);
      });

      if (maxRadius > width / 200) {
        gaps.push({ x, y, maxRadius });
      }
    }

    gaps.sort((a, b) => b.maxRadius - a.maxRadius);
    return gaps.slice(0, Math.min(100, gaps.length));
  }

  function hasCollisionWithAllCircles(x, y, radius, existingCircles, newCircles, minDistanceMultiplier) {
    const allCircles = existingCircles.concat(newCircles);

    for (let index = 0; index < allCircles.length; index += 1) {
      const other = allCircles[index];
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

  function calculateCoverage(circles, totalArea) {
    let occupiedArea = 0;
    circles.forEach((circle) => {
      occupiedArea += Math.PI * circle.r * circle.r;
    });
    return Math.min(1, occupiedArea / totalArea);
  }

  function executePackingPhase(barWidth, barHeight, existingCircles, phase, overlapAmount) {
    const newCircles = [];
    const minDistanceMultiplier = overlapAmount === 0 ? 2.0 : (2.0 - ((overlapAmount / 100) * 1.8));
    const spatialGrid = createSpatialGrid(barWidth, barHeight, existingCircles, phase.maxRadius);

    for (let attempt = 0; attempt < phase.attempts; attempt += 1) {
      let bestCandidate = null;
      let bestScore = -Infinity;

      for (let candidate = 0; candidate < phase.candidatesPerAttempt; candidate += 1) {
        const radius = phase.minRadius + (Math.random() * (phase.maxRadius - phase.minRadius));
        const x = radius + (Math.random() * (barWidth - (2 * radius)));
        const y = radius + (Math.random() * (barHeight - (2 * radius)));

        if (!hasCollisionFast(x, y, radius, existingCircles, newCircles, spatialGrid, minDistanceMultiplier)) {
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

  function executeGapFillingPhase(barWidth, barHeight, existingCircles, density, sizeVariation, overlapAmount) {
    const gapFillingCircles = [];
    const minDistanceMultiplier = overlapAmount === 0 ? 2.0 : (2.0 - ((overlapAmount / 100) * 1.8));
    const gaps = identifyGaps(barWidth, barHeight, existingCircles);

    gaps.forEach((gap) => {
      if (gap.maxRadius < barWidth / 100) {
        return;
      }

      const targetRadius = gap.maxRadius * 0.8;
      const radiusVariation = targetRadius * (sizeVariation / 400);

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const radius = Math.max(targetRadius * 0.5, targetRadius + ((Math.random() - 0.5) * radiusVariation));
        if (!hasCollisionWithAllCircles(gap.x, gap.y, radius, existingCircles, gapFillingCircles, minDistanceMultiplier)) {
          gapFillingCircles.push({ x: gap.x, y: gap.y, r: radius });
          break;
        }
      }
    });

    return gapFillingCircles;
  }

  function generateStaticPackedCircles(barWidth, barHeight, density, sizeVariation, overlapAmount) {
    if (barWidth <= 0 || barHeight <= 0) return [];

    const safeDensity = clamp(density, 10, 100);
    const safeVariation = clamp(sizeVariation, 0, 100);
    const safeOverlap = clamp(overlapAmount, 0, 100);
    const area = barWidth * barHeight;
    let circles = [];

    const phases = calculatePhaseParameters(safeDensity, safeVariation, area, barHeight);

    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
      const phaseCircles = executePackingPhase(barWidth, barHeight, circles, phases[phaseIndex], safeOverlap);
      circles = circles.concat(phaseCircles);

      if (calculateCoverage(circles, area) >= (safeDensity / 100) * 0.95) {
        break;
      }
    }

    circles = circles.concat(executeGapFillingPhase(barWidth, barHeight, circles, safeDensity, safeVariation, safeOverlap));
    return circles;
  }

  function generateGridCircles(barWidth, barHeight, rows, gridDensity, sizeVariationY, sizeVariationX, gridOverlap, layout) {
    const circles = [];
    if (barWidth <= 0 || barHeight <= 0 || rows < 1) return circles;

    const baseRadius = (barHeight / (rows * 2)) * (gridDensity / 100);
    const rowHeight = barHeight / rows;
    const circleDiameter = baseRadius * 2;
    const baseColsPerRow = Math.floor(barWidth / circleDiameter);
    const colsPerRow = Math.floor(baseColsPerRow * (1 + (gridOverlap / 100)));

    for (let row = 0; row < rows; row += 1) {
      const rowProgress = rows > 1 ? row / (rows - 1) : 0.5;
      const baseY = (rowHeight * row) + (rowHeight / 2);
      const yVariationFactor = 1 + ((sizeVariationY / 100) * (1 - (rowProgress * 2)));
      const horizontalSpacing = barWidth / Math.max(1, colsPerRow - 1);
      let startOffset = 0;

      if (layout === 'stagger' && row % 2 === 1) {
        startOffset = circleDiameter / 2;
      }

      for (let col = 0; col < colsPerRow; col += 1) {
        const colProgress = colsPerRow > 1 ? col / (colsPerRow - 1) : 0.5;
        const baseX = startOffset + (col * horizontalSpacing);

        if (baseX < baseRadius || baseX > barWidth - baseRadius) {
          continue;
        }

        const xVariationFactor = 1 + ((sizeVariationX / 100) * ((colProgress * 2) - 1));
        const finalRadius = Math.max(0.5, baseRadius * yVariationFactor * xVariationFactor);
        circles.push({
          x: Math.max(finalRadius, Math.min(barWidth - finalRadius, baseX)),
          y: Math.max(finalRadius, Math.min(barHeight - finalRadius, baseY)),
          r: finalRadius
        });
      }
    }

    return circles;
  }

  function generateWaveValue(phase, type) {
    const normalizedPhase = phase - Math.floor(phase);
    const wrappedPhase = normalizedPhase < 0 ? normalizedPhase + 1 : normalizedPhase;
    const sine = (Math.sin(phase * 2 * Math.PI) + 1) * 0.5;
    const saw = wrappedPhase;
    const square = wrappedPhase > 0.5 ? 1.0 : 0.0;
    const pulse = wrappedPhase > 0.8 ? 1.0 : 0.0;

    if (type < 1.0) {
      return sine + (saw - sine) * type;
    }
    if (type < 2.0) {
      return saw + (square - saw) * (type - 1.0);
    }
    return square + (pulse - square) * (type - 2.0);
  }

  function buildPatternValues(timeSeconds) {
    return {
      rulerRepeats: app.state.rulerRepeats,
      rulerUnits: app.state.rulerUnits,
      tickerRepeats: app.state.tickerRepeats,
      tickerRatio: app.state.tickerRatio,
      tickerWidthRatio: app.state.tickerWidthRatio,
      binaryText: 'RPI',
      waveformType: app.state.waveformType,
      waveformFrequency: app.state.waveformFrequency,
      waveformSpeed: app.state.waveformSpeed,
      timeSeconds,
      circlesMode: 'packing',
      circlesFill: app.state.circlesFill,
      circlesDensity: app.state.circlesDensity,
      circlesSizeVariation: app.state.circlesSizeVariation,
      circlesOverlap: app.state.circlesOverlap,
      circlesRows: 2,
      circlesGridDensity: 100,
      circlesSizeVariationY: 0,
      circlesSizeVariationX: 0,
      circlesGridOverlap: 0,
      circlesLayout: 'straight',
      numericValue: '',
      numericMode: 'dotmatrix',
      morseText: 'RPI'
    };
  }

  function getPatternMarkup(timeSeconds, options = {}) {
    const barStartX = options.barStartX ?? BAR_GEOMETRY.x;
    const barY = options.barY ?? BAR_GEOMETRY.y;
    const exactBarWidth = options.barWidth ?? BAR_GEOMETRY.width;
    const barHeight = options.barHeight ?? BAR_GEOMETRY.height;
    const fgColor = options.fgColor || COLORS[app.state.colorMode].fg;

    return window.createBarPatternSVG({
      currentShader: STYLE_TO_SHADER[app.state.style],
      barStartX,
      barY,
      exactBarWidth,
      barHeight,
      fgColor,
      textToBinary,
      textToMorse,
      parseNumericString,
      generateGridCircles,
      generateStaticPackedCircles,
      values: buildPatternValues(timeSeconds)
    });
  }

  function buildLogoSvgMarkup(timeSeconds, includeXml, forcedFgColor) {
    if (!app.logoTemplate) return '';

    const colorPair = COLORS[app.state.colorMode];
    const fgColor = forcedFgColor || colorPair.fg;
    const prefix = includeXml ? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';
    const wordmark = app.logoTemplate.wordmarkPaths
      .map((path) => `  <path d="${path}" fill="${fgColor}"/>`)
      .join('\n');

    return `${prefix}<svg width="${app.logoTemplate.width}" height="${app.logoTemplate.height}" viewBox="${app.logoTemplate.viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Configured RPI logo">${wordmark}${getPatternMarkup(timeSeconds, { fgColor })}\n</svg>`;
  }

  function buildBarSvgMarkup(timeSeconds) {
    const colorPair = COLORS[app.state.colorMode];
    return `<svg width="${BAR_GEOMETRY.width}" height="${BAR_GEOMETRY.height}" viewBox="0 0 ${BAR_GEOMETRY.width} ${BAR_GEOMETRY.height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bar detail">${getPatternMarkup(timeSeconds, {
      barStartX: 0,
      barY: 0,
      barWidth: BAR_GEOMETRY.width,
      barHeight: BAR_GEOMETRY.height,
      fgColor: colorPair.fg
    })}\n</svg>`;
  }

  function buildEditorBarSvgMarkup(timeSeconds) {
    const colorPair = COLORS[app.state.colorMode];
    return `<svg width="${LOGO_EXPORT_WIDTH}" height="${LOGO_EXPORT_HEIGHT}" viewBox="0 0 ${LOGO_EXPORT_WIDTH} ${LOGO_EXPORT_HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Configured RPI bar">${getPatternMarkup(timeSeconds, {
      barStartX: BAR_GEOMETRY.x,
      barY: BAR_GEOMETRY.y,
      barWidth: BAR_GEOMETRY.width,
      barHeight: BAR_GEOMETRY.height,
      fgColor: colorPair.fg
    })}\n</svg>`;
  }

  function getStackLayers(stack) {
    return Array.from(stack.querySelectorAll('.stage_layer'));
  }

  function setActiveLayerMarkup(stack, markup) {
    const layers = getStackLayers(stack);
    const activeLayer = layers.find((layer) => layer.classList.contains('is-active')) || layers[0];
    if (activeLayer) {
      activeLayer.innerHTML = markup;
    }
  }

  function crossfadeStack(stack, markup) {
    const layers = getStackLayers(stack);
    const activeLayer = layers.find((layer) => layer.classList.contains('is-active')) || layers[0];
    const nextLayer = layers.find((layer) => layer !== activeLayer) || layers[1];

    if (!activeLayer || !nextLayer) {
      setActiveLayerMarkup(stack, markup);
      return;
    }

    nextLayer.innerHTML = markup;
    nextLayer.classList.remove('is-exiting');

    window.requestAnimationFrame(() => {
      nextLayer.classList.add('is-active');
      activeLayer.classList.remove('is-active');
      activeLayer.classList.add('is-exiting');

      window.setTimeout(() => {
        activeLayer.classList.remove('is-exiting');
        activeLayer.innerHTML = '';
      }, 240);
    });
  }

  function renderPreview(options = {}) {
    const timeSeconds = options.timeSeconds ?? (performance.now() / 1000);
    const stageMarkup = app.viewMode === 'preview'
      ? buildLogoSvgMarkup(timeSeconds, false, '#d6001c')
      : buildEditorBarSvgMarkup(timeSeconds);

    if (!app.previewInitialized || options.instant === true) {
      setActiveLayerMarkup(app.dom.logoStack, stageMarkup);
      app.previewInitialized = true;
      return;
    }

    if (options.crossfade === false) {
      setActiveLayerMarkup(app.dom.logoStack, stageMarkup);
      return;
    }

    crossfadeStack(app.dom.logoStack, stageMarkup);
  }

  function updateAnimationLoop() {
    window.cancelAnimationFrame(app.animationFrame);

    if (app.state.style !== 'waveform') {
      return;
    }

    const tick = (timestamp) => {
      renderPreview({ crossfade: false, timeSeconds: timestamp / 1000 });
      app.animationFrame = window.requestAnimationFrame(tick);
    };

    app.animationFrame = window.requestAnimationFrame(tick);
  }

  function applyState(partialState, options = {}) {
    app.state = normalizeState({ ...app.state, ...partialState });
    updateUi();
    renderPreview({
      instant: options.instant === true,
      crossfade: options.crossfade !== false
    });
    updateUrl();
    updateAnimationLoop();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportSvg() {
    const blob = new Blob([buildLogoSvgMarkup(performance.now() / 1000, true)], { type: 'image/svg+xml' });
    downloadBlob(blob, `RPI-logo-${app.state.style}.svg`);
  }

  function exportPng() {
    const svgMarkup = buildLogoSvgMarkup(performance.now() / 1000, false);
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const scale = 8;
      const canvas = document.createElement('canvas');
      canvas.width = LOGO_EXPORT_WIDTH * scale;
      canvas.height = Math.round(LOGO_EXPORT_HEIGHT * scale);
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          downloadBlob(pngBlob, `RPI-logo-${app.state.style}.png`);
        }
        URL.revokeObjectURL(url);
      }, 'image/png');
    };

    image.src = url;
  }

  function densityToChar(density) {
    if (density < 0.06) {
      return ' ';
    }

    const normalized = clamp((density - 0.06) / 0.94, 0, 1);
    const index = Math.min(HANDOFF_DENSITY.length - 1, Math.floor(Math.pow(normalized, 0.86) * (HANDOFF_DENSITY.length - 1)));
    return HANDOFF_DENSITY[index];
  }

  function measureIntroCell() {
    const probe = document.createElement('span');
    probe.textContent = 'M';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.fontFamily = 'RPIGeistMono, monospace';
    probe.style.fontSize = getComputedStyle(app.dom.handoffTerminal).fontSize;
    probe.style.lineHeight = getComputedStyle(app.dom.handoffTerminal).lineHeight;
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    probe.remove();
    return {
      width: rect.width || 6,
      height: rect.height || 8
    };
  }

  function sampleDensity(data, width, left, right, top, bottom) {
    let coverage = 0;
    let samples = 0;

    for (let sy = top; sy < bottom; sy += 1) {
      for (let sx = left; sx < right; sx += 1) {
        const index = ((sy * width) + sx) * 4;
        coverage += data[index + 3] / 255;
        samples += 1;
      }
    }

    return samples > 0 ? coverage / samples : 0;
  }

  async function buildHandoffMask() {
    const image = new Image();
    image.src = LOGO_ASSET_PATH;
    await image.decode();

    const bounds = app.dom.handoffTerminal.getBoundingClientRect();
    const metrics = measureIntroCell();
    const cols = Math.max(56, Math.floor(bounds.width / Math.max(metrics.width, 1)));
    const rows = Math.max(18, Math.floor(bounds.height / Math.max(metrics.height, 1)));
    const oversample = 6;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = Math.max(1, Math.round(cols * metrics.width * oversample));
    canvas.height = Math.max(1, Math.round(rows * metrics.height * oversample));
    context.clearRect(0, 0, canvas.width, canvas.height);

    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const aspect = imageWidth / imageHeight;
    const maxWidth = canvas.width * 0.9;
    const maxHeight = canvas.height * 0.9;
    let drawWidth = maxWidth;
    let drawHeight = drawWidth / aspect;

    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * aspect;
    }

    const offsetX = (canvas.width - drawWidth) * 0.5;
    const offsetY = (canvas.height - drawHeight) * 0.5;
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const rowsList = [];
    const cells = [];

    for (let row = 0; row < rows; row += 1) {
      let rowText = '';
      for (let col = 0; col < cols; col += 1) {
        const left = Math.floor((col / cols) * canvas.width);
        const right = Math.floor(((col + 1) / cols) * canvas.width);
        const top = Math.floor((row / rows) * canvas.height);
        const bottom = Math.floor(((row + 1) / rows) * canvas.height);
        const density = sampleDensity(data, canvas.width, left, right, top, bottom);
        const char = densityToChar(density);
        rowText += char;

        if (char !== ' ') {
          cells.push({ x: col, y: row, char });
        }
      }
      rowsList.push(rowText.replace(/\s+$/, ''));
    }

    return {
      cols,
      rows,
      text: rowsList.join('\n'),
      cells
    };
  }

  function getHandoffTargets() {
    const textTargets = app.dom.handoffTextTargets.flatMap((target) => {
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return [];
      }

      return [
        { x: rect.left + (rect.width * 0.18), y: rect.top + (rect.height * 0.5) },
        { x: rect.left + (rect.width * 0.5), y: rect.top + (rect.height * 0.5) },
        { x: rect.left + (rect.width * 0.82), y: rect.top + (rect.height * 0.5) }
      ];
    });

    if (textTargets.length > 0) {
      return textTargets;
    }

    const rect = app.dom.previewSurface.getBoundingClientRect();
    return [{ x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2) }];
  }

  async function runHandoff(options = {}) {
    if (!app.handoffMask) {
      app.handoffMask = await buildHandoffMask();
    }

    const stageRect = app.dom.handoffTerminal.getBoundingClientRect();
    const targets = getHandoffTargets();
    const sampledCells = app.handoffMask.cells.slice(0, options.particleCount || HANDOFF_PARTICLE_LIMIT);
    const fragment = document.createDocumentFragment();
    const particleStep = options.particleStep || 3;
    const duration = options.duration || HANDOFF_DURATION_MS;

    app.dom.handoffTerminal.textContent = app.handoffMask.text;
    app.dom.handoffParticles.replaceChildren();

    sampledCells.forEach((cell, index) => {
      const particle = document.createElement('span');
      const target = targets[index % targets.length];
      const startX = ((cell.x + 0.5) / app.handoffMask.cols) * stageRect.width;
      const startY = ((cell.y + 0.5) / app.handoffMask.rows) * stageRect.height;
      const endX = target.x - stageRect.left;
      const endY = target.y - stageRect.top;

      particle.className = 'handoff_particle';
      particle.textContent = cell.char;
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.setProperty('--particle-x', `${endX - startX}px`);
      particle.style.setProperty('--particle-y', `${endY - startY}px`);
      particle.style.transitionDelay = `${(index % 90) * particleStep}ms`;
      fragment.appendChild(particle);
    });

    app.dom.handoffParticles.appendChild(fragment);
    app.dom.body.classList.add('is-handoff');

    window.requestAnimationFrame(() => {
      app.dom.body.classList.add('is-funneling');
    });

    await wait(duration);
  }

  async function finishIntroImmediately() {
    app.introRunId += 1;
    window.clearTimeout(app.introTimer);
    window.cancelAnimationFrame(app.animationFrame);
    app.introRunning = true;

    app.dom.body.classList.remove('is-ready');
    app.dom.introOverlay.classList.remove('is-hidden');
    app.dom.handoffParticles.replaceChildren();
    if (!app.handoffMask) {
      app.handoffMask = await buildHandoffMask();
    }
    await runHandoff({ duration: 920, particleCount: 460, particleStep: 3 });
    app.dom.body.classList.add('is-ready');
    app.dom.introOverlay.classList.add('is-hidden');
    app.dom.body.classList.remove('is-handoff', 'is-funneling');
    updateAnimationLoop();
    app.introRunning = false;
  }

  async function runIntro(forceReplay = false) {
    if (app.introRunning) {
      return;
    }

    const runId = ++app.introRunId;
    app.introRunning = true;
    window.clearTimeout(app.introTimer);
    window.cancelAnimationFrame(app.animationFrame);

    app.dom.body.classList.remove('is-ready', 'is-handoff', 'is-funneling');
    app.dom.introOverlay.classList.remove('is-hidden');
    app.dom.handoffParticles.replaceChildren();
    reloadIntroFrame();

    if (forceReplay) {
      await wait(80);
      if (runId !== app.introRunId) {
        return;
      }
    }

    await wait(REDUCED_MOTION_QUERY.matches ? 240 : ANIMATION_INTRO_DURATION_MS);
    if (runId !== app.introRunId) {
      return;
    }

    await runHandoff();
    if (runId !== app.introRunId) {
      return;
    }

    app.dom.body.classList.add('is-ready');
    app.dom.introOverlay.classList.add('is-hidden');
    app.dom.body.classList.remove('is-handoff', 'is-funneling');
    updateAnimationLoop();
    app.introRunning = false;
  }

  function bindEvents() {
    app.dom.styleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyState({ style: button.getAttribute('data-style-button') });
      });
    });

    app.dom.viewButtons.forEach((button) => {
      button.addEventListener('click', () => {
        app.viewMode = normalizeViewMode(button.getAttribute('data-view-button'));
        updateUi();
        renderPreview();
      });
    });

    app.dom.colorButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyState({ colorMode: button.getAttribute('data-color-button') });
      });
    });

    app.dom.paramInputs.forEach((input) => {
      const key = input.getAttribute('data-param');
      if (!key) {
        return;
      }

      input.addEventListener('input', (event) => {
        applyState({ [key]: event.currentTarget.value }, { crossfade: false });
      });
    });

    app.dom.waveformChoices.forEach((button) => {
      button.addEventListener('click', () => {
        applyState({ waveformType: Number(button.getAttribute('data-waveform-choice')), style: 'waveform' });
      });
    });

    app.dom.circlesFillChoices.forEach((button) => {
      button.addEventListener('click', () => {
        applyState({ circlesFill: button.getAttribute('data-circles-fill'), style: 'circles' });
      });
    });

    app.dom.exportButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.getAttribute('data-export') === 'svg') {
          exportSvg();
        } else {
          exportPng();
        }
      });
    });

    app.dom.replayIntroButton.addEventListener('click', () => {
      runIntro(true);
    });

    if (app.dom.skipIntroButton) {
      app.dom.skipIntroButton.addEventListener('click', () => {
        finishIntroImmediately();
      });
    }

    window.addEventListener('resize', async () => {
      app.handoffMask = null;
      rebuildBackgroundProjection();
      renderPreview({ crossfade: false });
    });
  }

  async function initFullscreenGenerator(options = {}) {
    const mountId = options.mountId || 'generator-app';
    const root = document.getElementById(mountId);
    if (!root) return;

    app.options = options;
    root.innerHTML = buildMarkup();
    cacheDom(root);
    app.state = getUrlState();

    document.body.classList.add('is-intro-playing');

    await Promise.all([
      loadLogoTemplate(),
      document.fonts ? document.fonts.ready.catch(() => undefined) : Promise.resolve()
    ]);

    startBackgroundProjection();
    updateUi();
    renderPreview({ instant: true, crossfade: false });
    bindEvents();
    runIntro(false);
  }

  window.initFullscreenGenerator = initFullscreenGenerator;
}());
