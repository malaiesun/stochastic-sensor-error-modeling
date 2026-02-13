"use client";

import { useState } from "react";
import { generateSensorNoise } from "@/lib/stochastic/sensorNoise";
import { computeMean, computeVariance } from "@/lib/stochastic/stats";
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
    Brush,
} from "recharts";
import {
    TransformWrapper,
    TransformComponent,
} from "react-zoom-pan-pinch";

export default function SimulatorPage() {
    const [mean, setMean] = useState("0");
    const [std, setStd] = useState("1");
    const [samples, setSamples] = useState("200");
    const [data, setData] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const [estimatedMean, setEstimatedMean] = useState<number | null>(null);
    const [estimatedVar, setEstimatedVar] = useState<number | null>(null);

    const handleGenerate = () => {
        setLoading(true);

        setTimeout(() => {
            const noise = generateSensorNoise(
                Number(samples),
                Number(mean),
                Number(std)
            );

            const m = computeMean(noise);
            const v = computeVariance(noise, m);

            setData(noise);
            setEstimatedMean(m);
            setEstimatedVar(v);
            setLoading(false);
        }, 400);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
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

                        <Button onClick={handleGenerate} className="w-full">
                            {loading ? "Computing..." : "Generate Noise"}
                        </Button>

                        {/* Stats */}
                        {estimatedMean !== null && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                                <div className="p-3 border rounded-md">
                                    <div className="text-muted-foreground">
                                        Theoretical Mean
                                    </div>
                                    <div className="font-medium">
                                        {Number(mean).toFixed(4)}
                                    </div>
                                </div>

                                <div className="p-3 border rounded-md">
                                    <div className="text-muted-foreground">
                                        Estimated Mean
                                    </div>
                                    <div className="font-medium">
                                        {estimatedMean.toFixed(4)}
                                    </div>
                                </div>

                                <div className="p-3 border rounded-md">
                                    <div className="text-muted-foreground">
                                        Theoretical Variance
                                    </div>
                                    <div className="font-medium">
                                        {(Number(std) ** 2).toFixed(4)}
                                    </div>
                                </div>

                                <div className="p-3 border rounded-md">
                                    <div className="text-muted-foreground">
                                        Estimated Variance
                                    </div>
                                    <div className="font-medium">
                                        {estimatedVar?.toFixed(4)}
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Zoomable Chart */}
                        {data.length > 0 && (
                            <div className="h-[400px]">
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
                                            strokeWidth={2}
                                        />
                                        <Brush dataKey="index" height={30} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}


                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
