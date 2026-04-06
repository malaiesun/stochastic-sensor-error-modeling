// src/lib/stochasticEngine.ts

export interface SensorDataPoint {
  time: number;
  trueValue: number;
  measuredValue: number;
  error: number;
}

export interface ProcessStats {
  meanError: number;
  variance: number;
  rmse: number;
}

/**
 * Generates a random number following a Normal (Gaussian) Distribution 
 * using the Box-Muller transform.
 */
export function generateGaussian(mean: number, stdDev: number): number {
  let u1 = Math.random();
  let u2 = Math.random();
  
  // Prevent log(0) which returns -Infinity
  if (u1 === 0) u1 = 1e-7; 

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  return z0 * stdDev + mean;
}

/**
 * Simulates a stochastic measurement process over time.
 * Model: Y = X + Bias + Gaussian Noise
 */
export function generateTimeSeries(
  trueSignal: number,
  bias: number,
  noiseStdDev: number,
  numSamples: number = 100
): SensorDataPoint[] {
  const data: SensorDataPoint[] = [];
  
  for (let t = 0; t < numSamples; t++) {
    const noise = generateGaussian(0, noiseStdDev);
    const measuredValue = trueSignal + bias + noise;
    
    data.push({
      time: t,
      trueValue: trueSignal,
      // Rounding to 2 decimal places for clean UI rendering later
      measuredValue: Math.round(measuredValue * 100) / 100,
      error: Math.round((bias + noise) * 100) / 100,
    });
  }
  
  return data;
}

/**
 * Calculates statistical metrics for the generated dataset.
 */
export function calculateStats(data: SensorDataPoint[]): ProcessStats {
  if (data.length === 0) return { meanError: 0, variance: 0, rmse: 0 };

  let sumError = 0;
  let sumSquaredError = 0;

  for (const point of data) {
    sumError += point.error;
    sumSquaredError += Math.pow(point.error, 2);
  }

  const meanError = sumError / data.length;
  
  // Variance: Average of squared differences from the Mean
  let sumSquaredDiffs = 0;
  for (const point of data) {
    sumSquaredDiffs += Math.pow(point.error - meanError, 2);
  }
  
  const variance = sumSquaredDiffs / data.length;
  const rmse = Math.sqrt(sumSquaredError / data.length);

  return {
    meanError: Math.round(meanError * 1000) / 1000,
    variance: Math.round(variance * 1000) / 1000,
    rmse: Math.round(rmse * 1000) / 1000,
  };
}