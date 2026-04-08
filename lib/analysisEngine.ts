// src/lib/analysisEngine.ts
import { generateGaussian } from "./stochasticEngine";

// --- CORE MATHEMATICAL FUNCTIONS ---

export function calculateSNR(signal: number[], noise: number[]): number {
  let signalPower = 0;
  let noisePower = 0;
  for (let i = 0; i < signal.length; i++) {
    signalPower += signal[i] * signal[i];
    noisePower += noise[i] * noise[i];
  }
  signalPower /= signal.length;
  noisePower /= noise.length;
  if (noisePower === 0) return 100; 
  return 10 * Math.log10(signalPower / noisePower);
}

export function calculateAutocorrelation(data: number[], maxLag: number = 30) {
  const result = [];
  const n = data.length;
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += data[i] * data[i + lag];
    }
    result.push({ lag: lag, value: sum / n });
  }
  return result;
}

export function calculatePSD(data: number[]) {
  const N = data.length;
  const psd = [];
  for (let k = 0; k < N / 2; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += data[n] * Math.cos(angle);
      imag -= data[n] * Math.sin(angle);
    }
    const power = (real * real + imag * imag) / N;
    psd.push({ frequency: k, power: Math.round(power * 100) / 100 });
  }
  return psd;
}

export function checkWSS(data: number[]): boolean {
  if (data.length < 10) return false;
  const half = Math.floor(data.length / 2);
  const p1 = data.slice(0, half);
  const p2 = data.slice(half);

  const mean1 = p1.reduce((a, b) => a + b, 0) / half;
  const mean2 = p2.reduce((a, b) => a + b, 0) / half;
  
  const var1 = p1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / half;
  const var2 = p2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / half;

  const meanDiff = Math.abs(mean1 - mean2);
  const varRatio = Math.max(var1, var2) / (Math.min(var1, var2) || 0.0001);

  return meanDiff < 1.5 && varRatio < 1.5;
}

export function applyLowPassFilter(data: number[], windowSize: number = 5): number[] {
  const filtered = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0, count = 0;
    for (let j = 0; j < windowSize; j++) {
      if (i - j >= 0) {
        sum += data[i - j];
        count++;
      }
    }
    filtered.push(sum / count);
  }
  return filtered;
}

// --- CSV PARSER & CUSTOM ENGINE ---

export function parseAnalysisCSV(csvText: string): number[] {
  const lines = csvText.split(/\r?\n/);
  const values: number[] = [];
  for (const line of lines) {
    const match = line.match(/-?\d+(\.\d+)?/);
    if (match) values.push(parseFloat(match[0]));
  }
  return values;
}

export function runCustomAnalysis(rawData: number[], filterWindow: number) {
  if (rawData.length === 0) return null;

  const filteredSignal = applyLowPassFilter(rawData, filterWindow);

  // Estimate noise by subtracting the filtered signal from the raw data
  const estimatedNoise = [];
  for (let i = 0; i < rawData.length; i++) {
    estimatedNoise.push(rawData[i] - filteredSignal[i]);
  }

  const estimatedSNR = calculateSNR(filteredSignal, estimatedNoise);
  const signalPeak = Math.max(...filteredSignal.map(Math.abs));
  const hypothesisDetected = signalPeak > 3.0; // Basic threshold

  const timeSeries = [];
  for (let t = 0; t < rawData.length; t++) {
    timeSeries.push({
      time: t,
      noisySignal: Math.round(rawData[t] * 100) / 100,
      filteredSignal: Math.round(filteredSignal[t] * 100) / 100,
    });
  }

  return {
    timeSeries,
    rawSNR: "Unknown",
    filteredSNR: Math.round(estimatedSNR * 100) / 100,
    improvement: "N/A",
    autocorrelation: calculateAutocorrelation(estimatedNoise, Math.min(30, Math.floor(rawData.length / 2))),
    psd: calculatePSD(estimatedNoise),
    isWSS: checkWSS(estimatedNoise),
    hypothesis: hypothesisDetected,
    moments: calculateMoments(estimatedNoise)
  };
}

// --- SIMULATION ENGINE ---

