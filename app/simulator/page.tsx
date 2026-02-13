"use client";

import { useState } from "react";
import { generateSensorNoise } from "@/lib/stochastic/sensorNoise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SimulatorPage() {
  const [mean, setMean] = useState("0");
  const [std, setStd] = useState("1");
  const [samples, setSamples] = useState("200");
  const [data, setData] = useState<number[]>([]);

  const handleGenerate = () => {
    const noise = generateSensorNoise(
      Number(samples),
      Number(mean),
      Number(std)
    );
    setData(noise);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Gaussian Sensor Noise Simulator
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Mean (μ)
                </label>
                <input
                  type="number"
                  value={mean}
                  onChange={(e) => setMean(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Standard Deviation (σ)
                </label>
                <input
                  type="number"
                  value={std}
                  onChange={(e) => setStd(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Number of Samples (N)
                </label>
                <input
                  type="number"
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-background"
                />
              </div>

            </div>

            <div>
              <Button onClick={handleGenerate} className="w-full">
                Generate Noise
              </Button>
            </div>

            {/* Chart */}
            {data.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.map((value, index) => ({
                      index,
                      value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
