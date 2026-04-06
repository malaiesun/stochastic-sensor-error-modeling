"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Cpu } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { generateSensorFusion, FusionDataPoint } from "@/lib/fusionEngine";

export default function SensorFusionSim() {
  const [trueSignal] = useState(50); // Kept constant for this sim, or add a slider if you want!
  const [stdDevA, setStdDevA] = useState(8);
  const [stdDevB, setStdDevB] = useState(4);
  const [numSamples] = useState(100);
  
  const [fusionData, setFusionData] = useState<FusionDataPoint[]>([]);

  const runSimulation = () => {
    setFusionData(generateSensorFusion(trueSignal, stdDevA, stdDevB, numSamples));
  };

  useEffect(() => { runSimulation(); }, [trueSignal, stdDevA, stdDevB, numSamples]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
              <Cpu className="w-5 h-5"/> Fusion Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Sensor A Noise (σ)</Label><span className="font-mono text-sm">{stdDevA}</span></div>
              <Slider value={[stdDevA]} onValueChange={(val) => setStdDevA(val[0])} max={20} step={0.5} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Sensor B Noise (σ)</Label><span className="font-mono text-sm">{stdDevB}</span></div>
              <Slider value={[stdDevB]} onValueChange={(val) => setStdDevB(val[0])} max={20} step={0.5} />
            </div>
            <Button onClick={runSimulation} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> Recalculate Fusion
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg">Kalman Variance-Weighted Fusion</CardTitle></CardHeader>
          <CardContent className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fusionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <Line type="monotone" dataKey="trueValue" stroke="#10b981" strokeWidth={3} dot={false} name="True Signal" />
                <Line type="monotone" dataKey="sensorA" stroke="#ef4444" strokeWidth={1} dot={false} name="Sensor A" opacity={0.5} />
                <Line type="monotone" dataKey="sensorB" stroke="#f59e0b" strokeWidth={1} dot={false} name="Sensor B" opacity={0.5} />
                <Line type="monotone" dataKey="fused" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Fused Output" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}