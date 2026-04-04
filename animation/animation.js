const PATTERN_PATH = '/animation/data/rpi-pattern-1.svg';
const LOGO_PATH = '/animation/data/rpi-logo-5.svg';
const projection = document.getElementById('animation-projection');
const DENSITY_RAMP = ' .,:-=+*#%@';

const TEXT_BLOCK = `
/dream BUILDING THE NEW THROUGH PRECISE ITERATION AND CODE.
/dream WHAT IF WE TRIED THIS AGAIN WITH MORE RIGOR.
/dream RPI LOGO GENERATOR INITIALIZING IN RED PIXEL SPACE.
/dream TROY COORDINATES TOLERANCES LAB NOTES AND SYSTEMS.
/dream TEST BREAK REBUILD REPEAT UNTIL THE SHAPE HOLDS.
/dream MEASUREMENT DATA MOTION BAR SIGNAL AND STRUCTURE.
/dream ROBOTICS ARCHITECTURE COMPUTING ENERGY MATERIALS.
/dream WHY NOT CHANGE THE WORLD ONE PASS AT A TIME.
`;

const stream = TEXT_BLOCK.replace(/\s+/g, ' ').trim();

const TIMING = {
  ambient: 2.4,
  assemble: 2.9,
  settle: 0.9
};

const state = {
  cols: 0,
  rows: 0,
  fontSize: 4,
  lineHeight: 4,
  sourceGrid: [],
  sourceCells: [],
  logoCells: [],
  finalGrid: [],
  finalText: '',
  particles: [],
  frameHandle: 0,
  startTime: 0
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, progress) {
  return start + ((end - start) * progress);
}

function easeInOutCubic(value) {
  if (value < 0.5) {
    return 4 * value * value * value;
  }

  return 1 - (Math.pow(-2 * value + 2, 3) / 2);
}

function easeOutQuint(value) {
  return 1 - Math.pow(1 - value, 5);
}

function cellNoise(x, y, seed) {
  const value = Math.sin((x * 12.9898) + (y * 78.233) + (seed * 37.719)) * 43758.5453;
  return value - Math.floor(value);
}

function densityToChar(density) {
  if (density < 0.06) {
    return ' ';
  }

  const normalized = clamp((density - 0.06) / 0.94, 0, 1);
  const eased = Math.pow(normalized, 0.85);
  const index = Math.min(DENSITY_RAMP.length - 1, Math.floor(eased * (DENSITY_RAMP.length - 1)));
  return DENSITY_RAMP[index];
}

function getStreamChar(index) {
  return stream[index % stream.length];
}

function measureCellMetrics() {
  const probe = document.createElement('span');
  probe.textContent = 'M';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.fontFamily = 'RPIGeistMono, monospace';
  probe.style.fontSize = `${state.fontSize}px`;
  probe.style.lineHeight = `${state.lineHeight}px`;
  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return {
    width: rect.width || 4,
    height: rect.height || 4
  };
}

function updateProjectionScale() {
  const targetFontSize = clamp(
    Math.floor(Math.min(window.innerWidth / 240, window.innerHeight / 138)),
    4,
    6
  );

  state.fontSize = targetFontSize;
  state.lineHeight = Math.max(4, Math.round(targetFontSize * 0.9));
  projection.style.fontSize = `${state.fontSize}px`;
  projection.style.lineHeight = `${state.lineHeight}px`;

  const metrics = measureCellMetrics();
  state.cols = Math.max(80, Math.ceil(window.innerWidth / Math.max(metrics.width, 1)));
  state.rows = Math.max(48, Math.ceil(window.innerHeight / Math.max(metrics.height, 1)));
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

async function rasterizeMask(path, maxWidthRatio, maxHeightRatio, fitMode = 'contain') {
  const image = new Image();
  image.src = path;
  await image.decode();

  const metrics = measureCellMetrics();
  const oversample = 6;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = Math.max(1, Math.round(state.cols * metrics.width * oversample));
  canvas.height = Math.max(1, Math.round(state.rows * metrics.height * oversample));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;

  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const aspect = imageWidth / imageHeight;
  const maxWidth = canvas.width * maxWidthRatio;
  const maxHeight = canvas.height * maxHeightRatio;
  let drawWidth = maxWidth;
  let drawHeight = drawWidth / aspect;

  if (fitMode === 'cover') {
    if (drawHeight < maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * aspect;
    }
  } else if (drawHeight > maxHeight) {
    drawHeight = maxHeight;
    drawWidth = drawHeight * aspect;
  }

  const offsetX = (canvas.width - drawWidth) * 0.5;
  const offsetY = (canvas.height - drawHeight) * 0.5;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const cells = [];
  const grid = Array.from({ length: state.rows }, () => Array(state.cols).fill(' '));

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      const cellLeft = Math.floor((col / state.cols) * canvas.width);
      const cellRight = Math.floor(((col + 1) / state.cols) * canvas.width);
      const cellTop = Math.floor((row / state.rows) * canvas.height);
      const cellBottom = Math.floor(((row + 1) / state.rows) * canvas.height);
      const density = sampleDensity(data, canvas.width, cellLeft, cellRight, cellTop, cellBottom);
      const char = densityToChar(density);

      grid[row][col] = char;

      if (char !== ' ') {
        cells.push({ x: col, y: row, char });
      }
    }
  }

  return { cells, grid };
}

