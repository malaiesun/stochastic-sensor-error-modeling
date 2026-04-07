// src/lib/lmsEngine.ts
import { generateGaussian } from "./stochasticEngine";

export interface LMSDataPoint {
  time: number;
  trueSignal: number;
  noisySignal: number;
  filteredSignal: number;
  error: number;
}

/**
 * Simulates an Adaptive Line Enhancer (ALE) using the Least Mean Squares (LMS) Algorithm.
 * The filter actively learns to extract a sine wave from heavy background noise.
 * * @param learningRate (mu) - How fast the filter adapts (too high = unstable)
 * @param noiseAmplitude - The severity of the AWGN
 * @param filterOrder - How many previous samples the filter remembers (its "brain size")
 * @param numSamples - Total time steps
 */
export function runLMSSimulation(
  learningRate: number = 0.01,
  noiseAmplitude: number = 1.0,
  filterOrder: number = 10,
  numSamples: number = 300
): LMSDataPoint[] {
  const data: LMSDataPoint[] = [];
  
  // Initialize the filter weights to zero (The filter knows nothing at t=0)
  const weights = new Array(filterOrder).fill(0);
  // Buffer to hold the recent history of inputs
  const inputBuffer = new Array(filterOrder).fill(0);

  for (let t = 0; t < numSamples; t++) {
    // 1. Generate the physical environment
    const trueSignal = Math.sin(t * 0.1) * 5; // A clean sine wave (e.g., AC voltage)
    const noise = generateGaussian(0, noiseAmplitude);
    const noisySignal = trueSignal + noise; // What the sensor actually reads

    // 2. Shift the new noisy reading into our delay buffer
    inputBuffer.unshift(noisySignal);
    inputBuffer.pop();

    // 3. FIR Filtering: Calculate the filter's current "guess"
    let filteredOutput = 0;
    for (let i = 0; i < filterOrder; i++) {
      filteredOutput += weights[i] * inputBuffer[i];
    }

    // 4. The LMS Learning Step: Calculate the error
    // In training mode, we compare against the desired true signal
    const error = trueSignal - filteredOutput;

    // 5. Weight Update: Adjust the filter's "brain" based on the error
    for (let i = 0; i < filterOrder; i++) {
      weights[i] = weights[i] + 2 * learningRate * error * inputBuffer[i];
    }

    data.push({
      time: t,
      trueSignal: Math.round(trueSignal * 100) / 100,
      noisySignal: Math.round(noisySignal * 100) / 100,
      filteredSignal: Math.round(filteredOutput * 100) / 100,
      error: Math.round(error * 100) / 100,
    });
  }

  return data;
}