import { Link } from 'react-router-dom';
import {
  Leaf, Camera, Recycle, Trophy, BookOpen, ArrowRight,
  BarChart2, ShieldCheck, Globe, Users, Zap, ChevronRight,
} from 'lucide-react';

// ─── Static data ────────────────────────────────────────────────────────────

const STATS = [
  { value: '10', label: 'Waste categories', suffix: '' },
  { value: '95', label: 'Classification accuracy', suffix: '%' },
  { value: '4', label: 'UN SDGs addressed', suffix: '' },
  { value: '100', label: 'Free to use', suffix: '%' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Camera,
    title: 'Snap a photo',
    desc: 'Take or upload a photo of any waste item — from a plastic bottle to a circuit board.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'AI classifies instantly',
    desc: 'Our fine-tuned EfficientNetB0 model identifies the material and sub-category in under a second.',
  },
  {
    step: '03',
    icon: Recycle,
    title: 'Get disposal guidance',
    desc: 'Google Gemini generates step-by-step, localised disposal instructions tailored to your item.',
  },
  {
    step: '04',
    icon: BarChart2,
    title: 'Track your impact',
    desc: 'See the CO₂e you save, earn points and badges, and climb the community leaderboard.',
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Science-backed carbon data',
    desc: 'CO₂e estimates sourced from US EPA WARM v16, WRAP 2020, and IPCC AR6 — peer-reviewed LCA data you can trust.',
    color: 'eco-teal',
  },
  {
    icon: Trophy,
    title: 'Gamified sustainability',
    desc: 'Earn points per scan, unlock milestone badges (Eco Starter → Planet Hero), and compete on the leaderboard.',
    color: 'eco-earth',
  },
  {
    icon: BookOpen,
    title: 'Learn Hub',
    desc: '22 eco-tips, recycling symbol decoder, SDG 12 facts, and a complete waste category guide — all in one place.',
    color: 'eco-green',
  },
  {
    icon: Globe,
    title: 'Aligned with SDG 12',
    desc: 'Every feature is designed around Responsible Consumption & Production — reducing waste misdirection at scale.',
    color: 'eco-green',
  },
  {
    icon: Users,
    title: 'Community leaderboard',
    desc: 'Real-time rankings drive collective action. See how your community is reducing waste together.',
    color: 'eco-teal',
  },
  {
    icon: ShieldCheck,
    title: 'Private & secure',
    desc: 'Images stored in a private bucket, accessed only via time-limited signed URLs. Your data stays yours.',
    color: 'eco-earth',
  },
];

const WASTE_CATEGORIES = [
  { emoji: '📄', name: 'Paper', recyclable: true },
  { emoji: '🧴', name: 'Plastic', recyclable: true },
  { emoji: '🍶', name: 'Glass', recyclable: true },
  { emoji: '🔩', name: 'Metal', recyclable: true },
  { emoji: '🍎', name: 'Organic', recyclable: false },
  { emoji: '💻', name: 'E-Waste', recyclable: true },
  { emoji: '💊', name: 'Medical', recyclable: false },
  { emoji: '⚗️', name: 'Hazardous', recyclable: false },
  { emoji: '👕', name: 'Textile', recyclable: true },
  { emoji: '🗑️', name: 'General', recyclable: false },
];

