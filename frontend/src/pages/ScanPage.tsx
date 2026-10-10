import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RotateCcw, Save, Trophy, Camera, Leaf, Sparkles, Layers } from 'lucide-react';
import { UploadZone } from '../components/scan/UploadZone';
import { AnalysingLoader } from '../components/scan/AnalysingLoader';
import { ResultCard } from '../components/scan/ResultCard';
import { classifyWaste, type ClassifyResult } from '../api/classifyApi';
import { getGuidance, type GuidanceResult } from '../api/guidanceApi';
import { saveScan, getLocalScans } from '../api/scansApi';
import { getUserPoints, getUserCarbonTotal } from '../api/profileApi';

type ScanState = 'idle' | 'analysing' | 'result' | 'saving';

const FADE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const BIN_GUIDES = [
  { name: 'Blue Bin', type: 'Paper & Cardboard', color: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { name: 'Yellow Bin', type: 'Plastics & Cans', color: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { name: 'Green Bin', type: 'Glass Bottles', color: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { name: 'Brown Bin', type: 'Food Compost', color: 'bg-lime-700', border: 'border-lime-200 dark:border-lime-800', bg: 'bg-lime-50 dark:bg-lime-950/30' },
  { name: 'Red Bin', type: 'Hazardous / E-Waste', color: 'bg-red-500', border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-950/30' },
  { name: 'Grey Bin', type: 'General Landfill', color: 'bg-gray-500', border: 'border-gray-200 dark:border-gray-700', bg: 'bg-gray-50 dark:bg-gray-800/40' },
];

export default function ScanPage() {
  const [state, setState] = useState<ScanState>('idle');
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [classify, setClassify] = useState<ClassifyResult | null>(null);
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [saved, setSaved] = useState(false);

  // Quick stats
  const [points, setPoints] = useState(0);
  const [carbon, setCarbon] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  const refreshStats = async () => {
    const [pts, c] = await Promise.all([getUserPoints(), getUserCarbonTotal()]);
    setPoints(pts);
    setCarbon(c);
    setScanCount(getLocalScans().length);
  };

  useEffect(() => {
    refreshStats();
  }, []);

  async function handleFileSelect(f: File) {
    setFile(f);
    setSaved(false);
    setState('analysing');
    setStep(0);
    try {
      setStep(1);
      const c = await classifyWaste(f);
      setClassify(c);
      setStep(2);
      const g = await getGuidance(c.category, c.sub_category);
      setGuidance(g);
      setStep(3);
      setState('result');
    } catch (err) {
      console.error('[ScanPage] Classification failure:', err);
      setState('idle');
      toast.error('Classification failed. Please try another image or check network.');
    }
  }

  async function handleSave() {
    if (!file || !classify || !guidance) return;
    setState('saving');
    try {
      const res = await saveScan(file, classify, guidance);
      setSaved(true);
      setState('result');
      await refreshStats();

      const badgeMsg = res.new_badges && res.new_badges.length > 0
        ? ` 🏆 New badge unlocked: ${res.new_badges.map(b => b.name).join(', ')}!`
        : '';
      toast.success(`+${res.points_earned} points earned!${badgeMsg} Total: ${res.points_total} pts`);
    } catch (err) {
      console.error('[ScanPage] Save failure:', err);
      setState('result');
      toast.error('Could not save scan. Please try again.');
    }
  }

  function reset() {
    setState('idle');
    setFile(null);
    setClassify(null);
    setGuidance(null);
    setSaved(false);
    setStep(0);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-eco-green-100 dark:bg-eco-green-900/40 flex items-center justify-center text-eco-green-600 dark:text-eco-green-400 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">AI Waste Scanner</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Deep learning vision classification &amp; instant sustainable disposal guidance
              </p>
            </div>
          </div>
        </div>

        {/* Live metric summary pill */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm self-start sm:self-auto text-xs">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
            <Camera className="w-3.5 h-3.5" />
            <span>{scanCount} scans</span>
          </div>
          <span className="w-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{points} pts</span>
          </div>
          <span className="w-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex items-center gap-1.5 text-eco-green-600 dark:text-eco-green-400 font-bold">
            <Leaf className="w-3.5 h-3.5" />
            <span>{carbon.toFixed(1)} kg CO₂e</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" variants={FADE} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <UploadZone onFileSelect={handleFileSelect} />

            {/* Municipal Bin Sorting Reference */}
            <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-eco-green-600 dark:text-eco-green-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  Universal Municipal Bin Color Guide
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                EcoSort AI matches identified items to global waste sorting standards:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {BIN_GUIDES.map(bin => (
                  <div key={bin.name} className={`p-3 rounded-2xl border ${bin.border} ${bin.bg} flex items-center gap-2.5`}>
                    <div className={`w-3.5 h-3.5 rounded-full ${bin.color} flex-shrink-0 shadow-sm`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{bin.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{bin.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-eco-green-500/10 via-teal-500/5 to-transparent border border-eco-green-100 dark:border-eco-green-900/40 space-y-2.5">
              <div className="flex items-center gap-2 text-eco-green-700 dark:text-eco-green-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">How EcoSort AI Works</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-300">
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 dark:text-white">1. Vision Inference</span>
                  <p>Analyzed with EfficientNetB0 neural networks across 10 material classes and 70+ subcategories.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 dark:text-white">2. Gemini Guidance</span>
                  <p>Google Gemini synthesizes precise preparation steps and circular economy advice in real time.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 dark:text-white">3. Carbon Tracking</span>
                  <p>Quantifies CO₂e emissions diverted using EPA WARM v16 and IPCC LCA peer-reviewed baselines.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'analysing' && (
          <motion.div key="analysing" variants={FADE} initial="initial" animate="animate" exit="exit">
            <AnalysingLoader step={step} />
          </motion.div>
        )}

        {(state === 'result' || state === 'saving') && classify && guidance && (
          <motion.div key="result" variants={FADE} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <ResultCard classify={classify} guidance={guidance} />

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!saved ? (
                <button
                  onClick={handleSave}
                  disabled={state === 'saving'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-eco-green-600 hover:bg-eco-green-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg"
                >
                  {state === 'saving' ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {state === 'saving' ? 'Recording Scan…' : 'Save & Claim Eco Points'}
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-eco-green-50 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-300 font-bold rounded-2xl border border-eco-green-200 dark:border-eco-green-800 shadow-sm">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Points Awarded &amp; Saved!
                </div>
              )}

              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                <RotateCcw className="w-5 h-5" /> Scan Another Item
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
