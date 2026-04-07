"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, BrainCircuit } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { runLMSSimulation, LMSDataPoint } from "@/lib/lmsEngine";

export default function AdaptiveFilterSim() {
  const [learningRate, setLearningRate] = useState(0.005);
  const [noiseAmp, setNoiseAmp] = useState(2.0);
  const [filterOrder, setFilterOrder] = useState(15);
  
  const [data, setData] = useState<LMSDataPoint[]>([]);

  const runSimulation = () => {
    setData(runLMSSimulation(learningRate, noiseAmp, filterOrder, 300));
  };

  // Re-run whenever parameters change
  useEffect(() => { 
    runSimulation(); 
  }, [learningRate, noiseAmp, filterOrder]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Controls Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5"/> LMS Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-cyan-400">Learning Rate (μ)</Label>
                <span className="font-mono text-sm">{learningRate.toFixed(4)}</span>
              </div>
              <Slider value={[learningRate]} onValueChange={(val) => setLearningRate(val[0])} min={0.0001} max={0.02} step={0.0005} />
              <p className="text-xs text-neutral-500 leading-tight">High μ learns faster, but risks mathematical divergence (explosion).</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex justify-between">
                <Label>AWGN Intensity</Label>
                <span className="font-mono text-sm">{noiseAmp.toFixed(1)}</span>
              </div>
              <Slider value={[noiseAmp]} onValueChange={(val) => setNoiseAmp(val[0])} min={0.5} max={10} step={0.5} />
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex justify-between">
                <Label>Filter Order (N)</Label>
                <span className="font-mono text-sm">{filterOrder}</span>
              </div>
              <Slider value={[filterOrder]} onValueChange={(val) => setFilterOrder(val[0])} min={2} max={30} step={1} />
              <p className="text-xs text-neutral-500 leading-tight">The "memory" of the filter. Higher order tracks complex signals better.</p>
            </div>

            <Button onClick={runSimulation} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset Weights (Restart)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Chart Column */}
      <div className="lg:col-span-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg">Adaptive Signal Tracking (Machine Learning DSP)</CardTitle>
          </CardHeader>
          <CardContent className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                
                {/* Layer 1: The chaotic noise */}
                <Line type="monotone" dataKey="noisySignal" stroke="#ef4444" strokeWidth={1} dot={false} name="Raw Sensor (Noisy)" opacity={0.3} />
                
                {/* Layer 2: The hidden truth */}
                <Line type="monotone" dataKey="trueSignal" stroke="#888888" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Hidden True Signal" />
                
                {/* Layer 3: The Filter actively learning */}
                <Line type="monotone" dataKey="filteredSignal" stroke="#06b6d4" strokeWidth={3} dot={false} name="LMS Filter Output" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}