export function runSignalAnalysis(noiseLevel: number, filterWindow: number, isColoredNoise: boolean) {
  const numSamples = 200;
  const trueSignal = [];
  const noisySignal = [];
  const noiseOnly = [];

  let lastColoredVal = 0;
  for (let t = 0; t < numSamples; t++) {
    const clean = Math.sin(t * 0.1) * 10;
    let noise = generateGaussian(0, noiseLevel);
    
    if (isColoredNoise) {
      noise = 0.85 * lastColoredVal + noise * 0.5; 
      lastColoredVal = noise;
    }

    trueSignal.push(clean);
    noiseOnly.push(noise);
    noisySignal.push(clean + noise);
  }

  const filteredSignal = applyLowPassFilter(noisySignal, filterWindow);

  const residualNoise = [];
  for (let i = 0; i < numSamples; i++) {
    residualNoise.push(filteredSignal[i] - trueSignal[i]);
  }

  const rawSNR = calculateSNR(trueSignal, noiseOnly);
  const filteredSNR = calculateSNR(trueSignal, residualNoise);
  const signalPeak = Math.max(...filteredSignal.map(Math.abs));
  const hypothesisDetected = signalPeak > 3.0; 

  const timeSeries = [];
  for (let t = 0; t < numSamples; t++) {
    timeSeries.push({
      time: t,
      trueSignal: Math.round(trueSignal[t] * 100) / 100,
      noisySignal: Math.round(noisySignal[t] * 100) / 100,
      filteredSignal: Math.round(filteredSignal[t] * 100) / 100,
    });
  }

  return {
    timeSeries,
    rawSNR: Math.round(rawSNR * 100) / 100,
    filteredSNR: Math.round(filteredSNR * 100) / 100,
    improvement: Math.round((filteredSNR - rawSNR) * 100) / 100,
    autocorrelation: calculateAutocorrelation(noiseOnly, 30),
    psd: calculatePSD(noiseOnly),
    isWSS: checkWSS(noiseOnly),
    hypothesis: hypothesisDetected,
    moments: calculateMoments(residualNoise)
  };
}

// --- NEW: STATISTICAL MOMENTS & PROCESS IDENTIFICATION ---

export function calculateMoments(data: number[]) {
  const n = data.length;
  if (n === 0) return { skewness: 0, kurtosis: 0, process: "Unknown" };
  
  const mean = data.reduce((a, b) => a + b, 0) / n;
  let variance = 0, skewness = 0, kurtosis = 0;
  
  for (let i = 0; i < n; i++) {
    const dev = data[i] - mean;
    variance += dev * dev;
  }
  variance /= n;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return { skewness: 0, kurtosis: 0, process: "Deterministic" };

  for (let i = 0; i < n; i++) {
    const dev = data[i] - mean;
    skewness += Math.pow(dev, 3);
    kurtosis += Math.pow(dev, 4);
  }
  
  skewness = (skewness / n) / Math.pow(stdDev, 3);
  kurtosis = (kurtosis / n) / Math.pow(stdDev, 4);

  // A perfect Gaussian has Skewness = 0 and Kurtosis = 3.
  // If it deviates significantly, it might be Poisson, Markov, or heavily Colored.
// A perfect Gaussian has Skewness = 0 and Kurtosis = 3.
  const isGaussian = Math.abs(skewness) < 0.5 && Math.abs(kurtosis - 3) < 1.0;
  
  let processName = "Unknown";
  if (isGaussian) {
    processName = "Gaussian (Normal)";
  } else if (kurtosis > 4.5) {
    // High kurtosis (heavy tails/spikes) means impulsive events
    processName = "Poisson (Impulsive)";
  } else {
    // If it's not impulsive and not Gaussian, it's highly correlated
    processName = "Markov (Colored/Drift)";
  }

  return {
    skewness: Math.round(skewness * 100) / 100,
    kurtosis: Math.round(kurtosis * 100) / 100,
    process: processName
  };
}

export function runMatchedFilter(noisySignal: number[], template: number[]): number[] {
  const result = [];
  const n = noisySignal.length;
  const m = template.length;

  for (let i = 0; i < n - m; i++) {
    let sum = 0;
    for (let j = 0; j < m; j++) {
      // Cross-correlation multiplication
      sum += noisySignal[i + j] * template[j];
    }
    // Normalize slightly for chart rendering
    result.push(sum / (m / 2)); 
  }
  
  // Pad the end to keep array length consistent
  while (result.length < n) result.push(0);
  return result;
}

