"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivitySquare, ArrowUpRight, CheckCircle2, XCircle, Zap, Upload, Database } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { runSignalAnalysis, runCustomAnalysis, parseAnalysisCSV } from "@/lib/analysisEngine";

export default function SignalAnalysisSim() {
  const [mode, setMode] = useState<"simulated" | "csv">("simulated");
  
  // Params
  const [noiseLevel, setNoiseLevel] = useState(5.0);
  const [filterWindow, setFilterWindow] = useState(7);
  const [noiseType, setNoiseType] = useState<"white" | "colored">("white");
  
  const [csvData, setCsvData] = useState<number[]>([]);
  const [data, setData] = useState<any>(null);

  const runSimulation = () => {
    if (mode === "simulated") {
      setData(runSignalAnalysis(noiseLevel, filterWindow, noiseType === "colored"));
    } else {
      if (csvData.length > 0) {
        setData(runCustomAnalysis(csvData, filterWindow));
      } else {
        setData(null);
      }
    }
  };

  useEffect(() => { 
    runSimulation(); 
  }, [mode, noiseLevel, filterWindow, noiseType, csvData]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(parseAnalysisCSV(text));
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Controls Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg text-emerald-400 flex items-center gap-2"><ActivitySquare className="w-5 h-5"/> Analysis Config</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            
            {/* Mode Toggle */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as "simulated" | "csv")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-neutral-950 border border-neutral-800">
                <TabsTrigger value="simulated">Simulated</TabsTrigger>
                <TabsTrigger value="csv">Custom CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="simulated" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <Label className="text-xs text-neutral-400">Noise Type</Label>
                  <Tabs value={noiseType} onValueChange={(v) => setNoiseType(v as "white" | "colored")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-neutral-950 border border-neutral-800 h-8">
                      <TabsTrigger value="white" className="text-xs">White</TabsTrigger>
                      <TabsTrigger value="colored" className="text-xs">Colored</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between"><Label>Noise (σ)</Label><span className="font-mono text-sm">{noiseLevel}</span></div>
                  <Slider value={[noiseLevel]} onValueChange={(val) => setNoiseLevel(val[0])} min={1} max={15} step={0.5} />
                </div>
              </TabsContent>

              <TabsContent value="csv" className="mt-4 space-y-4">
                <div className={`p-3 border border-dashed rounded-lg text-center ${csvData.length ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-700'}`}>
                  <Label htmlFor="csv-upload-analysis" className="cursor-pointer flex flex-col items-center gap-2">
                    {csvData.length ? <Database className="w-5 h-5 text-emerald-400" /> : <Upload className="w-5 h-5 text-emerald-500" />}
                    <span className={`text-sm font-medium ${csvData.length ? 'text-emerald-400' : 'text-emerald-500'}`}>
                      {csvData.length ? `Data Loaded (${csvData.length} pts)` : "Upload Raw Data CSV"}
                    </span>
                  </Label>
                  <input id="csv-upload-analysis" type="file" accept=".csv,.txt" className="hidden" onChange={handleUpload} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex justify-between"><Label>LPF Window Size</Label><span className="font-mono text-sm">{filterWindow}</span></div>
              <Slider value={[filterWindow]} onValueChange={(val) => setFilterWindow(val[0])} min={2} max={20} step={1} />
            </div>
          </CardContent>
        </Card>

        {/* Diagnostics Card */}
        {data && (
          <Card className="bg-neutral-900 border-neutral-800 border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-400 font-medium">System Diagnostics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              
              {/* WSS Check */}
              <div className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-xs font-semibold">Wide-Sense Stationary:</span>
                {data.isWSS ? <span className="text-emerald-400 flex items-center text-xs font-bold"><CheckCircle2 className="w-4 h-4 mr-1"/> PASS</span> : <span className="text-rose-400 flex items-center text-xs font-bold"><XCircle className="w-4 h-4 mr-1"/> FAIL</span>}
              </div>

              {/* Hypothesis Test */}
              <div className="flex justify-between items-center bg-neutral-950 p-2 rounded border border-neutral-800">
                <span className="text-xs font-semibold">Hypothesis Test (H1):</span>
                {data.hypothesis ? <span className="text-emerald-400 flex items-center text-xs font-bold"><Zap className="w-4 h-4 mr-1"/> DETECTED</span> : <span className="text-rose-400 flex items-center text-xs font-bold"><XCircle className="w-4 h-4 mr-1"/> NO SIGNAL</span>}
              </div>

              {/* SNR Stats */}
              <div className="pt-2 font-mono text-sm space-y-1">
                <div className="flex justify-between"><span className="text-neutral-500">Raw SNR:</span><span className="text-rose-400">{data.rawSNR} {data.rawSNR !== "Unknown" && "dB"}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Filtered SNR:</span><span className="text-emerald-400">{data.filteredSNR} dB</span></div>
                {mode === "simulated" && (
                  <div className="flex justify-between border-t border-neutral-800 pt-1 mt-1"><span className="text-white">Net Gain:</span><span className="text-emerald-400 font-bold flex items-center"><ArrowUpRight className="w-4 h-4 mr-1" /> +{data.improvement} dB</span></div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Column */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Pre/Post Filtering Chart */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="text-lg">Pre-Filter vs. Post-Filter Analysis</CardTitle></CardHeader>
          <CardContent className="h-[250px] w-full">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                  <YAxis stroke="#888" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                  <Line type="monotone" dataKey="noisySignal" stroke="#ef4444" strokeWidth={1} dot={false} name="Raw Input" opacity={0.4} />
                  {mode === "simulated" && (
                    <Line type="monotone" dataKey="trueSignal" stroke="#888" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="True Signal" />
                  )}
                  <Line type="monotone" dataKey="filteredSignal" stroke="#10b981" strokeWidth={2.5} dot={false} name="Filtered Output" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                Upload a CSV to view the analysis.
              </div>
            )}
          </CardContent>
        </Card>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Autocorrelation */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader><CardTitle className="text-sm">Autocorrelation (Rxx)</CardTitle></CardHeader>
              <CardContent className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.autocorrelation}>
                    <XAxis dataKey="lag" stroke="#888" tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: '#262626'}} contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* PSD Graph */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader><CardTitle className="text-sm">Power Spectral Density (PSD)</CardTitle></CardHeader>
              <CardContent className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.psd}>
                    <XAxis dataKey="frequency" stroke="#888" tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                    <Area type="monotone" dataKey="power" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}