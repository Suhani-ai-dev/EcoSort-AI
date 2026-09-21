import { useState } from 'react';
import { BookOpen, Recycle, Globe, Lightbulb } from 'lucide-react';
import { WASTE_CATEGORIES } from '../data/learnContent';
import { WasteCategoryCard } from '../components/learn/WasteCategoryCard';
import { RecyclingSymbolGrid } from '../components/learn/RecyclingSymbolGrid';
import { EcoTipCarousel } from '../components/learn/EcoTipCarousel';
import { SDG12Section } from '../components/learn/SDG12Section';

type Tab = 'waste' | 'symbols' | 'sdg12' | 'tips';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'waste',   label: 'Waste Guide',       icon: BookOpen,  color: 'text-eco-green-600 dark:text-eco-green-400' },
  { id: 'symbols', label: 'Recycling Symbols', icon: Recycle,   color: 'text-eco-teal-600 dark:text-eco-teal-400' },
  { id: 'sdg12',   label: 'SDG 12',            icon: Globe,     color: 'text-blue-600 dark:text-blue-400' },
  { id: 'tips',    label: 'Eco Tips',          icon: Lightbulb, color: 'text-eco-earth-600 dark:text-eco-earth-400' },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<Tab>('waste');
  const active = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-eco-green-100 dark:bg-eco-green-900/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-eco-green-600 dark:text-eco-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learn &amp; Educate</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">
          Waste guides, recycling symbols, SDG 12 facts, and sustainability tips.
        </p>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        className="flex overflow-x-auto gap-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700"
      >
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === id
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${activeTab === id ? color : ''}`} aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Active tab label for mobile */}
      <div className="sm:hidden flex items-center gap-2">
        <active.icon className={`w-5 h-5 ${active.color}`} />
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">{active.label}</h2>
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WASTE_CATEGORIES.map(cat => (
              <WasteCategoryCard key={cat.name} category={cat} />
            ))}
          </div>
        )}
        {activeTab === 'symbols' && <RecyclingSymbolGrid />}
        {activeTab === 'sdg12' && <SDG12Section />}
        {activeTab === 'tips' && <EcoTipCarousel />}
      </div>
    </div>
  );
}
