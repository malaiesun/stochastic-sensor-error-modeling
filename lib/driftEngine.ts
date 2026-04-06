// src/lib/driftEngine.ts
import { generateGaussian, SensorDataPoint } from "./stochasticEngine";

/**
 * Simulates a sensor suffering from both High-Frequency White Noise 
 * AND Low-Frequency Random Walk (Drift).
 */
export function generateDriftSeries(
  trueSignal: number,
  whiteNoiseStdDev: number,
  driftStdDev: number, // The severity of the random walk
  numSamples: number = 200
): SensorDataPoint[] {
  const data: SensorDataPoint[] = [];
  
  let currentDrift = 0; // Starts with zero bias, but will wander over time

  for (let t = 0; t < numSamples; t++) {
    // 1. Calculate the Random Walk step for this moment in time
    const driftStep = generateGaussian(0, driftStdDev);
    currentDrift += driftStep; // Accumulate the drift

    // 2. Calculate the momentary White Noise
    const whiteNoise = generateGaussian(0, whiteNoiseStdDev);
    
    // 3. The final measurement combines the true signal, the wandering drift, and the jitter
    const measuredValue = trueSignal + currentDrift + whiteNoise;
    
    data.push({
      time: t,
      trueValue: trueSignal,
      measuredValue: Math.round(measuredValue * 100) / 100,
      // Error is now dynamic based on the drift
      error: Math.round((currentDrift + whiteNoise) * 100) / 100, 
    });
  }
  
  return data;
}