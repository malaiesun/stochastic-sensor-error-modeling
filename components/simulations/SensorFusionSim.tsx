"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, Cpu, Upload, Database } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { generateSensorFusion, fuseCustomData, parseFusionCSV, FusionDataPoint } from "@/lib/fusionEngine";

export default function SensorFusionSim() {
  // Mode State: "simulated" or "csv"
  const [mode, setMode] = useState<"simulated" | "csv">("simulated");

  // Filter Trust Parameters (Used by BOTH modes)
  const [stdDevA, setStdDevA] = useState(8);
  const [stdDevB, setStdDevB] = useState(4);
  
  // Simulated Mode Data
  const [trueSignal] = useState(50); 
  const [numSamples] = useState(100);
  
  // CSV Mode Data
  const [csvA, setCsvA] = useState<number[]>([]);
  const [csvB, setCsvB] = useState<number[]>([]);

  // The final data fed into the chart
  const [fusionData, setFusionData] = useState<FusionDataPoint[]>([]);

  // Engine Trigger
  const runSimulation = () => {
    if (mode === "simulated") {
      setFusionData(generateSensorFusion(trueSignal, stdDevA, stdDevB, numSamples));
    } else {
      if (csvA.length > 0 && csvB.length > 0) {
        setFusionData(fuseCustomData(csvA, csvB, stdDevA, stdDevB));
      } else {
        setFusionData([]); // Clear graph if CSVs are missing
      }
    }
  };

  // Re-run whenever parameters, mode, or data changes
  useEffect(() => {
    runSimulation();
  }, [mode, trueSignal, stdDevA, stdDevB, numSamples, csvA, csvB]);

  // Handle CSV Uploads
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>, sensor: "A" | "B") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedValues = parseFusionCSV(text);
      if (sensor === "A") setCsvA(parsedValues);
      if (sensor === "B") setCsvB(parsedValues);
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Controls Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
              <Cpu className="w-5 h-5"/> Fusion Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Mode Toggle */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as "simulated" | "csv")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-neutral-950 border border-neutral-800">
                <TabsTrigger value="simulated" className="data-[state=active]:bg-neutral-800">Simulated</TabsTrigger>
                <TabsTrigger value="csv" className="data-[state=active]:bg-neutral-800">Custom CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="simulated" className="mt-4 space-y-4">
                <p className="text-xs text-neutral-400">Generating random theoretical noise around a flat signal of 50.</p>
                <Button onClick={runSimulation} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" /> Recalculate Simulation
                </Button>
              </TabsContent>

              <TabsContent value="csv" className="mt-4 space-y-4">
                <p className="text-xs text-neutral-400">Upload two synchronized data streams to fuse them.</p>
                
                {/* CSV A Upload */}
                <div className={`p-3 border border-dashed rounded-lg text-center ${csvA.length ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-700'}`}>
                  <Label htmlFor="csv-a" className="cursor-pointer flex flex-col items-center gap-2">
                    {csvA.length ? <Database className="w-5 h-5 text-emerald-400" /> : <Upload className="w-5 h-5 text-red-400" />}
                    <span className={`text-sm font-medium ${csvA.length ? 'text-emerald-400' : 'text-red-400'}`}>
                      {csvA.length ? `Sensor A Loaded (${csvA.length})` : "Upload Sensor A"}
                    </span>
                  </Label>
                  <input id="csv-a" type="file" accept=".csv,.txt" className="hidden" onChange={(e) => handleUpload(e, "A")} />
                </div>

                {/* CSV B Upload */}
                <div className={`p-3 border border-dashed rounded-lg text-center ${csvB.length ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-700'}`}>
                  <Label htmlFor="csv-b" className="cursor-pointer flex flex-col items-center gap-2">
                    {csvB.length ? <Database className="w-5 h-5 text-emerald-400" /> : <Upload className="w-5 h-5 text-amber-500" />}
                    <span className={`text-sm font-medium ${csvB.length ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {csvB.length ? `Sensor B Loaded (${csvB.length})` : "Upload Sensor B"}
                    </span>
                  </Label>
                  <input id="csv-b" type="file" accept=".csv,.txt" className="hidden" onChange={(e) => handleUpload(e, "B")} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t border-neutral-800 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-red-400">Sensor A Trust (σ)</Label>
                  <span className="font-mono text-sm">{stdDevA}</span>
                </div>
                <Slider value={[stdDevA]} onValueChange={(val) => setStdDevA(val[0])} max={20} step={0.5} />
                <p className="text-xs text-neutral-500">Lower σ = Higher Trust</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-amber-500">Sensor B Trust (σ)</Label>
                  <span className="font-mono text-sm">{stdDevB}</span>
                </div>
                <Slider value={[stdDevB]} onValueChange={(val) => setStdDevB(val[0])} max={20} step={0.5} />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Chart Column */}
      <div className="lg:col-span-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg">Kalman Variance-Weighted Fusion</CardTitle>
          </CardHeader>
          <CardContent className="h-[500px] w-full">
            {fusionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fusionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                  
                  {/* Only draw True Signal if we are in simulated mode */}
                  {mode === "simulated" && (
                    <Line type="monotone" dataKey="trueValue" stroke="#10b981" strokeWidth={3} dot={false} name="True Signal" />
                  )}
                  
                  <Line type="monotone" dataKey="sensorA" stroke="#ef4444" strokeWidth={1} dot={false} name="Sensor A" opacity={0.5} />
                  <Line type="monotone" dataKey="sensorB" stroke="#f59e0b" strokeWidth={1} dot={false} name="Sensor B" opacity={0.5} />
                  <Line type="monotone" dataKey="fused" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Fused Output" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Upload both Sensor A and Sensor B CSVs to view the fused data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}