// Types
export interface WasteCategory {
  name: string;
  emoji: string;
  description: string;
  dos: string[];
  donts: string[];
  facilityType: string;
  recyclable: boolean;
  hazardous: boolean;
}

export interface RecyclingSymbol {
  code: string;
  name: string;
  materials: string;
  recyclable: boolean;
  note: string;
}

export interface EcoTip {
  tip: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SDG12Fact {
  stat: string;
  label: string;
  source: string;
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    name: 'Paper',
    emoji: '📄',
    description: 'Paper and cardboard products are among the most recyclable materials. Recycling paper saves trees, water, and energy compared to producing virgin paper.',
    dos: ['Flatten cardboard boxes', 'Keep paper dry and clean', 'Remove plastic windows from envelopes', 'Recycle newspapers and magazines'],
    donts: ['Recycle greasy or food-soiled paper', 'Include tissues or paper towels', 'Mix shredded paper loose in recycling', 'Recycle wax-coated paper'],
    facilityType: 'Kerbside Recycling or Paper Bank',
    recyclable: true,
    hazardous: false,
  },
  {
    name: 'Plastic',
    emoji: '🧴',
    description: 'Plastic recycling rates vary by resin type. Check the resin code (♻ number) on the item. PET (1) and HDPE (2) are most widely accepted; PVC (3) and polystyrene (6) are often not collected kerbside.',
    dos: ['Rinse containers before recycling', 'Check resin code on item', 'Crush bottles to save space', 'Take soft plastics to supermarket drop-off'],
    donts: ['Recycle plastic bags in kerbside bins', 'Include black plastic trays if unsure', 'Recycle dirty or contaminated plastics', 'Put polystyrene in standard recycling'],
    facilityType: 'Kerbside Recycling (rigid) or Supermarket Drop-off (soft)',
    recyclable: true,
    hazardous: false,
  },
  {
    name: 'Glass',
    emoji: '🍾',
    description: 'Glass is 100% recyclable and can be recycled endlessly without quality loss. Keep it sorted by colour where required by your local scheme.',
    dos: ['Rinse jars and bottles', 'Remove metal lids (recycle separately)', 'Keep glass colour-sorted if required', 'Use bottle banks for collection'],
    donts: ['Put broken glass in kerbside bins loose', 'Include ceramics or pyrex', 'Mix with general waste', 'Leave caps on if glass-only bins'],
    facilityType: 'Bottle Bank or Household Waste Recycling Centre',
    recyclable: true,
    hazardous: false,
  },
  {
    name: 'Metal',
    emoji: '🥫',
    description: 'Aluminium and steel cans are infinitely recyclable. Recycling aluminium saves up to 95% of the energy needed to produce new aluminium from bauxite ore.',
    dos: ['Rinse cans and tins', 'Scrunch aluminium foil into a ball', 'Recycle aerosol cans (empty)', 'Include metal lids from glass jars'],
    donts: ['Include pressurised canisters that are not empty', 'Mix with food waste', 'Throw scrap metal in kerbside bins', 'Ignore small metal items like bottle caps'],
    facilityType: 'Kerbside Recycling or Scrap Metal Dealer',
    recyclable: true,
    hazardous: false,
  },
  {
    name: 'Food/Organic',
    emoji: '🍎',
    description: 'Food waste in landfill generates methane — a greenhouse gas 80× more potent than CO₂ over 20 years. Composting or anaerobic digestion converts waste into compost or biogas.',
    dos: ['Use a food caddy for kerbside collection', 'Compost fruit and vegetable scraps', 'Compost garden waste', 'Check local food waste collection schedules'],
    donts: ['Put food waste in general recycling', 'Compost meat or cooked food in open compost bins', 'Include packaging with food waste', 'Waste food — plan meals to reduce surplus'],
    facilityType: 'Kerbside Food Waste Collection or Home Compost',
    recyclable: false,
    hazardous: false,
  },
  {
    name: 'E-Waste',
    emoji: '💻',
    description: 'Electronic waste contains valuable metals (gold, silver, copper) but also hazardous substances (lead, mercury, cadmium). It must never go in general waste or recycling bins.',
    dos: ['Back up and wipe data before disposal', 'Use certified e-waste recyclers', 'Donate working devices to charities', 'Return old phones to retailer take-back schemes'],
    donts: ['Put e-waste in general waste', 'Remove batteries without care', 'Discard in kerbside recycling', 'Burn or dismantle e-waste at home'],
    facilityType: 'Certified E-Waste Recycler or Retailer Take-Back',
    recyclable: true,
    hazardous: true,
  },
  {
    name: 'Medical',
    emoji: '💊',
    description: 'Medical waste poses infection and contamination risks. Sharps require special puncture-resistant containers, and medicines must be returned to pharmacies to prevent water contamination.',
    dos: ['Use a sharps container for needles and syringes', 'Return unused medicines to pharmacy', 'Seal medical waste in labelled bags', 'Follow local health authority guidelines'],
    donts: ['Flush medicines down the toilet or sink', 'Put sharps in general waste', 'Mix with household recycling', 'Burn medical waste at home'],
    facilityType: 'Pharmacy Take-Back or Clinical Waste Service',
    recyclable: false,
    hazardous: true,
  },
  {
    name: 'Hazardous',
    emoji: '⚠️',
    description: 'Household hazardous waste includes paints, solvents, pesticides, and chemical containers. Improper disposal contaminates groundwater and harms ecosystems.',
    dos: ['Keep in original labelled containers', 'Take to Household Hazardous Waste events', 'Check council website for collection dates', 'Share leftover usable paint with neighbours or community groups'],
    donts: ['Pour chemicals down drains', 'Put in general waste bins', 'Mix different chemicals together', 'Burn hazardous waste'],
    facilityType: 'Household Hazardous Waste (HHW) Drop-off Facility',
    recyclable: false,
    hazardous: true,
  },
  {
    name: 'Textile',
    emoji: '👕',
    description: "The fashion industry produces ~10% of global carbon emissions. Extending a garment's life by 9 months reduces its carbon, water, and waste footprint by 20–30%.",
    dos: ['Donate wearable clothes to charity shops', 'Use clothing banks for worn items', 'Choose natural fibres to reduce microplastic shedding', 'Repair before discarding'],
    donts: ['Put textiles in kerbside recycling', 'Donate items in very poor condition', 'Throw shoes in general waste without checking', 'Buy fast fashion unnecessarily'],
    facilityType: 'Charity Shop, Clothing Bank, or Retailer Take-Back',
    recyclable: true,
    hazardous: false,
  },
  {
    name: 'General',
    emoji: '🗑️',
    description: 'Residual waste cannot currently be recycled or composted. Reducing general waste starts with choosing products designed for recyclability and buying only what you need.',
    dos: ['Minimise volume before disposal', 'Check if items can be broken into recyclable parts', 'Use general waste only as a last resort', 'Contact your council for guidance on unusual items'],
    donts: ['Put recyclables in general waste', 'Include hazardous items in general waste', 'Fly-tip or dump waste illegally', 'Contaminate other streams by careless sorting'],
    facilityType: 'General Waste (Residual) Collection',
    recyclable: false,
    hazardous: false,
  },
];

