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
    textToMorse,
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

  if (currentShader === 8) {
    const text = values.matrixText || 'RPI';
    const rows = parseInt(values.matrixRows || 3, 10);
    const gap = parseInt(values.matrixGap || 1, 10);
    const binaryDataArray = textToBinary(text);

    if (binaryDataArray.length > 0) {
      const totalGapHeight = Math.max(0, rows - 1) * gap;
      const squareSize = Math.max(1, (barHeight - totalGapHeight) / rows);
      const columns = Math.floor((exactBarWidth + gap) / (squareSize + gap));
      const totalMatrixWidth = columns * squareSize + Math.max(0, columns - 1) * gap;
      const startXOffset = barStartX + (exactBarWidth - totalMatrixWidth) / 2;

      let bitIndex = 0;
      for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
          const x = startXOffset + c * (squareSize + gap);
          const y = barY + r * (squareSize + gap);
          const bit = binaryDataArray[bitIndex % binaryDataArray.length];
          bitIndex++;

          if (bit === 1) {
            pattern += `\n    <rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${fgColor}"/>`;
          } else {
            pattern += `\n    <rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="none" stroke="${fgColor}" stroke-width="0.5"/>`;
          }
        }
      }
    }
    return pattern;
  }

  if (currentShader === 7) {
    const text = values.morseText || 'RPI';
    const validMorseData = typeof textToMorse !== 'undefined' ? textToMorse(text) : [];

    if (validMorseData.length > 0) {
      const bitWidth = exactBarWidth / validMorseData.length;

      let currentRunLength = 0;
      let runStartX = 0;

      for (let i = 0; i < validMorseData.length; i++) {
        if (validMorseData[i] === 1) {
          if (currentRunLength === 0) {
            runStartX = barStartX + i * bitWidth;
          }
          currentRunLength++;
        } else {
          if (currentRunLength > 0) {
            pattern += `\n    <rect x="${runStartX}" y="${barY}" width="${currentRunLength * bitWidth}" height="${barHeight}" fill="${fgColor}"/>`;
            currentRunLength = 0;
          }
        }
      }
      if (currentRunLength > 0) {
        pattern += `\n    <rect x="${runStartX}" y="${barY}" width="${currentRunLength * bitWidth}" height="${barHeight}" fill="${fgColor}"/>`;
      }
    }
    return pattern;
  }

  if (currentShader === 9) {
    const segments = parseInt(values.trussSegments || 15, 10);
    const thickness = parseFloat(values.trussThickness || 2);

    const halfThick = thickness / 2;
    const cw = exactBarWidth - thickness;
    const ch = barHeight - thickness;
    const segmentWidth = exactBarWidth / segments;

    pattern += `\n    <rect x="${barStartX + halfThick}" y="${barY + halfThick}" width="${cw}" height="${ch}" fill="none" stroke="${fgColor}" stroke-width="${thickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;

    let pathData = '';
    for (let i = 0; i < segments; i++) {
      const x1 = barStartX + i * segmentWidth;
      const x2 = barStartX + (i + 1) * segmentWidth;

      if (i > 0) {
        pathData += ` M ${x1} ${barY + halfThick} L ${x1} ${barY + barHeight - halfThick}`;
      }
      pathData += ` M ${x1} ${barY + halfThick} L ${x2} ${barY + barHeight - halfThick}`;
      pathData += ` M ${x1} ${barY + barHeight - halfThick} L ${x2} ${barY + halfThick}`;
    }

    if (pathData) {
      pattern += `\n    <path d="${pathData}" fill="none" stroke="${fgColor}" stroke-width="${thickness}" stroke-linecap="square" stroke-linejoin="miter"/>`;
    }

    return pattern;
  }

  if (currentShader === 10) {
    const thickness = parseFloat(values.staffThickness || 1);
    const notesData = values.staffNotes || [];

    const lineThickness = Math.max(0.5, thickness * 0.5);
    const staffTop = barY + barHeight * 0.2;
    const staffBottom = barY + barHeight * 0.8;
    const lineSpacing = (staffBottom - staffTop) / 4;
    const step = lineSpacing / 2;

    for (let i = 0; i < 5; i++) {
      const y = staffTop + i * lineSpacing;
      pattern += `\n    <line x1="${barStartX}" y1="${y}" x2="${barStartX + exactBarWidth}" y2="${y}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
    }

    // Draw measure bar lines
    for (let m = 0; m <= 4; m++) {
      const x = barStartX + exactBarWidth * (m / 4.0);
      pattern += `\n    <line x1="${Math.min(x, barStartX + exactBarWidth)}" y1="${staffTop}" x2="${Math.min(x, barStartX + exactBarWidth)}" y2="${staffBottom}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
    }

    if (notesData && notesData.length > 0) {
      const STAFF_POSITIONS = {
        'C4': 6, 'C#4': 6, 'D4': 5, 'D#4': 5,
        'E4': 4, 'F4': 3, 'F#4': 3, 'G4': 2, 'G#4': 2,
        'A4': 1, 'A#4': 1, 'B4': 0, 'C5': -1
      };

      let cumulativeBeats = 0;
      const headRadiusWidth = lineSpacing * 0.7; // slightly oval
      const headRadiusHeight = lineSpacing * 0.5;

      for (let i = 0; i < notesData.length; i++) {
        const note = notesData[i];

        // Note X position
        const noteX = barStartX + exactBarWidth * ((cumulativeBeats + note.duration / 2) / 16.0);

        const pos = STAFF_POSITIONS[note.note] || 0;
        const isSharp = note.note.includes('#');
        const noteY = staffTop + 2 * lineSpacing + pos * step;
        const stemUp = pos > 0;

        // Ledger lines
        if (pos === 6) { // C4
          pattern += `\n    <line x1="${noteX - headRadiusWidth}" y1="${noteY}" x2="${noteX + headRadiusWidth}" y2="${noteY}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
        }

        // Sharp symbol
        if (isSharp) {
          const shiftX = headRadiusWidth * 1.5;
          const shiftY = step * 0.5;
          pattern += `\n    <line x1="${noteX - shiftX - 2}" y1="${noteY - shiftY}" x2="${noteX - shiftX - 2}" y2="${noteY + shiftY}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
          pattern += `\n    <line x1="${noteX - shiftX + 2}" y1="${noteY - shiftY}" x2="${noteX - shiftX + 2}" y2="${noteY + shiftY}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
          pattern += `\n    <line x1="${noteX - shiftX - 3}" y1="${noteY + 1}" x2="${noteX - shiftX + 3}" y2="${noteY - 1}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
        }

        // Note Head
        if (note.duration >= 2) {
          // Half or Whole note (hollow)
          pattern += `\n    <ellipse cx="${noteX}" cy="${noteY}" rx="${headRadiusWidth}" ry="${headRadiusHeight}" fill="none" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
        } else {
          // Filled note
          pattern += `\n    <ellipse cx="${noteX}" cy="${noteY}" rx="${headRadiusWidth}" ry="${headRadiusHeight}" fill="${fgColor}"/>`;
        }

        // Stem and Flags
        if (note.duration < 4) {
          const stemLength = lineSpacing * 2.5;
          const stemX = stemUp ? noteX + headRadiusWidth * 0.8 : noteX - headRadiusWidth * 0.8;
          const stemEndY = stemUp ? noteY - stemLength : noteY + stemLength;

          pattern += `\n    <line x1="${stemX}" y1="${noteY}" x2="${stemX}" y2="${stemEndY}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;

          if (note.duration <= 0.5) {
            let numFlags = 1;
            if (note.duration === 0.25) numFlags = 2; // 16th
            if (note.duration === 0.125) numFlags = 3; // 32nd

            for (let f = 0; f < numFlags; f++) {
              const flagStartY = stemUp ? stemEndY + f * (lineSpacing * 0.3) : stemEndY - f * (lineSpacing * 0.3);
              const flagEndY = stemUp ? flagStartY + lineSpacing * 0.6 : flagStartY - lineSpacing * 0.6;
              const flagEndX = stemX + lineSpacing * 0.8;
              pattern += `\n    <line x1="${stemX}" y1="${flagStartY}" x2="${flagEndX}" y2="${flagEndY}" stroke="${fgColor}" stroke-width="${lineThickness}"/>`;
            }
          }
        }

        cumulativeBeats += note.duration;
        if (cumulativeBeats >= 16) break;
      }
    }
    return pattern;
  }

  if (currentShader === 11) {
    const text = values.pulseText || 'RPI';
    const intensity = parseFloat(values.pulseIntensity || 5) / 10.0;

    const centerY = barY + barHeight / 2;
    pattern += `\n    <rect x="${barStartX}" y="${centerY - 0.5}" width="${exactBarWidth}" height="1" fill="${fgColor}"/>`;

    if (text.length > 0) {
      const spacing = exactBarWidth / text.length;
      const pulseWidth = Math.max(1, spacing * 0.5);

      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const normalizedHeight = 0.1 + ((charCode % 15) / 14.0) * 0.9;
        const h = barHeight * normalizedHeight * intensity;

        const x = barStartX + i * spacing + (spacing - pulseWidth) / 2;
        const y = centerY - h / 2;

        pattern += `\n    <rect x="${x}" y="${y}" width="${pulseWidth}" height="${h}" fill="${fgColor}"/>`;
      }
    }
    return pattern;
  }

  if (currentShader === 12) {
    const text = values.graphText || 'RPI';
    const scaleMax = parseInt(values.graphScale || 10) / 10.0;

    if (text.length > 0) {
      const spacing = exactBarWidth / text.length;

      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const normalizedHeight = 0.1 + ((charCode % 15) / 14.0) * 0.9;
        const h = barHeight * normalizedHeight * scaleMax;

        const x1 = barStartX + i * spacing;
        const x2 = barStartX + (i + 1) * spacing;
        const yBase = barY + barHeight;
        const yTop = yBase - h;

        const pathData = `M ${x1} ${yBase} L ${x2} ${yBase} L ${x1} ${yTop} Z`;
        pattern += `\n    <path d="${pathData}" fill="${fgColor}"/>`;
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
