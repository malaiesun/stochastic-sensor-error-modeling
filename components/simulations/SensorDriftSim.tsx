"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Waves } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { generateDriftSeries } from "@/lib/driftEngine";
import { SensorDataPoint } from "@/lib/stochasticEngine";

export default function SensorDriftSim() {
  const [trueSignal, setTrueSignal] = useState(50);
  const [whiteNoise, setWhiteNoise] = useState(2);
  const [driftSeverity, setDriftSeverity] = useState(0.5);
  const [numSamples, setNumSamples] = useState(200);
  
  const [data, setData] = useState<SensorDataPoint[]>([]);

  const runSimulation = () => {
    setData(generateDriftSeries(trueSignal, whiteNoise, driftSeverity, numSamples));
  };

  useEffect(() => { runSimulation(); }, [trueSignal, whiteNoise, driftSeverity, numSamples]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-rose-400 flex items-center gap-2">
              <Waves className="w-5 h-5"/> Drift Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>White Noise (Jitter)</Label><span className="font-mono text-sm">{whiteNoise}</span></div>
              <Slider value={[whiteNoise]} onValueChange={(val) => setWhiteNoise(val[0])} max={10} step={0.5} />
            </div>
            
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex justify-between"><Label className="text-rose-400">Random Walk (Drift)</Label><span className="font-mono text-sm text-rose-400">{driftSeverity}</span></div>
              <Slider value={[driftSeverity]} onValueChange={(val) => setDriftSeverity(val[0])} max={2} step={0.1} />
              <p className="text-xs text-neutral-500 leading-tight">Controls the cumulative standard deviation per time step.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex justify-between"><Label>Time Horizon</Label><span className="font-mono text-sm">{numSamples}</span></div>
              <Slider value={[numSamples]} onValueChange={(val) => setNumSamples(val[0])} min={50} max={500} step={50} />
            </div>

            <Button onClick={runSimulation} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> Resimulate Drift
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg">Random Walk: Cumulative Stochastic Error</CardTitle></CardHeader>
          <CardContent className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <Line type="monotone" dataKey="trueValue" stroke="#10b981" strokeWidth={3} dot={false} name="True Signal" />
                <Line type="monotone" dataKey="measuredValue" stroke="#fb7185" strokeWidth={1.5} dot={false} name="Drifting Sensor" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}