export const RECYCLING_SYMBOLS: RecyclingSymbol[] = [
  { code: '1', name: 'PET / PETE', materials: 'Water bottles, fizzy drink bottles, food containers', recyclable: true, note: 'Widely recycled kerbside. Rinse before recycling.' },
  { code: '2', name: 'HDPE', materials: 'Milk jugs, shampoo bottles, detergent containers', recyclable: true, note: 'Widely accepted. One of the easiest plastics to recycle.' },
  { code: '3', name: 'PVC', materials: 'Pipes, window frames, some food wrap', recyclable: false, note: 'Rarely accepted kerbside. Contains chlorine — special handling required.' },
  { code: '4', name: 'LDPE', materials: 'Plastic bags, squeezable bottles, cling film', recyclable: false, note: 'Not in kerbside bins. Take to supermarket soft-plastic drop-off schemes.' },
  { code: '5', name: 'PP', materials: 'Yoghurt pots, bottle caps, food containers', recyclable: true, note: 'Increasingly accepted kerbside. Check with your local council.' },
  { code: '6', name: 'PS / Polystyrene', materials: 'Foam cups, takeaway containers, packing peanuts', recyclable: false, note: 'Rarely recyclable kerbside. Seek specialist drop-off facilities.' },
  { code: '7', name: 'Other', materials: 'Multi-layer plastics, some food packaging', recyclable: false, note: 'Mixed/layered plastics are usually not recyclable. Avoid where possible.' },
  { code: '♻ Green Dot', name: 'Green Dot (Grüner Punkt)', materials: 'Used across Europe on packaging', recyclable: true, note: 'Does not mean the item is recyclable — indicates the producer contributes to recycling schemes.' },
  { code: '♻ Mobius Loop', name: 'Möbius Loop (Universal Recycle Symbol)', materials: 'General packaging', recyclable: true, note: 'Indicates the item is recyclable, but check local scheme acceptability.' },
  { code: 'FSC', name: 'FSC Certified', materials: 'Paper and wood products', recyclable: true, note: 'Forest Stewardship Council certified — sourced from responsibly managed forests.' },
  { code: 'GL 70–74', name: 'Glass Recycling Codes', materials: 'Clear (70), green (71), brown (72) glass', recyclable: true, note: 'Sort by colour where your local scheme requires it.' },
  { code: 'FE 40 / ALU 41', name: 'Steel & Aluminium', materials: 'Steel cans (FE 40), aluminium cans (ALU 41)', recyclable: true, note: 'Both widely recycled kerbside. Rinse before placing in recycling.' },
];

