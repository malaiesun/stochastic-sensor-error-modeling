"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { generateGaussian } from "@/lib/stochasticEngine";

export default function DistributionSim() {
  const [distType, setDistType] = useState<"uniform" | "gaussian">("gaussian");
  const [sampleSize, setSampleSize] = useState(1000);
  const [binsCount, setBinsCount] = useState(30);

  // Generate and bin the data dynamically based on the slider/toggle state
  const histogramData = useMemo(() => {
    const rawData: number[] = [];
    
    // 1. Generate the raw data
    for (let i = 0; i < sampleSize; i++) {
      if (distType === "uniform") {
        // Uniform: Just raw Math.random() shifted to center around 0
        rawData.push((Math.random() - 0.5) * 10); 
      } else {
        // Gaussian: Uses your custom Box-Muller transform
        rawData.push(generateGaussian(0, 2)); 
      }
    }

    // 2. Bin the data for the histogram
    const min = -8; // Fixed bounds to keep the graph stable
    const max = 8;
    const binWidth = (max - min) / binsCount;

    const bins = Array.from({ length: binsCount }, (_, i) => ({
      binMid: (min + (i + 0.5) * binWidth).toFixed(1),
      count: 0,
    }));

    rawData.forEach((val) => {
      let binIndex = Math.floor((val - min) / binWidth);
      if (binIndex < 0) binIndex = 0;
      if (binIndex >= binsCount) binIndex = binsCount - 1;
      bins[binIndex].count += 1;
    });

    return bins;
  }, [distType, sampleSize, binsCount]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Controls Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-blue-400">Distribution Math</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <Label>Algorithm Type</Label>
              <Tabs value={distType} onValueChange={(v) => setDistType(v as "uniform" | "gaussian")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-neutral-950 border border-neutral-800">
                  <TabsTrigger value="uniform" className="data-[state=active]:bg-neutral-800">Uniform</TabsTrigger>
                  <TabsTrigger value="gaussian" className="data-[state=active]:bg-neutral-800">Gaussian</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-neutral-500 mt-2">
                {distType === "uniform" 
                  ? "Standard Math.random(). Every value is equally likely." 
                  : "Box-Muller Transform. Central values are highly likely."}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Sample Size (N)</Label>
                  <span className="font-mono text-sm text-blue-400">{sampleSize}</span>
                </div>
                <Slider value={[sampleSize]} onValueChange={(val) => setSampleSize(val[0])} min={100} max={10000} step={100} />
                <p className="text-xs text-neutral-500">Law of Large Numbers: Higher N = smoother distribution.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Histogram Bins</Label>
                  <span className="font-mono text-sm">{binsCount}</span>
                </div>
                <Slider value={[binsCount]} onValueChange={(val) => setBinsCount(val[0])} min={10} max={60} step={5} />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Visualization Column */}
      <div className="lg:col-span-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              Probability Density Function (PDF)
              <span className="text-sm font-normal text-neutral-500">
                {distType === "uniform" ? "Flat / Rectangular" : "Normal / Bell Curve"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="binMid" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#262626'}} 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} 
                />
                <ReferenceLine x="0.0" stroke="#10b981" strokeDasharray="3 3" />
                <Bar 
                  dataKey="count" 
                  fill={distType === "uniform" ? "#f59e0b" : "#3b82f6"} 
                  name="Frequency" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}