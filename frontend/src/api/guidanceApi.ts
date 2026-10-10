import apiClient from '../lib/apiClient';

export interface GuidanceResult {
  category: string;
  sub_category: string;
  disposal_steps: string[];
  sustainability_tips: string[];
  facility_type: string;
  recyclable: boolean;
  hazardous: boolean;
  explanation: string;
}

const FALLBACK_GUIDANCE_MAP: Record<string, Omit<GuidanceResult, 'category' | 'sub_category'>> = {
  Paper: {
    disposal_steps: [
      'Flatten cardboard boxes to maximize bin capacity',
      'Remove plastic windows, tape, and bubblewrap from packaging',
      'Keep paper dry and free of greasy food stains',
      'Place in the designated Blue Paper/Cardboard recycling bin',
    ],
    sustainability_tips: [
      'Choose FSC-certified recycled paper products',
      'Use both sides of printing sheets before recycling',
      'Reuse packing boxes for household storage',
    ],
    facility_type: 'Kerbside Paper Recycling or Local Paper Bank',
    recyclable: true,
    hazardous: false,
    explanation:
      'Paper and cardboard are highly recyclable pulp fibers. Recycling one tonne saves 17 trees, 26,000 litres of water, and avoids substantial landfill methane generation.',
  },
  Plastic: {
    disposal_steps: [
      'Check the resin identification code (1-PET or 2-HDPE are most accepted)',
      'Rinse out liquid and food residue with a splash of water',
      'Replace screw caps on bottles or separate according to local policy',
      'Place rigid plastics in the Yellow/Mixed Recycling bin; soft films to grocery collection',
    ],
    sustainability_tips: [
      'Switch to reusable stainless steel or glass drink bottles',
      'Choose concentrated refill packs over single-use bottles',
      'Avoid polystyrene foam and non-recyclable black plastic trays',
    ],
    facility_type: 'Kerbside Plastic Recycling (Rigid) or Supermarket Drop-off (Films)',
    recyclable: true,
    hazardous: false,
    explanation:
      'PET (beverage bottles) and HDPE (milk jugs, detergents) are widely recycled into new bottles and textiles. Recycling plastic saves ~1.5 kg CO2e per kg compared to virgin fossil feedstocks.',
  },
  Glass: {
    disposal_steps: [
      'Rinse bottles and jars clean of residual contents',
      'Remove metal caps (recycle separately in the metal bin)',
      'Sort by colour (clear, green, brown) if required by municipal scheme',
      'Place into the Green Glass bottle bank or kerbside glass box',
    ],
    sustainability_tips: [
      'Reuse glass containers for pantry bulk goods storage',
      'Opt for deposit-return beverage glass schemes where available',
      'Never put Pyrex, cookware, or window panes into standard glass bins',
    ],
    facility_type: 'Local Bottle Bank or Kerbside Glass Container',
    recyclable: true,
    hazardous: false,
    explanation:
      'Glass is 100% endlessly recyclable with zero degradation in purity or mechanical quality. One recycled glass bottle saves enough energy to power a laptop for 30 minutes.',
  },
  Metal: {
    disposal_steps: [
      'Rinse beverage and food cans clean of residue',
      'Tuck metal lids inside cans or press flat',
      'Crush aluminum cans to save space',
      'Place in Yellow/Metal recycling receptacle',
    ],
    sustainability_tips: [
      'Aluminium recycling saves 95% of the energy needed for virgin bauxite smelting',
      'Scrap metal from home projects can be cashed at local scrap depots',
      'Avoid placing batteries or pressurised aerosol canisters with loose cans',
    ],
    facility_type: 'Kerbside Mixed Metal Recycling or Scrap Metal Depot',
    recyclable: true,
    hazardous: false,
    explanation:
      'Aluminium and steel are infinitely recyclable closed-loop metals. Recycling an aluminium can avoids over 9 kg CO2e per ton compared to raw mineral extraction.',
  },
  'Food/Organic': {
    disposal_steps: [
      'Remove plastic stickers, tags, and rubber bands from fruit/veg',
      'Place peelings, scraps, and coffee grounds into a kitchen caddy',
      'Line with certified compostable paper liner or no bag',
      'Transfer to municipal Brown Food Waste Bin or home compost pile',
    ],
    sustainability_tips: [
      'Store vegetable scraps in the freezer for homemade vegetable broth',
      'Plan weekly meals to minimize perishable food spoilage',
      'Use home composting to enrich garden soils naturally without chemical fertilizers',
    ],
    facility_type: 'Municipal Organic Compost Collection or Anaerobic Digestion Plant',
    recyclable: true,
    hazardous: false,
    explanation:
      'Composting food waste diverts organics from anaerobic landfill decomposition, eliminating potent methane emissions and producing nutrient-rich organic compost.',
  },
  'E-Waste': {
    disposal_steps: [
      'Backup data and perform a factory reset on electronic devices',
      'Remove removable batteries and tape lithium contacts',
      'Bundle accompanying cables and charging bricks',
      'Take to a certified e-waste drop-off box or electronics retailer recycling station',
    ],
    sustainability_tips: [
      'Donate working devices to community refurbishment programs',
      'Check manufacturer trade-in programs for credit towards upgrades',
      'Repair replaceable parts before retiring devices',
    ],
    facility_type: 'Municipal E-Waste Recycling Depot or Authorized Electronics Drop-off',
    recyclable: true,
    hazardous: true,
    explanation:
      'Electronics contain critical rare earth minerals (gold, copper, lithium) alongside hazardous heavy metals (lead, cadmium). Proper e-waste recycling reclaims rare materials while preventing toxic soil contamination.',
  },
  Medical: {
    disposal_steps: [
      'Never place needles or sharps loose in household rubbish',
      'Place sharps in a rigid, puncture-proof sharps disposal bin',
      'Return expired or unused pharmaceuticals to a pharmacy take-back scheme',
      'Seal packaging before authorized clinical disposal',
    ],
    sustainability_tips: [
      'Never flush medications down the toilet to protect aquatic ecosystems',
      'Participate in national Drug Take Back events',
      'Separate clean outer cardboard packaging for standard recycling',
    ],
    facility_type: 'Pharmacy Take-Back Program or Medical Waste Collection Depot',
    recyclable: false,
    hazardous: true,
    explanation:
      'Medical and pharmaceutical waste requires high-temperature regulated incineration to neutralise biohazards and prevent contamination of regional water tables.',
  },
  Hazardous: {
    disposal_steps: [
      'Keep chemicals in their original labelled containers',
      'Ensure container lids and caps are tightly sealed',
      'Do not mix different chemicals together',
      'Transport safely upright to a local Household Hazardous Waste (HHW) event',
    ],
    sustainability_tips: [
      'Choose eco-friendly non-toxic household cleaning alternatives',
      'Buy only the volume of paint or solvent needed for the job',
      'Share leftover DIY chemicals with neighbours or community workshops',
    ],
    facility_type: 'Council Household Hazardous Waste Facility (HHW)',
    recyclable: false,
    hazardous: true,
    explanation:
      'Hazardous materials (pesticides, automotive oils, solvents) pose serious fire and chemical risks and must never enter wastewater drains or landfill bins.',
  },
  Textile: {
    disposal_steps: [
      'Wash and ensure garments are completely dry',
      'Sort reusable clothing from damaged rags',
      'Place in a moisture-sealed bag',
      'Deposit in a designated Textile Clothing Bank or charity drop-off',
    ],
    sustainability_tips: [
      'Mend minor tears and missing buttons before discarding',
      'Repurpose unwearable textiles as cleaning rags',
      'Participate in clothing swaps or thrift donation stores',
    ],
    facility_type: 'Textile Recycling Bank or Charity Donation Point',
    recyclable: true,
    hazardous: false,
    explanation:
      'Textiles take decades to decompose in landfills and release dye chemicals. Reusing and recycling garments avoids virgin textile production, which is heavily water- and carbon-intensive.',
  },
  General: {
    disposal_steps: [
      'Ensure no recyclable materials or hazardous batteries are mixed inside',
      'Bag waste securely to prevent windblown street litter',
      'Place inside the standard Grey/Black Landfill Residual wheelie bin',
    ],
    sustainability_tips: [
      'Perform a weekly waste audit to identify non-recyclables you can swap out',
      'Avoid single-use disposable items with no recycling path',
      'Opt for compostable or minimal packaging alternatives',
    ],
    facility_type: 'Municipal Kerbside Residual Waste (Energy-from-Waste / Landfill)',
    recyclable: false,
    hazardous: false,
    explanation:
      'Residual general waste is directed to modern Energy-from-Waste (EfW) incineration or managed sanitary landfill sites when material cannot be reclaimed.',
  },
};

export async function getGuidance(
  category: string,
  sub_category: string,
  location_hint?: string,
): Promise<GuidanceResult> {
  try {
    const { data } = await apiClient.post<GuidanceResult>('/guidance', {
      category,
      sub_category,
      location_hint: location_hint ?? null,
    }, { timeout: 8000 });

    if (data && data.disposal_steps && data.disposal_steps.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[getGuidance] Backend unavailable, using built-in guidance database:', err);
  }

  // Fallback to rich guidance data
  const fallback = FALLBACK_GUIDANCE_MAP[category] ?? FALLBACK_GUIDANCE_MAP['General'];
  return {
    category,
    sub_category,
    disposal_steps: fallback.disposal_steps,
    sustainability_tips: fallback.sustainability_tips,
    facility_type: fallback.facility_type,
    recyclable: fallback.recyclable,
    hazardous: fallback.hazardous,
    explanation: fallback.explanation,
  };
}
