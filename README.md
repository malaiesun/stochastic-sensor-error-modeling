# Stochastic Measurement & Sensor Fusion Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styled-38B2AC?logo=tailwind-css)

An interactive web application designed to simulate, visualize, and filter stochastic sensor noise. Built for real-time demonstration of advanced ECE statistical processes, this dashboard models Additive White Gaussian Noise (AWGN), cumulative Brownian drift, and implements 1D Kalman filtering to recover true signals from corrupted data.

## 🎯 Project Objective

In electrical and computer engineering, developing robust filters requires a deep mathematical understanding of the noise itself. This project serves as both a **"laboratory"** to synthesize mathematical noise profiles and a **"tool"** to filter them. 

**Academic Constraint Satisfied:** To demonstrate a fundamental understanding of probability and random processes, **no external math or statistical libraries (e.g., numpy, scipy) were used**. All stochastic engines, probability density functions, and Kalman algorithms were written entirely from scratch in pure TypeScript.

---

## 🛠️ Core Modules & Mathematical Implementations

### 1. Basic Gaussian Noise (AWGN) Simulation
Simulates the effect of high-frequency jitter and systematic bias on sensor readings.
* **Math Engine:** Implements the **Box-Muller Transform** from scratch to convert uniform JavaScript randomness into a true Normal/Gaussian distribution `N(μ, σ²)`.
* **Visualization:** Plots a real-time time-series measurement against the true signal, alongside a dynamic Probability Density Function (PDF) histogram to visually prove the Bell Curve distribution.

### 2. Sensor Fusion (Variance-Weighted Average)
Demonstrates how multiple cheap, noisy sensors can be mathematically combined to produce a highly accurate reading.
* **Math Engine:** Applies the core update-logic of a Kalman filter. It calculates the inverse-variance weighted average of two independent Gaussian sources, dynamically shifting trust to the more reliable sensor.

### 3. Real Data 1D Kalman Filter
Applies theoretical stochastic models to real-world data via CSV upload.
* **Math Engine:** A complete 1D Kalman Filter built in TypeScript. It utilizes sequential Prediction and Update steps, calculating the Kalman Gain (`K`) at each interval to balance Process Uncertainty (`Q`) against Measurement Uncertainty (`R`).

### 4. Random Walk (Brownian Drift)
Models the cumulative stochastic error that plagues real-world IMUs (accelerometers and gyroscopes) over time.
* **Math Engine:** Instead of zero-mean white noise, this engine maintains a cumulative sum of Gaussian steps, resulting in a low-frequency drift where the sensor's baseline wanders unpredictably from the true signal.

---

## 💻 Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript (Strict typing for robust mathematical models)
* **Styling:** Tailwind CSS & Shadcn UI (Dark mode optimized)
* **Data Visualization:** Recharts (React-based charting library)

---

## 🚀 Getting Started

To run this simulation environment locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/stochastic-dashboard.git](https://github.com/yourusername/stochastic-dashboard.git)
   cd stochastic-dashboard