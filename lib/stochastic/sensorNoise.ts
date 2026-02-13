import { generateGaussian } from "./gaussian";

export function generateSensorNoise(
  samples: number,
  mean: number,
  std: number
): number[] {
  const data: number[] = [];

  for (let i = 0; i < samples; i++) {
    data.push(generateGaussian(mean, std));
  }

  return data;
}
