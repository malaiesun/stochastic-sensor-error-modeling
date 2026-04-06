"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";
import { generateTimeSeries, calculateStats, SensorDataPoint, ProcessStats } from "@/lib/stochasticEngine";

export default function SingleSensorSim() {
  const [trueSignal, setTrueSignal] = useState(50);
  const [noiseStdDev, setNoiseStdDev] = useState(5);
  const [bias, setBias] = useState(0);
  const [numSamples, setNumSamples] = useState(100);
  
  const [data, setData] = useState<SensorDataPoint[]>([]);
  const [stats, setStats] = useState<ProcessStats>({ meanError: 0, variance: 0, rmse: 0 });

  const runSimulation = () => {
    const newData = generateTimeSeries(trueSignal, bias, noiseStdDev, numSamples);
    setData(newData);
    setStats(calculateStats(newData));
  };

  useEffect(() => { runSimulation(); }, [trueSignal, noiseStdDev, bias, numSamples]);

  const histogramData = useMemo(() => {
    if (!data.length) return [];
    const errors = data.map((d) => d.error);
    const min = Math.min(...errors);
    const max = Math.max(...errors);
    const binCount = 20;
    const binWidth = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      binMid: (min + (i + 0.5) * binWidth).toFixed(1),
      count: 0,
    }));

    errors.forEach((err) => {
      let binIndex = Math.floor((err - min) / binWidth);
      if (binIndex >= binCount) binIndex = binCount - 1;
      bins[binIndex].count += 1;
    });
    return bins;
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-blue-400">Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>True Signal (X)</Label><span className="font-mono text-sm">{trueSignal}</span></div>
              <Slider value={[trueSignal]} onValueChange={(val) => setTrueSignal(val[0])} max={100} step={1} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Noise Std Dev (σ)</Label><span className="font-mono text-sm">{noiseStdDev}</span></div>
              <Slider value={[noiseStdDev]} onValueChange={(val) => setNoiseStdDev(val[0])} max={30} step={0.5} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Sensor Bias (β)</Label><span className="font-mono text-sm">{bias}</span></div>
              <Slider value={[bias]} onValueChange={(val) => setBias(val[0])} min={-20} max={20} step={1} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Sample Size (N)</Label><span className="font-mono text-sm">{numSamples}</span></div>
              <Slider value={[numSamples]} onValueChange={(val) => setNumSamples(val[0])} min={10} max={500} step={10} />
            </div>
            <Button onClick={runSimulation} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Process
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg text-emerald-400">Process Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-4 font-mono text-sm">
            <div className="flex justify-between border-b border-neutral-800 pb-2"><span className="text-neutral-400">Mean Error (μ):</span><span>{stats.meanError}</span></div>
            <div className="flex justify-between border-b border-neutral-800 pb-2"><span className="text-neutral-400">Variance (σ²):</span><span>{stats.variance}</span></div>
            <div className="flex justify-between"><span className="text-neutral-400">RMSE:</span><span className="text-rose-400">{stats.rmse}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg">Time Series: Signal + Noise</CardTitle></CardHeader>
          <CardContent className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <Line type="monotone" dataKey="trueValue" stroke="#10b981" strokeWidth={2} dot={false} name="True Signal" />
                <Line type="monotone" dataKey="measuredValue" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Measured (Noisy)" opacity={0.8} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg">Error Distribution (Probability Density)</CardTitle></CardHeader>
          <CardContent className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="binMid" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#262626'}} contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <ReferenceLine x="0.0" stroke="#10b981" strokeDasharray="3 3" />
                <Bar dataKey="count" fill="#6366f1" name="Frequency" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}