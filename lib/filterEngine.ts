// src/lib/filterEngine.ts

export interface FilteredDataPoint {
  time: number;
  raw: number;
  filtered: number;
}

/**
 * A standard 1D Kalman Filter implemented from scratch.
 * * @param rawData Array of noisy numerical measurements
 * @param Q Process Variance (How fast you expect the actual true signal to change)
 * @param R Measurement Variance (How much you trust the sensor - higher = more noisy)
 */
export function applyKalmanFilter(
  rawData: number[],
  Q: number = 1e-5, 
  R: number = 0.01
): FilteredDataPoint[] {
  const results: FilteredDataPoint[] = [];
  
  if (rawData.length === 0) return results;

  // Initial guesses
  let x_est = rawData[0]; // Estimated true value
  let P = 1.0;            // Estimated error covariance

  for (let i = 0; i < rawData.length; i++) {
    const measurement = rawData[i];

    // 1. Prediction Step
    const x_pred = x_est;     // We assume the signal hasn't changed much
    const P_pred = P + Q;     // Uncertainty grows slightly over time

    // 2. Update Step (The "Correction")
    const K = P_pred / (P_pred + R); // Kalman Gain: How much should we trust the new measurement?
    
    x_est = x_pred + K * (measurement - x_pred); // The new filtered estimate
    P = (1 - K) * P_pred;                        // Update the uncertainty

    results.push({
      time: i,
      raw: Math.round(measurement * 100) / 100,
      filtered: Math.round(x_est * 100) / 100,
    });
  }

  return results;
}

/**
 * Helper to parse a simple CSV string (assuming one value per line, or comma separated)
 */
export function parseCSV(csvText: string): number[] {
  const lines = csvText.split(/\r?\n/);
  const values: number[] = [];
  
  for (const line of lines) {
    // If it's a multi-column CSV, just grab the first number we find for this simple 1D test
    const match = line.match(/-?\d+(\.\d+)?/);
    if (match) {
      values.push(parseFloat(match[0]));
    }
  }
  return values;
}