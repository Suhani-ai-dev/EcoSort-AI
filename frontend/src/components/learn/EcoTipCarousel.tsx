import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { ECO_TIPS } from '../../data/learnContent';

const IMPACT_COLORS = {
  high:   'bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  low:    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function EcoTipCarousel() {
  const shuffled = useMemo(() => shuffle(ECO_TIPS), []);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const tip = shuffled[index];
  const total = shuffled.length;

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex(i => (i + dir + total) % total);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {total} randomised eco tips — navigate through them to discover simple actions that make a real difference.
      </p>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 overflow-hidden min-h-[180px] flex flex-col justify-between">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, x: direction * -40, transition: { duration: 0.2 } }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-base text-gray-800 dark:text-gray-100 leading-relaxed">{tip.tip}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{tip.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${IMPACT_COLORS[tip.impact]}`}>
                {tip.impact} impact
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => go(-1)}
            aria-label="Previous tip"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">{index + 1} / {total}</span>
          <button
            onClick={() => go(1)}
            aria-label="Next tip"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
