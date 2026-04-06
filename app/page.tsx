"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, LineChart, Waves, Cpu, ChevronRight, ArrowLeft, Target, ShieldAlert, Rocket, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

import SingleSensorSim from "@/components/simulations/SingleSensorSim";
import SensorFusionSim from "@/components/simulations/SensorFusionSim";
import CSVFilterSim from "@/components/simulations/CSVFilterSim";
import SensorDriftSim from "@/components/simulations/SensorDriftSim";

// ==========================================
// EXPANDED THEORY CONTENT (ACADEMIC GRADE)
// ==========================================
const theoryContent = {
  single: { 
    title: "Additive White Gaussian Noise (AWGN)", 
    subtitle: "The Fundamental Stochastic Model",
    color: "blue",
    icon: LineChart,
    sections: [
      { heading: "The Problem", text: "Physical sensors are subject to high-frequency jitter caused by thermal interference and electronic fluctuations. AWGN assumes this noise has uniform power across all frequencies (White) and follows a normal distribution (Gaussian)." },
      { heading: "Mathematical Approach", text: "Standard computational generators only output uniform noise (0 to 1). We implement the Box-Muller transform from scratch to computationally stretch uniform randomness into a true Normal/Gaussian Probability Density Function." },
      { heading: "Expected Outcomes", text: "As you increase the Standard Deviation (σ), the timeline becomes visibly jagged, but the underlying histogram will perfectly map to a theoretical Bell Curve, proving the integrity of the math engine." }
    ]
  },
  fusion: { 
    title: "Variance-Weighted Sensor Fusion", 
    subtitle: "Multi-Sensor Calibration & Weighting",
    color: "purple",
    icon: Cpu,
    sections: [
      { heading: "The Problem", text: "In aerospace and robotics, a single sensor is a single point of failure. When multiple sensors measure the same environment, they inherently disagree due to their independent AWGN profiles." },
      { heading: "Mathematical Approach", text: "We implement the core logic of the Kalman Update Step. By weighting each sensor inversely proportional to its variance (σ²), the algorithm dynamically calculates the statistically optimal 'true' state between the two." },
      { heading: "Expected Outcomes", text: "The Fused (Purple) line will automatically 'cling' to the sensor you assign a lower variance to. The mathematics guarantee that the fused output will always have a lower overall error than the worst individual sensor." }
    ]
  },
  csv: { 
    title: "1D Discrete Kalman State Estimation", 
    subtitle: "Applied Filtering on Real-World Data",
    color: "emerald",
    icon: ShieldAlert,
    sections: [
      { heading: "The Problem", text: "Simulations are perfect, but the real world is chaotic. We need an algorithm capable of recovering a hidden true state from highly corrupted, unpredictable CSV data arrays." },
      { heading: "Mathematical Approach", text: "We built a 1D Discrete Kalman Filter. It operates in two steps: Prediction (estimating the next state based on Process Noise 'Q') and Update (correcting the estimate using the Kalman Gain 'K' and Measurement Noise 'R')." },
      { heading: "Expected Outcomes", text: "Upload a CSV. By tuning the R slider (Sensor Distrust), you dictate how aggressively the math smooths the data. Tuning the Q slider dictates how fast the filter tracks sudden, legitimate spikes in the true signal." }
    ]
  },
  drift: { 
    title: "Brownian Motion & Random Walk", 
    subtitle: "Cumulative Stochastic Integration Errors",
    color: "rose",
    icon: Waves,
    sections: [
      { heading: "The Problem", text: "Inertial Measurement Units (IMUs) don't just suffer from high-frequency jitter. Tiny measurement errors accumulate during integration over time, causing a 'drift' where the sensor loses its absolute frame of reference." },
      { heading: "Mathematical Approach", text: "We mathematically model Brownian Motion by executing a Discrete Random Walk. Instead of resetting the noise to zero, each stochastic Gaussian step is cumulatively added to the previous one." },
      { heading: "Expected Outcomes", text: "Turn White Noise to zero and Drift severity up. You will see the sensor slowly 'wander' infinitely away from the true signal. This proves why IMUs must be fused with absolute sensors (like GPS or Magnetometers) in the real world." }
    ]
  }
};
type TabKey = keyof typeof theoryContent;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};
const tabTransition = {
  hidden: { opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: easeOut } },
  exit: { opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)", transition: { duration: 0.3, ease: easeIn } }
};

