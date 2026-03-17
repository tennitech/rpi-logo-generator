(function (global) {
  const MUSIC_STAFF_POSITIONS = {
    'C4': 6, 'C#4': 6, 'D4': 5, 'D#4': 5,
    'E4': 4, 'F4': 3, 'F#4': 3, 'G4': 2, 'G#4': 2,
    'A4': 1, 'A#4': 1, 'B4': 0, 'C5': -1
  };

  const MUSIC_NOTE_SHAPES = new Set(['circle', 'square', 'diamond', 'triangle']);

  function normalizeMusicNoteShape(shape) {
    return MUSIC_NOTE_SHAPES.has(shape) ? shape : 'circle';
  }

  function getMusicHeadMetrics(lineSpacing, shape) {
    const normalizedShape = normalizeMusicNoteShape(shape);
    const unit = lineSpacing * 0.94;
    let rx = unit;
    let ry = unit;
    let stemOffsetX = unit * 0.86;
    let stemStartYOffset = 0;

    switch (normalizedShape) {
      case 'square':
        rx = unit * 0.88;
        ry = unit * 0.88;
        stemOffsetX = rx;
        break;
      case 'diamond':
        rx = unit * 1.02;
        ry = unit * 0.98;
        stemOffsetX = rx * 0.62;
        break;
      case 'triangle':
        rx = unit * 1.04;
        ry = unit * 0.94;
        stemOffsetX = rx * 0.68;
        stemStartYOffset = ry * 0.08;
        break;
      case 'circle':
      default:
        rx = unit;
        ry = unit;
        stemOffsetX = rx * 0.86;
        break;
    }

    return {
      shape: normalizedShape,
      rx,
      ry,
      ledgerHalfWidth: Math.max(rx, ry) * 1.15,
      accidentalShiftX: Math.max(rx, ry) * 1.5,
      stemOffsetX,
      stemStartYOffset
    };
  }

  function buildMusicBarRenderData(notesData, options) {
    const safeNotes = Array.isArray(notesData) ? notesData : [];
    const barStartX = options.barStartX;
    const exactBarWidth = options.exactBarWidth;
    const rectTop = options.rectTop || 0;
    const rectHeight = options.rectHeight;
    const thickness = parseFloat(options.thickness || 1);
    const noteShape = normalizeMusicNoteShape(options.noteShape);

    const staffTop = rectTop + rectHeight * 0.2;
    const staffBottom = rectTop + rectHeight * 0.8;
    const lineSpacing = (staffBottom - staffTop) / 4;
    const step = lineSpacing / 2;
    const headMetrics = getMusicHeadMetrics(lineSpacing, noteShape);
    const { rx, ry } = headMetrics;
    const lineThickness = Math.max(0.5, thickness * 0.5);

    const staffLines = [];
    for (let i = 0; i < 5; i++) {
      const y = staffTop + i * lineSpacing;
      staffLines.push({ x1: barStartX, y1: y, x2: barStartX + exactBarWidth, y2: y });
    }

    const barLines = [];
    for (let m = 0; m <= 4; m++) {
      const x = barStartX + exactBarWidth * (m / 4.0);
      const clampedX = Math.min(x, barStartX + exactBarWidth);
      barLines.push({ x1: clampedX, y1: staffTop, x2: clampedX, y2: staffBottom });
    }

    const notes = [];
    let cumulativeBeats = 0;
    for (let i = 0; i < safeNotes.length; i++) {
      const note = safeNotes[i];
      const pos = MUSIC_STAFF_POSITIONS[note.note] || 0;
      const noteX = barStartX + exactBarWidth * ((cumulativeBeats + note.duration / 2) / 16.0);
      const noteY = staffTop + 2 * lineSpacing + pos * step;
      const stemUp = pos > 0;
      const headFill = note.duration < 2;
      const ledgerLines = [];
      const accidentalLines = [];
      const flags = [];

      if (pos === 6) {
        ledgerLines.push({ x1: noteX - headMetrics.ledgerHalfWidth, y1: noteY, x2: noteX + headMetrics.ledgerHalfWidth, y2: noteY });
      }

      if (note.note.includes('#')) {
        const shiftX = headMetrics.accidentalShiftX;
        const shiftY = step * 0.5;
        accidentalLines.push({ x1: noteX - shiftX - 2, y1: noteY - shiftY, x2: noteX - shiftX - 2, y2: noteY + shiftY });
        accidentalLines.push({ x1: noteX - shiftX + 2, y1: noteY - shiftY, x2: noteX - shiftX + 2, y2: noteY + shiftY });
        accidentalLines.push({ x1: noteX - shiftX - 3, y1: noteY + 1, x2: noteX - shiftX + 3, y2: noteY - 1 });
      }

      let stem = null;
      if (note.duration < 4) {
        const stemLength = lineSpacing * 2.5;
        const stemX = stemUp ? noteX + headMetrics.stemOffsetX : noteX - headMetrics.stemOffsetX;
        const stemStartY = noteY + headMetrics.stemStartYOffset;
        const stemEndY = stemUp ? noteY - stemLength : noteY + stemLength;
        stem = { x1: stemX, y1: stemStartY, x2: stemX, y2: stemEndY };

        if (note.duration <= 0.5) {
          let numFlags = 1;
          if (note.duration === 0.25) numFlags = 2;
          if (note.duration === 0.125) numFlags = 3;

          for (let f = 0; f < numFlags; f++) {
            const flagStartY = stemUp ? stemEndY + f * (lineSpacing * 0.3) : stemEndY - f * (lineSpacing * 0.3);
            const flagEndY = stemUp ? flagStartY + lineSpacing * 0.6 : flagStartY - lineSpacing * 0.6;
            const flagEndX = stemX + lineSpacing * 0.8;
            flags.push({ x1: stemX, y1: flagStartY, x2: flagEndX, y2: flagEndY });
          }
        }
      }

      notes.push({
        note,
        pos,
        noteX,
        noteY,
        rx,
        ry,
        stemUp,
        headFill,
        noteShape,
        headMetrics,
        ledgerLines,
        accidentalLines,
        stem,
        flags
      });

      cumulativeBeats += note.duration;
      if (cumulativeBeats >= 16) break;
    }

    return {
      lineThickness,
      staffTop,
      staffBottom,
      lineSpacing,
      staffLines,
      barLines,
      notes
    };
  }

  global.MUSIC_STAFF_POSITIONS = MUSIC_STAFF_POSITIONS;
  global.normalizeMusicNoteShape = normalizeMusicNoteShape;
  global.getMusicHeadMetrics = getMusicHeadMetrics;
  global.buildMusicBarRenderData = buildMusicBarRenderData;
})(window);
