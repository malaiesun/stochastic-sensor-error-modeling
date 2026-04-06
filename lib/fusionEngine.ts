// src/lib/fusionEngine.ts
import { generateGaussian } from "./stochasticEngine";

export interface FusionDataPoint {
  time: number;
  trueValue: number;
  sensorA: number;
  sensorB: number;
  fused: number;
}

/**
 * Simulates two noisy sensors observing the same true signal,
 * and fuses them using a variance-weighted average (Kalman logic).
 */
export function generateSensorFusion(
  trueSignal: number,
  stdDevA: number,
  stdDevB: number,
  numSamples: number = 100
): FusionDataPoint[] {
  const data: FusionDataPoint[] = [];
  
  for (let t = 0; t < numSamples; t++) {
    const zA = trueSignal + generateGaussian(0, stdDevA);
    const zB = trueSignal + generateGaussian(0, stdDevB);
    
    // The Math: Weight each sensor inversely proportional to its variance
    const varA = stdDevA * stdDevA;
    const varB = stdDevB * stdDevB;
    
    // If both variances are 0 (perfect sensors), just average them to avoid division by zero
    let fused = trueSignal;
    if (varA + varB > 0) {
      fused = (zA * varB + zB * varA) / (varA + varB);
    }
    
    data.push({
      time: t,
      trueValue: trueSignal,
      sensorA: Math.round(zA * 100) / 100,
      sensorB: Math.round(zB * 100) / 100,
      fused: Math.round(fused * 100) / 100,
    });
  }
  
  return data;
}