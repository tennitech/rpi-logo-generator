
// PulseWorklet - Custom AudioWorklet processor for generating true pulse waves
// This creates proper pulse waves with variable duty cycle control

class PulseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Initialize phase and parameters
    this.phase = 0;
    this.frequency = 440; // Default frequency
    this.pulseWidth = 0.5; // Default 50% duty cycle
    this.sampleRate = sampleRate;
    
    // Listen for parameter updates from main thread
    this.port.onmessage = (event) => {
      const { type, value } = event.data;
      
      switch (type) {
        case 'frequency':
          this.frequency = value;
          break;
        case 'pulseWidth':
          this.pulseWidth = Math.max(0.01, Math.min(0.99, value)); // Clamp between 1% and 99%
          break;
      }
    };
  }
  
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    if (output.length > 0) {
      const outputChannel = output[0];
      
      for (let i = 0; i < outputChannel.length; i++) {
        // Calculate current phase (0 to 1)
        const normalizedPhase = this.phase - Math.floor(this.phase);
        
        // Generate pulse wave: +1 when phase < pulseWidth, -1 otherwise
        const pulseValue = normalizedPhase < this.pulseWidth ? 1.0 : -1.0;
        
        outputChannel[i] = pulseValue;
        
        // Advance phase
        this.phase += this.frequency / this.sampleRate;
        
        // Wrap phase to prevent overflow
        if (this.phase >= 1.0) {
          this.phase -= Math.floor(this.phase);
        }
      }
    }
    
    return true; // Keep processor alive
  }
}

// Register the processor
registerProcessor('pulse-processor', PulseProcessor);
