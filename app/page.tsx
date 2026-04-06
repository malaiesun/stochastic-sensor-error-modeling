"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity } from "lucide-react";
import SingleSensorSim from "@/components/simulations/SingleSensorSim";
import SensorFusionSim from "@/components/simulations/SensorFusionSim";
import CSVFilterSim from "@/components/simulations/CSVFilterSim";
import SensorDriftSim from "@/components/simulations/SensorDriftSim";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="border-b border-neutral-800 pb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="text-blue-500" />
            Stochastic Measurement Modeling
          </h1>
          <p className="text-neutral-400 mt-1">
            Real-time ECE simulation of Gaussian noise, drift, and Kalman fusion.
          </p>
        </header>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="single" className="data-[state=active]:bg-neutral-800">
              1. Basic Gaussian Noise
            </TabsTrigger>
            <TabsTrigger value="fusion" className="data-[state=active]:bg-neutral-800">
              2. Sensor Fusion (Kalman)
            </TabsTrigger>
            <TabsTrigger value="csv" className="data-[state=active]:bg-neutral-800">
              3. Real Data (CSV Filter)
            </TabsTrigger>
            <TabsTrigger value="drift" className="data-[state=active]:bg-neutral-800">
              4. Random Walk (Drift)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-6">
            <SingleSensorSim />
          </TabsContent>

          <TabsContent value="fusion" className="mt-6">
            <SensorFusionSim />
          </TabsContent>

          <TabsContent value="csv" className="mt-6">
            <CSVFilterSim />
          </TabsContent>

          <TabsContent value="drift" className="mt-6">
            <SensorDriftSim />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}