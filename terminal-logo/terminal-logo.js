const viewport = document.querySelector('[data-terminal-viewport]');
const backgroundLayer = document.querySelector('[data-terminal-background]');
const logoLayer = document.querySelector('[data-terminal-lines]');

const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

const TOKENS = [
  'rpi',
  'build.new',
  'what-if',
  'why-not',
  'seed',
  'prompt',
  'matrix',
  'terminal',
  'signal',
  'glyph',
  'render',
  'sample',
  'network',
  'metric',
  'offset',
  'frame',
  'scan',
  'cursor',
  'trace',
  'module',
  'kernel',
  'vector',
  'history',
  'future',
  'curious',
  'genuine',
  'humble',
  'resilient',
  'experiment',
  'rebuild',
  'campus',
  'lab',
  'research',
  'compute',
  'density',
  'bar',
  'logo'
];

const CLAUSES = [
  'render=terminal-field',
  'geometry=official',
  'surface=black',
  'ink=white',
  'accent=red',
  'motion=drift',
  'mask=logo',
  'depth=shallow',
  'tilt=enabled',
  'density=adaptive',
  'signal=stable',
  'output=live'
];

const SEPARATORS = [' // ', ' :: ', ' == ', ' ++ ', ' <> ', ' ~~ '];
const PREFIXES = ['root@rpi', 'field@rpi', 'signal@rpi', 'motion@rpi', 'render@rpi'];

const state = {
  rows: [],
  frameHandle: 0,
  metrics: {
    width: 0,
    height: 0,
    fontSize: 0,
    rowCount: 0,
    columnCount: 0,
    rowHeight: 0
  }
};

