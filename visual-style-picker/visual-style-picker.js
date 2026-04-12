(function () {
  const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CARD_POSITIONS = [
    { scale: 1, y: 12, z: 3 },
    { scale: 0.95, y: -16, z: 2 },
    { scale: 0.9, y: -44, z: 1 }
  ];
  const BAR_WIDTH = 250;
  const BAR_HEIGHT = 18;
  const BAR_Y = 36;
  const STYLE_TO_SHADER = {
    ruler: 1,
    ticker: 2,
    waveform: 4,
    circles: 5
  };
  const STYLE_OPTIONS = [
    {
      id: 'ruler',
      title: 'Ruler',
      description: 'Measurement Visual Style',
      values: {
        rulerRepeats: 10,
        rulerUnits: 4
      }
    },
    {
      id: 'ticker',
      title: 'Ticker',
      description: 'Ratio Visual Style',
      values: {
        tickerRepeats: 34,
        tickerRatio: 2,
        tickerWidthRatio: 2
      }
    },
    {
      id: 'waveform',
      title: 'Waveform',
      description: 'Signal Visual Style',
      values: {
        waveformType: 0,
        waveformFrequency: 24,
        waveformSpeed: 0.7,
        timeSeconds: 0.2
      }
    },
    {
      id: 'circles',
      title: 'Circles',
      description: 'Packing Visual Style',
      values: {
        circlesMode: 'packing',
        circlesFill: 'stroke',
        circlesDensity: 58,
        circlesSizeVariation: 22,
        circlesOverlap: 0
      }
    }
  ];

  const app = {
    cards: STYLE_OPTIONS.map((style, index) => ({
      uid: index + 1,
      style
    })),
    nextUid: STYLE_OPTIONS.length + 1,
    selectedStyleId: STYLE_OPTIONS[0].id,
    isAnimating: false,
    dom: {}
  };

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function seededNoise(index, seed) {
    const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  function hasCircleCollision(x, y, radius, circles, multiplier) {
    for (let i = 0; i < circles.length; i += 1) {
      const circle = circles[i];
      const dx = x - circle.x;
      const dy = y - circle.y;
      const minDistance = (radius + circle.r) * multiplier;

      if ((dx * dx) + (dy * dy) < minDistance * minDistance) {
        return true;
      }
    }

    return false;
  }

  function generateStaticPackedCircles(barWidth, barHeight, density, sizeVariation, overlapAmount) {
    const safeDensity = clamp(parseInt(density, 10) || 58, 10, 100);
    const safeVariation = clamp(parseInt(sizeVariation, 10) || 0, 0, 100);
    const safeOverlap = clamp(parseInt(overlapAmount, 10) || 0, 0, 100);
    const circles = [];
    const targetCount = Math.round(10 + safeDensity * 0.46);
    const minDistanceMultiplier = safeOverlap === 0 ? 1.02 : 1.02 - safeOverlap * 0.006;
    const seed = safeDensity + safeVariation * 3 + safeOverlap * 7;

    for (let attempt = 0; attempt < 900 && circles.length < targetCount; attempt += 1) {
      const baseRadius = 1.5 + seededNoise(attempt, seed) * (barHeight * 0.22);
      const radiusJitter = 1 + ((seededNoise(attempt + 19, seed) - 0.5) * (safeVariation / 160));
      const radius = clamp(baseRadius * radiusJitter, 1.25, barHeight * 0.34);
      const x = radius + seededNoise(attempt + 41, seed) * (barWidth - radius * 2);
      const y = radius + seededNoise(attempt + 73, seed) * (barHeight - radius * 2);

      if (!hasCircleCollision(x, y, radius, circles, minDistanceMultiplier)) {
        circles.push({ x, y, r: radius });
      }
    }

    return circles;
  }

  function generateGridCircles(barWidth, barHeight, rows, gridDensity) {
    const circles = [];
    const safeRows = Math.max(1, parseInt(rows, 10) || 2);
    const safeDensity = clamp(parseInt(gridDensity, 10) || 100, 10, 100);
    const rowHeight = barHeight / safeRows;
    const radius = (rowHeight / 2) * (safeDensity / 100);
    const columns = Math.max(1, Math.floor(barWidth / Math.max(1, radius * 2.4)));
    const spacing = barWidth / columns;

    for (let row = 0; row < safeRows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        circles.push({
          x: spacing * column + spacing / 2,
          y: rowHeight * row + rowHeight / 2,
          r: radius
        });
      }
    }

    return circles;
  }

  function textToBinary(text) {
    return String(text || 'RPI')
      .split('')
      .flatMap((character) => {
        const binary = character.charCodeAt(0).toString(2).padStart(8, '0');
        return binary.split('').map((bit) => Number(bit));
      });
  }

  function textToMorse() {
    return [];
  }

  function parseNumericString(value) {
    return String(value || '')
      .split('')
      .map((character) => (character === '.' ? 10 : parseInt(character, 10)))
      .filter((digit) => Number.isFinite(digit));
  }

  function getPatternMarkup(style) {
    if (typeof window.createBarPatternSVG !== 'function') {
      return `<rect x="0" y="${BAR_Y}" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" fill="#ffffff"/>`;
    }

    return window.createBarPatternSVG({
      currentShader: STYLE_TO_SHADER[style.id],
      barStartX: 0,
      barY: BAR_Y,
      exactBarWidth: BAR_WIDTH,
      barHeight: BAR_HEIGHT,
      fgColor: '#ffffff',
      textToBinary,
      textToMorse,
      parseNumericString,
      generateGridCircles,
      generateStaticPackedCircles,
      values: {
        binaryText: 'RPI',
        waveformType: 0,
        waveformFrequency: 24,
        waveformSpeed: 0.7,
        circlesMode: 'packing',
        circlesFill: 'stroke',
        circlesDensity: 58,
        circlesSizeVariation: 22,
        circlesOverlap: 0,
        circlesRows: 2,
        circlesGridDensity: 100,
        circlesSizeVariationY: 0,
        circlesSizeVariationX: 0,
        circlesGridOverlap: 0,
        circlesLayout: 'straight',
        ...style.values
      }
    });
  }

  function buildPreviewSvg(style) {
    const patternMarkup = getPatternMarkup(style);

    return `
      <svg class="style-card_svg" viewBox="0 0 250 90" role="img" aria-label="${escapeAttribute(style.title)} bar preview" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="250" height="90" fill="#050505"/>
        <g opacity="0.13" stroke="#ffffff" stroke-width="0.5">
          ${Array.from({ length: 15 }, (_, index) => `<line x1="0" y1="${index * 6}" x2="250" y2="${index * 6}"/>`).join('')}
          ${Array.from({ length: 32 }, (_, index) => `<line x1="${index * 8}" y1="0" x2="${index * 8}" y2="90"/>`).join('')}
        </g>
        <rect x="0" y="${BAR_Y}" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" fill="#ffffff" opacity="0.045"/>
        <g>${patternMarkup}</g>
        <rect x="0.5" y="${BAR_Y + 0.5}" width="${BAR_WIDTH - 1}" height="${BAR_HEIGHT - 1}" fill="none" stroke="#ffffff" stroke-opacity="0.28"/>
      </svg>
    `;
  }

  function buildCardMarkup(card, index, exitingUid) {
    const position = CARD_POSITIONS[index] || CARD_POSITIONS[CARD_POSITIONS.length - 1];
    const isSelected = card.style.id === app.selectedStyleId;
    const isHiddenLayer = index > 0;
    const classes = ['picker_card'];

    if (card.uid === exitingUid) {
      classes.push('is-exiting');
    }

    return `
      <article
        class="${classes.join(' ')}"
        data-card
        data-style-id="${escapeAttribute(card.style.id)}"
        data-selected="${isSelected ? 'true' : 'false'}"
        aria-hidden="${isHiddenLayer ? 'true' : 'false'}"
        style="--card-scale: ${position.scale}; --card-y: ${position.y}px; --card-z: ${position.z};"
      >
        <div class="style-card_art">
          ${buildPreviewSvg(card.style)}
        </div>
        <div class="style-card_body">
          <div class="style-card_text">
            <span class="style-card_title">${escapeAttribute(card.style.title)}</span>
            <span class="style-card_description">${escapeAttribute(card.style.description)}</span>
          </div>
          <button
            class="style-card_select"
            type="button"
            data-select-style="${escapeAttribute(card.style.id)}"
            aria-pressed="${isSelected ? 'true' : 'false'}"
            ${isHiddenLayer ? 'tabindex="-1"' : ''}
          >
            Select &gt;
          </button>
        </div>
      </article>
    `;
  }

  function render(exitingUid) {
    app.dom.stack.innerHTML = app.cards
      .slice(0, 3)
      .map((card, index) => buildCardMarkup(card, index, exitingUid))
      .join('');

    app.dom.status.textContent = `${getSelectedStyle().title} selected.`;
  }

  function getSelectedStyle() {
    return STYLE_OPTIONS.find((style) => style.id === app.selectedStyleId) || STYLE_OPTIONS[0];
  }

  function rotateCards() {
    const firstCard = app.cards[0];
    app.cards = [
      ...app.cards.slice(1),
      {
        uid: app.nextUid,
        style: firstCard.style
      }
    ];
    app.nextUid += 1;
  }

  function handleCycle() {
    if (app.isAnimating) {
      return;
    }

    const exitingUid = app.cards[0].uid;
    const duration = REDUCED_MOTION_QUERY.matches ? 1 : 440;
    app.isAnimating = true;
    render(exitingUid);

    window.setTimeout(() => {
      rotateCards();
      app.isAnimating = false;
      render();
    }, duration);
  }

  function handleSelect(styleId) {
    if (!STYLE_OPTIONS.some((style) => style.id === styleId)) {
      return;
    }

    app.selectedStyleId = styleId;
    try {
      window.localStorage.setItem('rpi.visualStylePicker.selectedStyle', styleId);
    } catch (error) {
      // Local storage can be unavailable in private or embedded browsing modes.
    }

    const params = new URLSearchParams(window.location.search);
    params.set('style', styleId);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    render();
  }

  function readInitialSelection() {
    const params = new URLSearchParams(window.location.search);
    const urlStyle = params.get('style');

    if (STYLE_OPTIONS.some((style) => style.id === urlStyle)) {
      app.selectedStyleId = urlStyle;
      return;
    }

    try {
      const storedStyle = window.localStorage.getItem('rpi.visualStylePicker.selectedStyle');
      if (STYLE_OPTIONS.some((style) => style.id === storedStyle)) {
        app.selectedStyleId = storedStyle;
      }
    } catch (error) {
      app.selectedStyleId = STYLE_OPTIONS[0].id;
    }
  }

  function bindEvents() {
    app.dom.cycleButton.addEventListener('click', handleCycle);
    app.dom.stack.addEventListener('click', (event) => {
      const selectButton = event.target.closest('[data-select-style]');
      if (!selectButton) {
        return;
      }

      handleSelect(selectButton.getAttribute('data-select-style'));
    });
  }

  function init() {
    app.dom.stack = document.querySelector('[data-card-stack]');
    app.dom.cycleButton = document.querySelector('[data-cycle-button]');
    app.dom.status = document.querySelector('[data-picker-status]');

    if (!app.dom.stack || !app.dom.cycleButton || !app.dom.status) {
      return;
    }

    readInitialSelection();
    bindEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
