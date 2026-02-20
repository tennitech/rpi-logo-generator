function setTickerWidthRatioDisplayValue(sliderElement, displayElement) {
  if (!sliderElement || !displayElement) {
    return;
  }

  const sliderValue = parseInt(sliderElement.value, 10);
  displayElement.textContent = `1:${sliderValue}`;
}

if (typeof window !== 'undefined') {
  window.setTickerWidthRatioDisplayValue = setTickerWidthRatioDisplayValue;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setTickerWidthRatioDisplayValue };
}
