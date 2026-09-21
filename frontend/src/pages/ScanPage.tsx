import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RotateCcw, Save, Trophy, Camera } from 'lucide-react';
import { UploadZone } from '../components/scan/UploadZone';
import { AnalysingLoader } from '../components/scan/AnalysingLoader';
import { ResultCard } from '../components/scan/ResultCard';
import { classifyWaste, type ClassifyResult } from '../api/classifyApi';
import { getGuidance, type GuidanceResult } from '../api/guidanceApi';
import { saveScan } from '../api/scansApi';

type ScanState = 'idle' | 'analysing' | 'result' | 'saving';

const FADE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function ScanPage() {
  const [state, setState] = useState<ScanState>('idle');
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [classify, setClassify] = useState<ClassifyResult | null>(null);
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [saved, setSaved] = useState(false);

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
    } catch {
      setState('idle');
      toast.error('Classification failed. Please try another image.');
    }
  }

  async function handleSave() {
    if (!file || !classify || !guidance) return;
    setState('saving');
    try {
      const res = await saveScan(file, classify, guidance);
      setSaved(true);
      setState('result');
      const badgeMsg = res.new_badges.length > 0
        ? ` 🏆 New badge: ${res.new_badges.map(b => b.name).join(', ')}!`
        : '';
      toast.success(`+${res.points_earned} points earned!${badgeMsg} Total: ${res.points_total} pts`);
    } catch {
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-eco-green-100 dark:bg-eco-green-900/30 flex items-center justify-center">
            <Camera className="w-4 h-4 text-eco-green-600 dark:text-eco-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scan Waste</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">
          Upload or capture a photo of any waste item for instant AI classification.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" variants={FADE} initial="initial" animate="animate" exit="exit">
            <UploadZone onFileSelect={handleFileSelect} />
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
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {!saved ? (
                <button
                  onClick={handleSave}
                  disabled={state === 'saving'}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-eco-green-600 hover:bg-eco-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                >
                  {state === 'saving'
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {state === 'saving' ? 'Saving…' : 'Save & Earn Points'}
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-eco-green-50 dark:bg-eco-green-900/20 text-eco-green-700 dark:text-eco-green-400 font-semibold rounded-xl border border-eco-green-200 dark:border-eco-green-800">
                  <Trophy className="w-4 h-4" /> Scan Saved!
                </div>
              )}
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Scan Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
