const { setTickerWidthRatioDisplayValue } = require('../js/utils/tickerDisplay');

describe('Ticker Width Ratio Display', () => {
  test('updates the display label text from slider value', () => {
    const slider = { value: '5' };
    const display = { textContent: '' };

    setTickerWidthRatioDisplayValue(slider, display);

    expect(display.textContent).toBe('1:5');
  });

  test('does nothing when elements are missing', () => {
    expect(() => setTickerWidthRatioDisplayValue(null, null)).not.toThrow();
  });
});