function buildSourceField(patternGrid) {
  state.sourceGrid = Array.from({ length: state.rows }, () => Array(state.cols).fill(' '));
  state.sourceCells = [];

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      const patternChar = patternGrid[row]?.[col] || ' ';
      const baseChar = getStreamChar((row * state.cols) + col);
      const sparseDensity = cellNoise(col, row, 17);
      const sparseChar = sparseDensity > 0.82 ? baseChar : ' ';
      const char = patternChar === ' ' ? sparseChar : patternChar;

      state.sourceGrid[row][col] = char;

      if (char !== ' ') {
        state.sourceCells.push({ x: col, y: row, char });
      }
    }
  }
}

function buildParticles() {
  const sourceCount = state.sourceCells.length;
  const centerX = (state.cols - 1) * 0.5;
  const centerY = (state.rows - 1) * 0.5;

  state.particles = state.logoCells.map((target, index) => {
    const source = state.sourceCells[(index * 6151) % sourceCount];
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt((dx * dx) + (dy * dy));
    const perpX = dy / Math.max(distance, 1);
    const perpY = -dx / Math.max(distance, 1);
    const targetCenterDx = target.x - centerX;
    const targetCenterDy = target.y - centerY;

    return {
      sourceX: source.x,
      sourceY: source.y,
      targetX: target.x,
      targetY: target.y,
      sourceChar: source.char,
      targetChar: target.char,
      startOffset: cellNoise(source.x, source.y, 7) * 0.32,
      arc: ((cellNoise(target.x, target.y, 11) * 2) - 1) * clamp(distance * 0.16, 4, 24),
      swirlRadius: clamp(Math.sqrt((targetCenterDx * targetCenterDx) + (targetCenterDy * targetCenterDy)) * 0.35, 2, 14),
      swirlPhase: cellNoise(target.x, target.y, 13) * Math.PI * 2,
      perpX,
      perpY
    };
  });
}

async function rebuildScene() {
  const patternMask = await rasterizeMask(PATTERN_PATH, 1.02, 1.02, 'cover');
  const logoMask = await rasterizeMask(LOGO_PATH, 0.68, 0.34, 'contain');

  buildSourceField(patternMask.grid);
  state.logoCells = logoMask.cells;
  state.finalGrid = logoMask.grid;
  state.finalText = logoMask.grid.map((row) => row.join('')).join('\n');
  buildParticles();
}

function renderAmbient(elapsed) {
  const buffer = Array.from({ length: state.rows }, () => Array(state.cols).fill(' '));
  const phase = elapsed * 0.9;

  for (const cell of state.sourceCells) {
    const driftX = Math.round(Math.sin((cell.y * 0.1) + (phase * 2.2) + (cell.x * 0.015)) * 2.4);
    const driftY = Math.round(Math.cos((cell.x * 0.08) - (phase * 1.8) + (cell.y * 0.018)) * 1.6);
    const x = clamp(cell.x + driftX, 0, state.cols - 1);
    const y = clamp(cell.y + driftY, 0, state.rows - 1);
    const alt = cellNoise(cell.x, cell.y, Math.floor(elapsed * 10) + 21);
    const char = alt > 0.83
      ? getStreamChar((cell.y * state.cols) + cell.x + Math.floor(elapsed * 36))
      : cell.char;

    buffer[y][x] = char;
  }

  return buffer.map((row) => row.join('')).join('\n');
}

