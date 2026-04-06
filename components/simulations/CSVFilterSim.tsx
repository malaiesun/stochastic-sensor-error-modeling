"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileLineChart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { applyKalmanFilter, parseCSV, FilteredDataPoint } from "@/lib/filterEngine";

export default function CSVFilterSim() {
  const [rawData, setRawData] = useState<number[]>([]);
  const [filteredData, setFilteredData] = useState<FilteredDataPoint[]>([]);
  
  // Kalman Filter Parameters
  // Q: Process Noise (How "wiggly" the true signal is allowed to be)
  const [qValue, setQValue] = useState(0.001); 
  // R: Measurement Noise (How much we distrust the sensor)
  const [rValue, setRValue] = useState(1);     

  // Handle CSV Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedValues = parseCSV(text);
      setRawData(parsedValues);
    };
    reader.readAsText(file);
  };

  // Re-run the filter whenever data or sliders change
  useEffect(() => {
    if (rawData.length > 0) {
      const results = applyKalmanFilter(rawData, qValue, rValue);
      setFilteredData(results);
    }
  }, [rawData, qValue, rValue]);

  // Generate some fake noisy data just so the screen isn't empty before upload
  const loadDemoData = () => {
    const demo = [];
    let truth = 10;
    for (let i = 0; i < 200; i++) {
      if (i === 50) truth = 20; // sudden jump
      if (i === 120) truth = 5; // sudden drop
      demo.push(truth + (Math.random() - 0.5) * 8); // add heavy uniform noise
    }
    setRawData(demo);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-amber-400 flex items-center gap-2">
              <FileLineChart className="w-5 h-5"/> Filter Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* CSV Upload */}
            <div className="space-y-3 p-4 border border-dashed border-neutral-700 rounded-lg text-center">
              <Label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="w-6 h-6 text-neutral-400" />
                <span className="text-sm font-medium text-blue-400 hover:text-blue-300">Upload Sensor CSV</span>
              </Label>
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv,.txt" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>

            <Button onClick={loadDemoData} variant="outline" className="w-full bg-neutral-800 border-neutral-700">
              Load Demo Data
            </Button>

            {/* Filter Tuning Controls */}
            <div className="pt-4 border-t border-neutral-800 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Sensor Distrust (R)</Label>
                  <span className="font-mono text-xs text-neutral-400">High = Smoother</span>
                </div>
                <Slider 
                  value={[rValue]} 
                  onValueChange={(val) => setRValue(val[0])} 
                  min={0.1} max={10} step={0.1} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>True Signal Agility (Q)</Label>
                  <span className="font-mono text-xs text-neutral-400">High = Faster tracking</span>
                </div>
                <Slider 
                  value={[qValue]} 
                  onValueChange={(val) => setQValue(val[0])} 
                  min={0.0001} max={0.1} step={0.001} 
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg">Kalman Filter Application (Real Data)</CardTitle>
          </CardHeader>
          <CardContent className="h-[500px] w-full">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                  <Line type="monotone" dataKey="raw" stroke="#ef4444" strokeWidth={1} dot={false} name="Raw Noisy CSV" opacity={0.4} />
                  <Line type="monotone" dataKey="filtered" stroke="#10b981" strokeWidth={3} dot={false} name="Kalman Filtered Output" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Upload a CSV or click 'Load Demo Data' to begin.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}