import { motion } from 'framer-motion';

const STEPS = [
  'Analysing image...',
  'Classifying waste type...',
  'Fetching disposal guidance...',
  'Calculating carbon impact...',
];

export function AnalysingLoader({ step = 0 }: { step?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Analysing: ${STEPS[step] ?? STEPS[0]}`}
      className="flex flex-col items-center justify-center py-16 space-y-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-eco-green-200 border-t-eco-green-600 dark:border-eco-green-800 dark:border-t-eco-green-400"
      />
      <div className="text-center space-y-2">
        <p className="font-semibold text-gray-700 dark:text-gray-200 text-lg">{STEPS[step] ?? STEPS[0]}</p>
        <div className="flex justify-center gap-1.5 mt-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-eco-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-400 dark:text-gray-500">This may take a few seconds…</p>
    </div>
  );
}
