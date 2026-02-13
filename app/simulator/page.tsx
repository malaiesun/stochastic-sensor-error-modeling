"use client";

import { useState } from "react";
import { generateSensorNoise } from "@/lib/stochastic/sensorNoise";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SimulatorPage() {
  const [mean, setMean] = useState(0);
  const [std, setStd] = useState(1);
  const [samples, setSamples] = useState(100);
  const [data, setData] = useState<number[]>([]);

  const handleGenerate = () => {
    const noise = generateSensorNoise(samples, mean, std);
    setData(noise);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] p-4">
          <CardContent className="space-y-4">
            <h1 className="text-xl font-semibold">
              Sensor Noise Simulator
            </h1>

            <input
              type="number"
              value={mean}
              onChange={(e) => setMean(Number(e.target.value))}
              placeholder="Mean"
              className="w-full border p-2 rounded"
            />

            <input
              type="number"
              value={std}
              onChange={(e) => setStd(Number(e.target.value))}
              placeholder="Standard Deviation"
              className="w-full border p-2 rounded"
            />

            <input
              type="number"
              value={samples}
              onChange={(e) => setSamples(Number(e.target.value))}
              placeholder="Number of Samples"
              className="w-full border p-2 rounded"
            />

            <Button onClick={handleGenerate} className="w-full">
              Generate Noise
            </Button>

            {data.length > 0 && (
              <div className="text-sm mt-4 max-h-40 overflow-auto border p-2 rounded">
                {data.slice(0, 10).map((val, i) => (
                  <div key={i}>{val.toFixed(4)}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
