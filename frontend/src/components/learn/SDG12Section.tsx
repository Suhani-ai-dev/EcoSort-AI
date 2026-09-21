import { ExternalLink } from 'lucide-react';
import { SDG12_FACTS } from '../../data/learnContent';

export function SDG12Section() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-eco-green-50 dark:bg-eco-green-900/20 rounded-2xl border border-eco-green-200 dark:border-eco-green-800 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <h3 className="font-bold text-eco-green-800 dark:text-eco-green-300 text-lg">SDG 12: Responsible Consumption &amp; Production</h3>
        </div>
        <p className="text-sm text-eco-green-700 dark:text-eco-green-400 leading-relaxed">
          Sustainable Development Goal 12 calls for sustainable management and efficient use of natural resources, halving global per-capita food waste, and substantially reducing waste generation by 2030. It recognises that current production and consumption patterns are exceeding planetary boundaries.
        </p>
        <a
          href="https://sdgs.un.org/goals/goal12"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-eco-green-700 dark:text-eco-green-400 hover:underline"
        >
          Learn more at UN SDGs <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Key facts */}
      <div>
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Key Facts &amp; Figures</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SDG12_FACTS.map((fact, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-2xl font-bold text-eco-green-600 dark:text-eco-green-400">{fact.stat}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-snug">{fact.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">— {fact.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How EcoSort AI contributes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">How EcoSort AI Contributes to SDG 12</h3>
        <div className="space-y-3">
          {[
            { emoji: '🔍', text: 'Reduces waste misdirection by using AI to correctly classify household waste, preventing recyclables from entering landfill.' },
            { emoji: '📊', text: 'Quantifies environmental impact by showing users the kg CO₂e saved per disposal decision, making sustainability tangible.' },
            { emoji: '🎓', text: 'Builds sustainable habits through education — explaining why correct disposal matters and what each waste type requires.' },
            { emoji: '🏆', text: 'Drives behaviour change through gamification — rewarding users with points and badges for consistent eco-friendly disposal.' },
            { emoji: '🌍', text: 'Scales impact through community — the leaderboard creates social accountability and positive peer influence.' },
          ].map(({ emoji, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{emoji}</span>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