function createGenerator(seed) {
  let value = seed >>> 0;

  return function next() {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function choose(random, list) {
  return list[Math.floor(random() * list.length)];
}

function buildSegment(random, rowIndex) {
  const mode = Math.floor(random() * 5);

  if (mode === 0) {
    const clause = choose(random, CLAUSES);
    const value = Math.floor(random() * 999999).toString(16).padStart(6, '0');
    return `${clause}:${value}`;
  }

  if (mode === 1) {
    return `${choose(random, TOKENS)}=${Math.floor(random() * 100)
      .toString()
      .padStart(2, '0')}%`;
  }

  if (mode === 2) {
    return `${choose(random, TOKENS)}.${choose(random, TOKENS)}`;
  }

  if (mode === 3) {
    return `${String(rowIndex).padStart(2, '0')}:${Math.floor(random() * 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(random() * 60)
      .toString()
      .padStart(2, '0')} ${choose(random, TOKENS)}`;
  }

  return choose(random, TOKENS);
}

function buildRowText(rowIndex, columnCount, densitySeed) {
  const random = createGenerator((rowIndex + 1) * 2654435761 + densitySeed);
  let line = `${PREFIXES[rowIndex % PREFIXES.length]}:${String(rowIndex).padStart(2, '0')}$ `;
  const targetLength = Math.max(columnCount * 4, columnCount + 64);

  while (line.length < targetLength) {
    line += `${buildSegment(random, rowIndex)}${choose(random, SEPARATORS)}`;
  }

  return line;
}

function createRowElement(rowIndex, layerName) {
  const row = document.createElement('div');
  const mode = rowIndex % 6 === 0 ? 'is-strong' : rowIndex % 2 === 0 ? 'is-mid' : 'is-dim';

  row.className = `terminal_logo_row ${mode}`;
  row.dataset.layer = layerName;

  return row;
}

function createRowModel(rowIndex, rowHeight, columnCount) {
  const random = createGenerator((rowIndex + 11) * 2246822519);
  const contentSeed = Math.floor(random() * 50000) + 1000;
  const baseShift = Math.round((random() - 0.5) * 16);
  const direction = rowIndex % 2 === 0 ? -1 : 1;
  const speed = 0.18 + (random() * 0.42);
  const amplitude = 1 + (random() * 4);
  const waveSpeed = 0.25 + (random() * 0.45);
  const blinkSpeed = 0.6 + (random() * 0.8);
  const phase = random() * Math.PI * 2;
  const mutationGap = 1.6 + (random() * 3.8);
  const text = buildRowText(rowIndex, columnCount, contentSeed);
  const backgroundRow = createRowElement(rowIndex, 'background');
  const logoRow = createRowElement(rowIndex, 'logo');
  const rowY = Math.round(rowIndex * rowHeight);

  backgroundRow.textContent = text;
  logoRow.textContent = text;
  backgroundRow.style.setProperty('--row-y', `${rowY}px`);
  logoRow.style.setProperty('--row-y', `${rowY}px`);

  return {
    rowIndex,
    text,
    contentSeed,
    backgroundRow,
    logoRow,
    baseShift,
    direction,
    speed,
    amplitude,
    waveSpeed,
    blinkSpeed,
    phase,
    mutationGap,
    nextMutationAt: mutationGap
  };
}

function rebuildRows(width, height) {
  const fontSize = Math.max(10, Math.min(22, Math.floor(width / 70)));
  const rowHeight = Math.max(10, Math.round(fontSize * 0.8));
  const rowCount = Math.max(22, Math.min(48, Math.ceil(height / rowHeight) + 8));
  const columnCount = Math.max(84, Math.round(width / Math.max(6, fontSize * 0.62)));
  const backgroundFragment = document.createDocumentFragment();
  const logoFragment = document.createDocumentFragment();

  state.rows = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowModel = createRowModel(rowIndex, rowHeight, columnCount);
    state.rows.push(rowModel);
    backgroundFragment.appendChild(rowModel.backgroundRow);
    logoFragment.appendChild(rowModel.logoRow);
  }

  backgroundLayer.replaceChildren(backgroundFragment);
  logoLayer.replaceChildren(logoFragment);

  viewport.style.setProperty('--terminal-font-size', `${fontSize}px`);
  viewport.style.setProperty('--terminal-row-height', `${rowHeight}px`);

  state.metrics = {
    width,
    height,
    fontSize,
    rowCount,
    columnCount,
    rowHeight
  };
}

function mutateRow(rowModel, elapsedSeconds) {
  rowModel.contentSeed += 97 + rowModel.rowIndex;
  rowModel.text = buildRowText(rowModel.rowIndex, state.metrics.columnCount, rowModel.contentSeed);
  rowModel.backgroundRow.textContent = rowModel.text;
  rowModel.logoRow.textContent = rowModel.text;
  rowModel.nextMutationAt = elapsedSeconds + rowModel.mutationGap;
}

function updateMotion(timestampMs) {
  const elapsedSeconds = timestampMs * 0.001;

  for (const rowModel of state.rows) {
    if (elapsedSeconds >= rowModel.nextMutationAt) {
      mutateRow(rowModel, elapsedSeconds);
    }

    const drift = elapsedSeconds * rowModel.speed * rowModel.direction;
    const wobble = Math.sin((elapsedSeconds * rowModel.waveSpeed) + rowModel.phase) * rowModel.amplitude;
    const offset = rowModel.baseShift + drift + wobble;
    const brightness = 0.54 + (Math.sin((elapsedSeconds * rowModel.blinkSpeed) + rowModel.phase) * 0.14);

    rowModel.backgroundRow.style.setProperty('--row-offset', `${offset}`);
    rowModel.logoRow.style.setProperty('--row-offset', `${offset * 0.92}`);
    rowModel.backgroundRow.style.opacity = `${Math.max(0.08, brightness * 0.42)}`;
    rowModel.logoRow.style.opacity = `${Math.max(0.36, brightness + 0.12)}`;
  }
}

function renderStaticFrame() {
  for (const rowModel of state.rows) {
    rowModel.backgroundRow.style.setProperty('--row-offset', `${rowModel.baseShift}`);
    rowModel.logoRow.style.setProperty('--row-offset', `${rowModel.baseShift * 0.92}`);
    rowModel.backgroundRow.style.opacity = '0.18';
    rowModel.logoRow.style.opacity = '0.72';
  }
}

function animate(timestampMs) {
  updateMotion(timestampMs);
  state.frameHandle = window.requestAnimationFrame(animate);
}

function scheduleProjectionUpdate() {
  window.cancelAnimationFrame(state.frameHandle);

  if (!viewport || !backgroundLayer || !logoLayer) {
    return;
  }

  const { width, height } = viewport.getBoundingClientRect();
  const widthChanged = Math.abs(width - state.metrics.width) > 8;
  const heightChanged = Math.abs(height - state.metrics.height) > 8;

  if (widthChanged || heightChanged || state.rows.length === 0) {
    rebuildRows(width, height);
  }

  if (REDUCED_MOTION_QUERY.matches) {
    renderStaticFrame();
    return;
  }

  state.frameHandle = window.requestAnimationFrame(animate);
}

function handleMotionPreferenceChange() {
  scheduleProjectionUpdate();
}

window.addEventListener('resize', scheduleProjectionUpdate);

if (typeof REDUCED_MOTION_QUERY.addEventListener === 'function') {
  REDUCED_MOTION_QUERY.addEventListener('change', handleMotionPreferenceChange);
} else if (typeof REDUCED_MOTION_QUERY.addListener === 'function') {
  REDUCED_MOTION_QUERY.addListener(handleMotionPreferenceChange);
}

scheduleProjectionUpdate();