// ─── Color helper ────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  'eco-green': {
    bg: 'bg-eco-green-50 dark:bg-eco-green-900/20',
    text: 'text-eco-green-600 dark:text-eco-green-400',
    border: 'border-eco-green-200 dark:border-eco-green-800',
  },
  'eco-teal': {
    bg: 'bg-eco-teal-50 dark:bg-eco-teal-900/20',
    text: 'text-eco-teal-600 dark:text-eco-teal-400',
    border: 'border-eco-teal-200 dark:border-eco-teal-800',
  },
  'eco-earth': {
    bg: 'bg-eco-earth-50 dark:bg-eco-earth-900/20',
    text: 'text-eco-earth-600 dark:text-eco-earth-400',
    border: 'border-eco-earth-200 dark:border-eco-earth-800',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle green gradient background */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-eco-green-50 via-white to-eco-teal-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 pointer-events-none"
        />
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-eco-green-100 dark:bg-eco-green-900/10 opacity-60 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-eco-teal-100 dark:bg-eco-teal-900/10 opacity-50 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center space-y-8">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eco-green-100 dark:bg-eco-green-900/40 border border-eco-green-200 dark:border-eco-green-700 text-eco-green-700 dark:text-eco-green-400 text-sm font-medium">
            <Leaf className="w-4 h-4" />
            UN SDG 12 — Responsible Consumption &amp; Production
          </span>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            Sort smarter.{' '}
            <span className="text-eco-green-600 dark:text-eco-green-400">
              Waste less.
            </span>
            <br />
            <span className="text-eco-teal-600 dark:text-eco-teal-400">
              Live greener.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            EcoSort AI uses computer vision and generative AI to classify waste correctly,
            deliver disposal guidance, quantify your carbon impact, and reward sustainable habits —
            all for free.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-eco-green-600 hover:bg-eco-green-700 active:bg-eco-green-800 text-white font-bold rounded-2xl text-base transition-colors shadow-md hover:shadow-lg"
            >
              <Camera className="w-5 h-5" />
              Get started — it's free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sign in
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
            No credit card required · Open source · MIT licensed
          </p>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-eco-green-600 dark:bg-eco-green-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label, suffix }) => (
            <div key={label} className="space-y-1">
              <p className="text-4xl font-extrabold text-white">
                {value}
                <span className="text-eco-green-200">{suffix}</span>
              </p>
              <p className="text-sm text-eco-green-100 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-14">
        <div className="text-center space-y-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-eco-green-600 dark:text-eco-green-400">
            How it works
          </span>
          <h2 className="text-4xl font-extrabold">Four steps to smarter waste disposal</h2>
          <p className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
            From snap to impact in seconds — EcoSort AI does the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative group space-y-4">
              {/* Step number connector line */}
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-eco-green-600 text-white font-bold text-sm flex items-center justify-center">
                  {step}
                </span>
                <div className="h-px flex-1 bg-eco-green-200 dark:bg-eco-green-800 hidden lg:block" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-eco-green-50 dark:bg-eco-green-900/30 flex items-center justify-center">
                <Icon className="w-6 h-6 text-eco-green-600 dark:text-eco-green-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-eco-teal-600 dark:text-eco-teal-400">
              Features
            </span>
            <h2 className="text-4xl font-extrabold">Everything you need to sort right</h2>
            <p className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
              Built for everyday users, educators, and sustainability champions alike.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow space-y-4"
                >
                  <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WASTE CATEGORIES ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-eco-earth-600 dark:text-eco-earth-400">
            Coverage
          </span>
          <h2 className="text-4xl font-extrabold">10 waste categories recognised</h2>
          <p className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
            Our model is trained on thousands of real-world images across all major waste types.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {WASTE_CATEGORIES.map(({ emoji, name, recyclable }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-eco-green-300 dark:hover:border-eco-green-700 transition-colors text-center"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  recyclable
                    ? 'bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {recyclable ? '♻ Recyclable' : '🗑 Non-recyclable'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-eco-green-600 dark:bg-eco-green-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Ready to make every scan count?
          </h2>
          <p className="text-eco-green-100 text-xl leading-relaxed">
            Join thousands of users reducing waste misdirection and tracking their environmental
            impact — for free, forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-eco-green-700 font-bold rounded-2xl text-base hover:bg-eco-green-50 transition-colors shadow-md"
            >
              <Leaf className="w-5 h-5" />
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-2xl text-base hover:bg-eco-green-700 dark:hover:bg-eco-green-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-eco-green-200 text-sm">
            Open source · MIT License ·{' '}
            <a
              href="https://sdgs.un.org/goals/goal12"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              SDG 12
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
