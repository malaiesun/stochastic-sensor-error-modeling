const fs = require('fs');

// The Box-Muller Transform for pure Gaussian Math
function generateGaussian(mean = 0, stdev = 1) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

const N = 300; // 300 data points is perfect for FFT and Kalman smoothing
let whiteNoise = [];
let coloredNoise = [];
let brownianDrift = [];
let hiddenSignal = [];

let lastColored = 0;
let lastDrift = 0;

for (let i = 0; i < N; i++) {
    // 1. Pure White Gaussian Noise (AWGN)
    let w = generateGaussian(0, 4);
    whiteNoise.push(w.toFixed(4));

    // 2. Colored (Red) Noise - Low frequencies dominate
    lastColored = 0.85 * lastColored + w * 0.5;
    coloredNoise.push(lastColored.toFixed(4));

    // 3. Brownian Drift (Random Walk) - Cumulative errors
    lastDrift = lastDrift + w * 0.3;
    brownianDrift.push(lastDrift.toFixed(4));

    // 4. Hidden Signal - A sine wave buried in loud static
    let trueSignal = Math.sin(i * 0.1) * 8; 
    hiddenSignal.push((trueSignal + w).toFixed(4));
}

// Write arrays to actual CSV files
fs.writeFileSync('test_1_AWGN.csv', whiteNoise.join('\n'));
fs.writeFileSync('test_2_Colored.csv', coloredNoise.join('\n'));
fs.writeFileSync('test_3_Drift.csv', brownianDrift.join('\n'));
fs.writeFileSync('test_4_HiddenPulse.csv', hiddenSignal.join('\n'));

console.log("✅ 4 Mathematical CSV test files generated successfully!");