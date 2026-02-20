function mapDigitToHeightPercent(digit) {
  switch (digit) {
    case 0: return 0.1;
    case 1: return 0.2;
    case 2: return 0.3;
    case 3: return 0.4;
    case 4: return 0.5;
    case 5: return 0.6;
    case 6: return 0.7;
    case 7: return 0.8;
    case 8: return 0.9;
    case 9: return 1.0;
    default: return 0;
  }
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
    const t = type - 1.0;
    return saw + (square - saw) * t;
  }

  const t = type - 2.0;
  return square + (pulse - square) * t;
}

function createBarPatternSVG(config) {
  const {
    currentShader,
    barStartX,
    barY,
    exactBarWidth,
    barHeight,
    fgColor,
    textToBinary,
    parseNumericString,
    generateGridCircles,
    generateStaticPackedCircles,
    values
  } = config;

  let pattern = '';

  if (currentShader === 1) {
    const rulerRepeats = parseInt(values.rulerRepeats, 10);
    const rulerUnits = parseInt(values.rulerUnits, 10);
    const rulerTotalTicks = rulerRepeats * rulerUnits + 1;
    const rulerTickWidth = exactBarWidth / (2 * rulerTotalTicks - 1);
    const rulerTickSpacing = rulerTickWidth * 2;

    for (let i = 0; i < rulerTotalTicks; i++) {
      const tickX = barStartX + i * rulerTickSpacing;
      let tickHeight;

      if (i === 0 || i === rulerTotalTicks - 1 || i % rulerUnits === 0) {
        tickHeight = barHeight;
      } else {
        const positionInUnit = i % rulerUnits;
        if (rulerUnits === 10) {
          if (positionInUnit === 5) {
            tickHeight = barHeight * 0.75;
          } else if (positionInUnit % 2 === 0) {
            tickHeight = barHeight * 0.5;
          } else {
            tickHeight = barHeight * 0.25;
          }
        } else if (positionInUnit === Math.floor(rulerUnits / 2)) {
          tickHeight = barHeight * 0.75;
        } else {
          tickHeight = barHeight * 0.5;
        }
      }

      const tickY = barY + barHeight - tickHeight;
      pattern += `\n    <rect x="${tickX}" y="${tickY}" width="${rulerTickWidth}" height="${tickHeight}" fill="${fgColor}"/>`;
    }
    return pattern;
  }

  if (currentShader === 2) {
    const tickerRatio = parseInt(values.tickerRatio, 10);
    const tickerWidthRatio = parseInt(values.tickerWidthRatio, 10);
    const tickerBottomTicks = parseInt(values.tickerRepeats, 10);
    const tickerTopTicks = tickerBottomTicks * tickerRatio;
    const tickerHalfHeight = barHeight / 2;
    const tickerSpacing = exactBarWidth / tickerTopTicks;
    const tickerTopWidth = tickerSpacing / 2;
    const tickerBottomWidth = tickerTopWidth * tickerWidthRatio;

    for (let i = 0; i < tickerTopTicks; i++) {
      const x = barStartX + i * tickerSpacing;
      pattern += `\n    <rect x="${x}" y="${barY}" width="${tickerTopWidth}" height="${tickerHalfHeight}" fill="${fgColor}"/>`;
    }

    for (let i = 0; i < tickerBottomTicks; i++) {
      const topIndex = i * tickerRatio;
      const x = barStartX + topIndex * tickerSpacing;
      pattern += `\n    <rect x="${x}" y="${barY + tickerHalfHeight}" width="${tickerBottomWidth}" height="${tickerHalfHeight}" fill="${fgColor}"/>`;
    }
    return pattern;
  }

  if (currentShader === 3) {
    const binaryText = values.binaryText || 'RPI';
    const binaryDataArray = textToBinary(binaryText);
    if (binaryDataArray.length === 0) {
      return pattern;
    }

    const bitWidth = exactBarWidth / binaryDataArray.length;
    const rowHeight = barHeight / 3;

    for (let i = 0; i < binaryDataArray.length; i++) {
      const x = barStartX + i * bitWidth;
      if (binaryDataArray[i] === 1) {
        pattern += `\n    <rect x="${x}" y="${barY}" width="${bitWidth}" height="${rowHeight}" fill="${fgColor}"/>`;
        pattern += `\n    <rect x="${x}" y="${barY + rowHeight * 2}" width="${bitWidth}" height="${rowHeight}" fill="${fgColor}"/>`;
      } else {
        pattern += `\n    <rect x="${x}" y="${barY + rowHeight}" width="${bitWidth}" height="${rowHeight}" fill="${fgColor}"/>`;
      }
    }
    return pattern;
  }

  if (currentShader === 4) {
    const frequency = parseInt(values.waveformFrequency, 10);
    const waveType = parseFloat(values.waveformType);
    const speed = parseFloat(values.waveformSpeed);
    const time = parseFloat(values.timeSeconds || 0);

    const basePoints = Math.max(300, exactBarWidth * 3);
    const frequencyMultiplier = Math.max(1, frequency / 10);
    const points = Math.ceil(basePoints * frequencyMultiplier);

    let pathData = `M ${barStartX} ${barY + barHeight}`;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * exactBarWidth;
      const phase = ((x / exactBarWidth) * frequency) - (time * speed);
      const wave = generateWaveValue(phase, waveType);
      const y = barY + barHeight * (1.0 - Math.max(0, Math.min(1, wave)));
      pathData += ` L ${barStartX + x} ${y}`;
    }
    pathData += ` L ${barStartX + exactBarWidth} ${barY + barHeight} Z`;
    pattern += `\n    <path d="${pathData}" fill="${fgColor}"/>`;
    return pattern;
  }

  if (currentShader === 5) {
    const circlesMode = values.circlesMode || 'packing';
    const circlesFill = values.circlesFill || 'stroke';
    let circleData = [];

    if (circlesMode === 'grid') {
      circleData = generateGridCircles(
        exactBarWidth,
        barHeight,
        parseInt(values.circlesRows, 10),
        parseInt(values.circlesGridDensity, 10),
        parseInt(values.circlesSizeVariationY, 10),
        parseInt(values.circlesSizeVariationX, 10),
        parseInt(values.circlesGridOverlap, 10),
        values.circlesLayout
      );
    } else {
      circleData = generateStaticPackedCircles(
        exactBarWidth,
        barHeight,
        parseInt(values.circlesDensity, 10),
        parseInt(values.circlesSizeVariation, 10),
        parseInt(values.circlesOverlap, 10)
      );
    }

    for (let i = 0; i < circleData.length; i++) {
      const circle = circleData[i];
      if (circlesFill === 'fill') {
        pattern += `\n    <circle cx="${barStartX + circle.x}" cy="${barY + circle.y}" r="${circle.r}" fill="${fgColor}"/>`;
      } else {
        pattern += `\n    <circle cx="${barStartX + circle.x}" cy="${barY + circle.y}" r="${circle.r}" fill="none" stroke="${fgColor}" stroke-width="1"/>`;
      }
    }
    return pattern;
  }

  if (currentShader === 6) {
    const numericString = values.numericValue || '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
    const mode = values.numericMode || 'height';
    const digits = parseNumericString(numericString);
    if (digits.length === 0) {
      return pattern;
    }

    const digitWidth = exactBarWidth / digits.length;
    const horizontalGap = 1;
    const dotHeight = 1.5;

    if (mode === 'height') {
      for (let i = 0; i < digits.length; i++) {
        const digit = digits[i];
        if (digit === 10) {
          continue;
        }
        const x = barStartX + i * digitWidth;
        const digitBarHeight = barHeight * mapDigitToHeightPercent(digit);
        const barBottomY = barY + barHeight - digitBarHeight;
        pattern += `\n    <rect x="${x}" y="${barBottomY}" width="${digitWidth}" height="${digitBarHeight}" fill="${fgColor}"/>`;
      }
      return pattern;
    }

    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i];
      const x = barStartX + i * digitWidth;
      const dotWidth = digitWidth - horizontalGap;
      const dotX = x + horizontalGap / 2;

      if (digit === 10) {
        const dotY = barY + barHeight - dotHeight;
        pattern += `\n    <rect x="${dotX}" y="${dotY}" width="${dotWidth}" height="${dotHeight}" rx="${dotHeight / 2}" fill="${fgColor}"/>`;
        continue;
      }
      if (digit <= 0) {
        continue;
      }

      const availableHeight = barHeight - dotHeight;
      for (let dotIndex = 0; dotIndex < digit; dotIndex++) {
        let dotY;
        if (digit === 1) {
          dotY = barY + (barHeight - dotHeight) / 2;
        } else {
          const spacing = availableHeight / (digit - 1);
          dotY = barY + dotIndex * spacing;
        }
        pattern += `\n    <rect x="${dotX}" y="${dotY}" width="${dotWidth}" height="${dotHeight}" rx="${dotHeight / 2}" fill="${fgColor}"/>`;
      }
    }
    return pattern;
  }

  return pattern;
}

if (typeof window !== 'undefined') {
  window.createBarPatternSVG = createBarPatternSVG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createBarPatternSVG };
}
