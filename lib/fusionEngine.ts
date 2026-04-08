// src/lib/fusionEngine.ts
import { generateGaussian } from "./stochasticEngine";

export interface FusionDataPoint {
  time: number;
  trueValue: number;
  sensorA: number;
  sensorB: number;
  fused: number;
}

// Simulates two noisy sensors observing the same true signal, and fuses them using a variance-weighted average (Kalman logic).

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


export function fuseCustomData(
  dataA: number[],
  dataB: number[],
  stdDevA: number,
  stdDevB: number
): FusionDataPoint[] {
  const results: FusionDataPoint[] = [];
  
  // The variance is the standard deviation squared
  const varA = stdDevA * stdDevA;
  const varB = stdDevB * stdDevB;
  
  // Stop when we reach the end of the shortest dataset
  const minLength = Math.min(dataA.length, dataB.length);

  for (let i = 0; i < minLength; i++) {
    const zA = dataA[i];
    const zB = dataB[i];
    
    let fused = zA; // Fallback
    if (varA + varB > 0) {
      // The core Kalman update logic: weight inversely by variance
      fused = (zA * varB + zB * varA) / (varA + varB);
    }
    
    results.push({
      time: i,
      trueValue: 0, // We don't know the true value for real data
      sensorA: Math.round(zA * 100) / 100,
      sensorB: Math.round(zB * 100) / 100,
      fused: Math.round(fused * 100) / 100,
    });
  }
  
  return results;
}

//CSV Parse
export function parseFusionCSV(csvText: string): number[] {
  const lines = csvText.split(/\r?\n/);
  const values: number[] = [];
  for (const line of lines) {
    const match = line.match(/-?\d+(\.\d+)?/);
    if (match) values.push(parseFloat(match[0]));
  }
  return values;
}