// ==========================================
// 1. CINEMATIC LANDING PAGE ("THE VOID")
// ==========================================
function LandingView({ onLaunch }: { onLaunch: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(30px)", scale: 3 }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-neutral-950 text-neutral-50 font-sans relative overflow-hidden flex flex-col justify-start pt-24"
    >
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] md:w-[1500px] md:h-[1500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-neutral-950 to-neutral-950 pointer-events-none rounded-full blur-3xl" 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pb-32">
        <div className="text-center space-y-8 max-w-5xl mx-auto mb-32">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase">
            <Activity className="w-4 h-4" /> Random Processes (BECE207L)
          </motion.div>
          
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white drop-shadow-2xl leading-[1.1]">
            Stochastic <br /> Measurement & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400">Sensor Fusion</span>
          </motion.h1>
          
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-3xl mx-auto font-light">
            An aerospace-grade simulation environment for modeling additive Gaussian noise, Brownian drift, and discrete Kalman state estimation.
          </motion.p>
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 }} className="py-8 mt-8 border-y border-neutral-800/80 bg-neutral-900/30 backdrop-blur-md rounded-3xl">
            <p className="text-sm text-neutral-500 uppercase tracking-[0.3em] mb-4 font-bold">Faculty Guide: Prof. Kalaivanan K</p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-x-12 gap-y-4 text-neutral-300 font-medium text-lg">
              <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>S Malaiesun <span className="text-neutral-500 text-sm font-mono">24BEC1578</span></span>
              <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>T S Vishal Babu <span className="text-neutral-500 text-sm font-mono">24BEC1575</span></span>
              <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>J Saran <span className="text-neutral-500 text-sm font-mono">24BEC1081</span></span>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="pt-12">
            <Button onClick={onLaunch} size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-8 text-2xl rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all hover:scale-110 hover:shadow-[0_0_80px_rgba(37,99,235,0.8)] font-bold group">
              INITIATE SYSTEMS <ChevronRight className="ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 1 }} className="space-y-16">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">The Architecture of Noise</h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              In physical engineering, data is never perfect. Thermal interference, electronic jitter, and mechanical vibrations corrupt all sensor readings. This dashboard mathematically synthesizes these stochastic processes and deploys advanced state-estimation algorithms to recover the underlying truth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-2xl text-blue-400 flex flex-col gap-4"><Target className="w-10 h-10" /> 1. AWGN Modeling</CardTitle></CardHeader>
              <CardContent className="text-neutral-400 space-y-4">
                <p><strong>Additive White Gaussian Noise</strong> is the fundamental building block of signal corruption. It assumes noise is normally distributed with a mean of zero.</p>
                <p className="text-sm border-l-2 border-blue-500/50 pl-3"><em>Dashboard Feature:</em> We use the Box-Muller transform to generate true Gaussian distribution dynamically.</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-2xl text-emerald-400 flex flex-col gap-4"><ShieldAlert className="w-10 h-10" /> 2. Kalman Filtering</CardTitle></CardHeader>
              <CardContent className="text-neutral-400 space-y-4">
                <p>The <strong>Kalman Filter</strong> is an optimal estimator. It continuously predicts the next state and updates its prediction based on the variance of incoming measurements.</p>
                <p className="text-sm border-l-2 border-emerald-500/50 pl-3"><em>Dashboard Feature:</em> Upload real CSV data and tune the Process (Q) and Measurement (R) noise parameters in real-time.</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-xl">
              <CardHeader><CardTitle className="text-2xl text-rose-400 flex flex-col gap-4"><Rocket className="w-10 h-10" /> 3. Brownian Drift</CardTitle></CardHeader>
              <CardContent className="text-neutral-400 space-y-4">
                <p>Also known as a <strong>Random Walk</strong>, this occurs when small integration errors accumulate over time, causing a sensor's baseline to drift infinitely away from reality.</p>
                <p className="text-sm border-l-2 border-rose-500/50 pl-3"><em>Dashboard Feature:</em> Watch simulated IMU data succumb to cumulative low-frequency drift over a specified time horizon.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 2. DASHBOARD VIEW (WITH ANIMATED TABS)
