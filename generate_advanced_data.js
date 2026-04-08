const fs = require('fs');

// 1. Gaussian Generator (Box-Muller)
function generateGaussian(mean = 0, stdev = 1) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

// 2. Poisson Generator (Knuth's Algorithm)
function getPoisson(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

const N = 300; 
let poissonProcess = [];
let markovProcess = []; // Colored Noise
let wienerProcess = []; // Brownian Drift

let lastMarkov = 0;
let lastWiener = 0;

for (let i = 0; i < N; i++) {
    let w = generateGaussian(0, 4);

    // 1. MARKOV PROCESS (Current state depends on previous state)
    lastMarkov = 0.85 * lastMarkov + w * 0.5;
    markovProcess.push(lastMarkov.toFixed(4));

    // 2. WIENER PROCESS (Cumulative integration of Gaussian steps)
    lastWiener = lastWiener + w * 0.3;
    wienerProcess.push(lastWiener.toFixed(4));

    // 3. POISSON PROCESS (Discrete random events/spikes)
    // We add a tiny bit of baseline Gaussian noise so it looks like a real sensor
    let poissonSpike = getPoisson(0.2) * 10; // Lambda = 0.2 events per interval
    let baselineNoise = generateGaussian(0, 0.5);
    poissonProcess.push((poissonSpike + baselineNoise).toFixed(4));
}

// Write arrays to actual CSV files
fs.writeFileSync('test_Markov_Colored.csv', markovProcess.join('\n'));
fs.writeFileSync('test_Wiener_Drift.csv', wienerProcess.join('\n'));
fs.writeFileSync('test_Poisson_Spikes.csv', poissonProcess.join('\n'));

console.log("✅ 3 Advanced Stochastic CSV files generated successfully!");