// lib/stochastic/gaussian.ts

export function generateGaussian(mean: number, std: number): number {
  let u1 = 0;
  let u2 = 0;

  // Avoid zero
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 =
    Math.sqrt(-2.0 * Math.log(u1)) *
    Math.cos(2.0 * Math.PI * u2);

  return z0 * std + mean;
}