// ==========================================
function DashboardView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<TabKey>("single");

  // Get current active theory data
  const currentTheory = theoryContent[activeTab];
  const IconComponent = currentTheory.icon;

  // Render the correct simulation based on state
  const renderSimulation = () => {
    switch (activeTab) {
      case "single": return <SingleSensorSim />;
      case "fusion": return <SensorFusionSim />;
      case "csv": return <CSVFilterSim />;
      case "drift": return <SensorDriftSim />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(20px)", scale: 0.8 }} 
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} 
      exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} 
      className="min-h-screen bg-neutral-950 text-neutral-50 p-6 md:p-8 font-sans relative z-20"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="text-blue-500" /> Stochastic Measurement Modeling
            </h1>
            <p className="text-neutral-400 mt-1">Real-time ECE simulation of Gaussian noise, drift, and Kalman fusion.</p>
          </div>
          <Button variant="outline" onClick={onBack} className="bg-neutral-900 border-neutral-700 hover:bg-neutral-800 shrink-0 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> End Session
          </Button>
        </header>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)} className="w-full">
          <TabsList className="bg-neutral-900 border border-neutral-800 flex flex-wrap h-auto">
            <TabsTrigger value="single" className="data-[state=active]:bg-neutral-800 py-2 px-4">1. AWGN Noise</TabsTrigger>
            <TabsTrigger value="fusion" className="data-[state=active]:bg-neutral-800 py-2 px-4">2. Sensor Fusion</TabsTrigger>
            <TabsTrigger value="csv" className="data-[state=active]:bg-neutral-800 py-2 px-4">3. CSV Filter</TabsTrigger>
            <TabsTrigger value="drift" className="data-[state=active]:bg-neutral-800 py-2 px-4">4. Brownian Drift</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ANIMATE PRESENCE: 
          This wraps the Theory Panel AND the Simulation. When 'activeTab' changes,
          the old one blurs and slides out, and the new one blurs and slides in.
        */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Crucial: Tells Framer Motion this is a new component
            variants={tabTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* The Cinematic Theory Panel */}
            <Card className={`border-${currentTheory.color}-500/30 bg-gradient-to-br from-${currentTheory.color}-950/40 to-neutral-950 overflow-hidden relative shadow-lg shadow-${currentTheory.color}-900/10`}>
              <div className={`absolute top-0 left-0 w-1 h-full bg-${currentTheory.color}-500`} />
              <CardContent className="p-6 md:p-8">
                
                <div className="flex items-center gap-4 border-b border-neutral-800/80 pb-4 mb-6">
                  <div className={`p-3 rounded-xl bg-${currentTheory.color}-500/10 border border-${currentTheory.color}-500/20`}>
                    <IconComponent className={`w-8 h-8 text-${currentTheory.color}-400`} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold text-${currentTheory.color}-300`}>{currentTheory.title}</h2>
                    <p className="text-neutral-400 font-medium tracking-wide mt-1">{currentTheory.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {currentTheory.sections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className={`w-4 h-4 text-${currentTheory.color}-500/70`} />
                        <h4 className="text-neutral-200 font-semibold tracking-wide uppercase text-xs">{section.heading}</h4>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed border-l border-neutral-800 pl-4 py-1">
                        {section.text}
                      </p>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>

            {/* The Active Simulation Widget */}
            {renderSimulation()}
          </motion.div>
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

// ==========================================
// 3. MAIN APP CONTROLLER WITH ANIMATE-PRESENCE
// ==========================================
export default function MainApp() {
  const [appMode, setAppMode] = useState<"landing" | "dashboard">("landing");

  return (
    <AnimatePresence mode="wait">
      {appMode === "landing" ? (
        <LandingView key="landing" onLaunch={() => setAppMode("dashboard")} />
      ) : (
        <DashboardView key="dashboard" onBack={() => setAppMode("landing")} />
      )}
    </AnimatePresence>
  );
}