function renderAssemble(progress) {
  const buffer = Array.from({ length: state.rows }, () => Array(state.cols).fill(' '));
  const backgroundFade = easeOutQuint(progress);

  for (const cell of state.sourceCells) {
    if (cellNoise(cell.x, cell.y, 29) > backgroundFade) {
      const driftX = Math.round(Math.sin((cell.y * 0.08) + (progress * 8) + (cell.x * 0.01)) * (1.5 - progress));
      const driftY = Math.round(Math.cos((cell.x * 0.05) - (progress * 9) + (cell.y * 0.012)) * (1.2 - (progress * 0.8)));
      const x = clamp(cell.x + driftX, 0, state.cols - 1);
      const y = clamp(cell.y + driftY, 0, state.rows - 1);
      buffer[y][x] = cell.char;
    }
  }

  for (const particle of state.particles) {
    const local = clamp((progress - particle.startOffset) / (1 - particle.startOffset), 0, 1);
    const eased = easeInOutCubic(local);
    const swirl = (1 - local) * particle.swirlRadius;
    const curve = (1 - local) * particle.arc;
    const swirlAngle = particle.swirlPhase + (local * 8.5);
    const x = Math.round(
      lerp(particle.sourceX, particle.targetX, eased) +
      (particle.perpX * curve) +
      (Math.cos(swirlAngle) * swirl)
    );
    const y = Math.round(
      lerp(particle.sourceY, particle.targetY, eased) +
      (particle.perpY * curve) +
      (Math.sin(swirlAngle) * swirl * 0.7)
    );

    if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) {
      continue;
    }

    const char = local > 0.82 ? particle.targetChar : particle.sourceChar;
    buffer[y][x] = char;
  }

  return buffer.map((row) => row.join('')).join('\n');
}

function renderSettle(progress) {
  const buffer = state.finalGrid.map((row) => [...row]);

  for (const cell of state.logoCells) {
    if (cellNoise(cell.x, cell.y, Math.floor(progress * 18) + 41) > (0.92 + (progress * 0.06))) {
      buffer[cell.y][cell.x] = getStreamChar((cell.y * state.cols) + cell.x);
    }
  }

  return buffer.map((row) => row.join('')).join('\n');
}

function renderFrame(timestamp) {
  if (!state.startTime) {
    state.startTime = timestamp;
  }

  const elapsed = (timestamp - state.startTime) / 1000;
  const ambientEnd = TIMING.ambient;
  const assembleEnd = TIMING.ambient + TIMING.assemble;
  const settleEnd = TIMING.ambient + TIMING.assemble + TIMING.settle;

  if (elapsed < ambientEnd) {
    projection.textContent = renderAmbient(elapsed);
    state.frameHandle = window.requestAnimationFrame(renderFrame);
    return;
  }

  if (elapsed < assembleEnd) {
    const progress = (elapsed - ambientEnd) / TIMING.assemble;
    projection.textContent = renderAssemble(progress);
    state.frameHandle = window.requestAnimationFrame(renderFrame);
    return;
  }

  if (elapsed < settleEnd) {
    const progress = (elapsed - assembleEnd) / TIMING.settle;
    projection.textContent = renderSettle(progress);
    state.frameHandle = window.requestAnimationFrame(renderFrame);
    return;
  }

  projection.textContent = state.finalText;
}

async function prepare() {
  if (document.fonts && document.fonts.load) {
    await document.fonts.load('32px RPIGeistMono');
    await document.fonts.ready;
  }

  updateProjectionScale();
  await rebuildScene();
  projection.textContent = renderAmbient(0);
  window.cancelAnimationFrame(state.frameHandle);
  state.frameHandle = 0;
  state.startTime = 0;
  state.frameHandle = window.requestAnimationFrame(renderFrame);
}

window.addEventListener('resize', async () => {
  updateProjectionScale();
  await rebuildScene();
  state.startTime = 0;
  window.cancelAnimationFrame(state.frameHandle);
  state.frameHandle = window.requestAnimationFrame(renderFrame);
});

prepare().catch((error) => {
  projection.textContent = error.message;
});