export const ECO_TIPS: EcoTip[] = [
  { tip: 'Carry a reusable bag to eliminate single-use plastic bags — the average person uses 500 per year.', category: 'Plastic', impact: 'high' },
  { tip: 'Switch to a reusable water bottle; producing a single plastic bottle emits ~100 g CO₂e.', category: 'Plastic', impact: 'high' },
  { tip: 'Plan your meals for the week to avoid buying more food than you need.', category: 'Food/Organic', impact: 'high' },
  { tip: 'Compost food scraps at home — composting 1 kg of food waste avoids ~0.5 kg CO₂e vs landfill.', category: 'Food/Organic', impact: 'high' },
  { tip: 'Buy second-hand clothing before purchasing new — the fashion industry is responsible for ~10% of global emissions.', category: 'Textile', impact: 'high' },
  { tip: 'Repair clothes instead of discarding: extending garment life by 9 months cuts its carbon footprint by 20–30%.', category: 'Textile', impact: 'high' },
  { tip: 'Return old electronics to retailer take-back schemes — e-waste contains gold, silver, and copper worth recovering.', category: 'E-Waste', impact: 'high' },
  { tip: 'Choose products with minimal or recyclable packaging to reduce the waste you generate at source.', category: 'General', impact: 'medium' },
  { tip: 'Use both sides of paper before recycling — paper production consumes 10 litres of water per A4 sheet.', category: 'Paper', impact: 'medium' },
  { tip: 'Switch to digital billing and statements to cut paper waste at home.', category: 'Paper', impact: 'medium' },
  { tip: 'Rinse cans, jars, and bottles before recycling — contamination can cause entire truckloads to go to landfill.', category: 'General', impact: 'medium' },
  { tip: 'Buy drinks in aluminium cans: they are recycled and back on the shelf within 60 days.', category: 'Metal', impact: 'medium' },
  { tip: 'Opt for glass jars and reuse them for food storage before eventually recycling.', category: 'Glass', impact: 'medium' },
  { tip: 'Never pour cooking oil down the drain — 1 litre can contaminate 1 million litres of water. Collect and recycle it.', category: 'Hazardous', impact: 'high' },
  { tip: 'Return unused medicines to a pharmacy; flushing them contaminates drinking water with active pharmaceutical compounds.', category: 'Medical', impact: 'high' },
  { tip: 'Take paint and solvents to a Household Hazardous Waste facility — they can often be reprocessed and donated.', category: 'Hazardous', impact: 'medium' },
  { tip: 'Donate working electronics to schools, charities, or refurbishers before sending to e-waste recycling.', category: 'E-Waste', impact: 'medium' },
  { tip: 'Scrunch aluminium foil into a ball larger than a golf ball before recycling — smaller pieces fall through sorting machines.', category: 'Metal', impact: 'low' },
  { tip: 'Choose natural fibre clothing (cotton, linen, wool) over synthetics to reduce microplastic shedding in washing.', category: 'Textile', impact: 'medium' },
  { tip: 'Use a Bokashi bin for cooked food waste — it ferments all food scraps including meat and dairy.', category: 'Food/Organic', impact: 'medium' },
  { tip: 'Check the resin code (♻ number) on plastic items before recycling — not all plastics are accepted kerbside.', category: 'Plastic', impact: 'low' },
  { tip: 'Store leftover paint in a sealed container, label it, and donate to community projects via your local authority.', category: 'Hazardous', impact: 'low' },
];

export const SDG12_FACTS: SDG12Fact[] = [
  { stat: '2.01 billion', label: 'tonnes of municipal solid waste generated globally each year', source: 'World Bank, What a Waste 2.0, 2018' },
  { stat: '33%', label: 'of global food produced for human consumption is lost or wasted annually', source: 'FAO, 2019' },
  { stat: '10%', label: 'of global greenhouse gas emissions come from the fashion industry', source: 'UNEP, 2018' },
  { stat: '53.6 million', label: 'metric tonnes of e-waste generated worldwide in 2019 — only 17.4% formally recycled', source: 'Global E-waste Monitor, 2020' },
  { stat: '91%', label: 'of plastic is never recycled — it ends up in landfill, incineration, or the environment', source: 'Science, Geyer et al., 2017' },
  { stat: '8 million', label: 'tonnes of plastic enters the ocean every year', source: 'Ocean Conservancy / McKinsey, 2015' },
  { stat: '1.3 billion', label: 'tonnes of food wasted per year generates 3.3 Gt CO₂e — if it were a country it would be the 3rd largest emitter', source: 'FAO, 2013' },
  { stat: 'SDG 12.5', label: 'target: by 2030, substantially reduce waste generation through prevention, reduction, recycling and reuse', source: 'UN Sustainable Development Goals, 2015' },
];
