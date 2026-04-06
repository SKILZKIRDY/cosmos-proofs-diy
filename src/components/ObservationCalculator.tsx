import { useState, useMemo, useCallback } from 'react';
import { Eye, Mountain, Ruler, Calculator, RotateCcw, Copy, Check, ChevronDown, ChevronUp, ArrowLeftRight, Plus, Trash2, X, Layers, Share2, Send } from 'lucide-react';
import type { CalculationData } from '@/lib/submissionService';




// ─── Constants ───────────────────────────────────────────────────────────────
const EARTH_RADIUS_MI = 3959;
const EARTH_RADIUS_FT = EARTH_RADIUS_MI * 5280;

// ─── Conversions ─────────────────────────────────────────────────────────────
const ftToM = (ft: number) => ft * 0.3048;
const mToFt = (m: number) => m / 0.3048;
const miToKm = (mi: number) => mi * 1.60934;
const kmToMi = (km: number) => km / 1.60934;
const miToFt = (mi: number) => mi * 5280;

type HeightUnit = 'feet' | 'meters';
type DistUnit = 'miles' | 'km';

interface Results {
  horizonMi: number;
  horizonKm: number;
  hiddenFt: number;
  hiddenM: number;
  visibleFt: number;
  visibleM: number;
  fullyVisible: boolean;
  fullyHidden: boolean;
  angleDeg: number;
  obsFt: number;
  tgtFt: number;
  distMi: number;
}

interface ComparisonEntry {
  id: string;
  label: string;
  obsHeight: string;
  obsUnit: HeightUnit;
  tgtHeight: string;
  tgtUnit: HeightUnit;
  dist: string;
  distUnit: DistUnit;
  results: Results;
}

function compute(
  obsH: number, obsU: HeightUnit,
  tgtH: number, tgtU: HeightUnit,
  dist: number, distU: DistUnit
): Results | null {
  const obsFt = obsU === 'meters' ? mToFt(obsH) : obsH;
  const tgtFt = tgtU === 'meters' ? mToFt(tgtH) : tgtH;
  const distMi = distU === 'km' ? kmToMi(dist) : dist;
  if (distMi <= 0) return null;

  const horizonMi = Math.sqrt(2 * EARTH_RADIUS_MI * (obsFt / 5280));
  let hiddenFt = 0;
  if (distMi > horizonMi) {
    const beyond = distMi - horizonMi;
    hiddenFt = (beyond * beyond * 5280 * 5280) / (2 * EARTH_RADIUS_FT);
  }

  const visibleFt = Math.max(0, tgtFt - hiddenFt);
  const distFt = miToFt(distMi);
  const angleDeg = Math.atan2(tgtFt - obsFt, distFt) * (180 / Math.PI);

  return {
    horizonMi,
    horizonKm: miToKm(horizonMi),
    hiddenFt,
    hiddenM: ftToM(hiddenFt),
    visibleFt,
    visibleM: ftToM(visibleFt),
    fullyVisible: hiddenFt <= 0,
    fullyHidden: hiddenFt >= tgtFt && tgtFt > 0,
    angleDeg,
    obsFt,
    tgtFt,
    distMi,
  };
}

// ─── Mini Diagram ────────────────────────────────────────────────────────────
function MiniDiagram({ r }: { r: Results }) {
  const W = 360;
  const H = 140;
  const gY = 105; // ground Y
  const oX = 40;
  const tX = W - 40;
  const midX = W / 2;

  const maxH = Math.max(r.obsFt, r.tgtFt, 1);
  const s = Math.min(55 / maxH, 2);
  const oH = Math.max(r.obsFt * s, 4);
  const tH = Math.max(r.tgtFt * s, 4);
  const hH = Math.min((r.hiddenFt / Math.max(r.tgtFt, 1)) * tH, tH);
  const vH = tH - hH;

  const hFrac = r.distMi > 0 ? Math.min(r.horizonMi / r.distMi, 1) : 0.5;
  const hX = oX + (tX - oX) * hFrac;
  const curve = Math.min(18, (r.distMi / Math.max(r.horizonMi * 2, 1)) * 18);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 140 }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect x="0" y="0" width={W} height={gY} fill="url(#sg)" rx="8" />
      {/* Curved earth */}
      <path d={`M ${oX} ${gY} Q ${midX} ${gY + curve} ${tX} ${gY} L ${tX} ${H} L ${oX} ${H} Z`} fill="#dcfce7" opacity="0.5" />
      <path d={`M ${oX} ${gY} Q ${midX} ${gY + curve} ${tX} ${gY}`} fill="none" stroke="#86efac" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Horizon dot */}
      <circle cx={hX} cy={gY} r="3" fill="#f59e0b" />
      <text x={hX} y={gY + 14} textAnchor="middle" fontSize="8" fontWeight="600" fill="#b45309">Horizon</text>
      {/* Observer */}
      <rect x={oX - 5} y={gY - oH} width={10} height={oH} rx="2" fill="#60a5fa" />
      <circle cx={oX} cy={gY - oH - 5} r="4" fill="#3b82f6" />
      <text x={oX} y={gY + 14} textAnchor="middle" fontSize="8" fontWeight="600" fill="#1e40af">You</text>
      {/* Target hidden */}
      {hH > 0 && (
        <rect x={tX - 6} y={gY - hH} width={12} height={hH} rx="1" fill="#fca5a5" opacity="0.5" strokeDasharray="2 2" stroke="#ef4444" strokeWidth="0.5" />
      )}
      {/* Target visible */}
      {vH > 0 && (
        <rect x={tX - 6} y={gY - tH} width={12} height={vH} rx="1" fill="#6ee7b7" stroke="#059669" strokeWidth="1" />
      )}
      <text x={tX} y={gY + 14} textAnchor="middle" fontSize="8" fontWeight="600" fill="#064e3b">Target</text>
      {/* Line of sight */}
      <line x1={oX} y1={gY - oH - 5} x2={tX} y2={gY - tH} stroke="#6366f1" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
      {/* Distance label */}
      <text x={midX} y={gY + 28} textAnchor="middle" fontSize="8" fill="#64748b">
        {r.distMi.toFixed(1)} mi
      </text>
    </svg>
  );
}

// ─── Status helpers ──────────────────────────────────────────────────────────
function statusLabel(r: Results) {
  if (r.fullyVisible) return 'Visible';
  if (r.fullyHidden) return 'Hidden';
  return 'Partial';
}
function statusColor(r: Results) {
  if (r.fullyVisible) return 'bg-green-100 text-green-700 border-green-200';
  if (r.fullyHidden) return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}
function statusDot(r: Results) {
  if (r.fullyVisible) return 'bg-green-500';
  if (r.fullyHidden) return 'bg-red-500';
  return 'bg-amber-500';
}

// ─── Comparison Card ─────────────────────────────────────────────────────────
function ComparisonCard({ entry, index, onRemove }: { entry: ComparisonEntry; index: number; onRemove: () => void }) {
  const r = entry.results;
  const colors = [
    'from-cyan-500/10 to-blue-500/10 border-cyan-200',
    'from-violet-500/10 to-purple-500/10 border-violet-200',
    'from-amber-500/10 to-orange-500/10 border-amber-200',
    'from-emerald-500/10 to-teal-500/10 border-emerald-200',
    'from-rose-500/10 to-pink-500/10 border-rose-200',
  ];
  const labelColors = [
    'bg-cyan-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-emerald-600',
    'bg-rose-600',
  ];

  return (
    <div className={`relative bg-gradient-to-br ${colors[index % 5]} border rounded-xl p-3 transition-all hover:shadow-md group`}>
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-300"
        title="Remove entry"
      >
        <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
      </button>

      {/* Label badge */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`${labelColors[index % 5]} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
          #{index + 1}
        </span>
        <span className="text-[11px] font-semibold text-gray-700 truncate">{entry.label}</span>
      </div>

      {/* Inputs summary */}
      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
        <div className="bg-white/70 rounded-lg px-2 py-1.5 text-center">
          <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Observer</div>
          <div className="text-xs font-bold text-gray-800">{entry.obsHeight} {entry.obsUnit === 'feet' ? 'ft' : 'm'}</div>
        </div>
        <div className="bg-white/70 rounded-lg px-2 py-1.5 text-center">
          <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Target</div>
          <div className="text-xs font-bold text-gray-800">{entry.tgtHeight} {entry.tgtUnit === 'feet' ? 'ft' : 'm'}</div>
        </div>
        <div className="bg-white/70 rounded-lg px-2 py-1.5 text-center">
          <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Distance</div>
          <div className="text-xs font-bold text-gray-800">{entry.dist} {entry.distUnit}</div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-medium">Horizon</span>
          <span className="text-xs font-bold text-gray-800">{r.horizonMi.toFixed(2)} mi</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-medium">Hidden</span>
          <span className="text-xs font-bold text-gray-800">
            {r.fullyVisible ? '0 ft' : r.fullyHidden ? `All (${r.tgtFt.toFixed(0)} ft)` : `${r.hiddenFt.toFixed(1)} ft`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-medium">Angle</span>
          <span className="text-xs font-bold text-gray-800">{r.angleDeg.toFixed(4)}&deg;</span>
        </div>
      </div>

      {/* Status */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDot(r)}`} />
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusColor(r)}`}>
          {statusLabel(r)}
        </span>
      </div>
    </div>
  );
}

// ─── Comparison Table ────────────────────────────────────────────────────────
function ComparisonTable({ entries, onRemove }: { entries: ComparisonEntry[]; onRemove: (id: string) => void }) {
  const labelColors = [
    'bg-cyan-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-emerald-600',
    'bg-rose-600',
  ];

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">#</th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Observer</th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Target</th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Distance</th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Horizon</th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Hidden</th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="py-2 px-1 w-6"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const r = entry.results;
            return (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                <td className="py-2 px-2">
                  <span className={`${labelColors[i % 5]} text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-2 px-2 font-semibold text-gray-700">{entry.obsHeight} {entry.obsUnit === 'feet' ? 'ft' : 'm'}</td>
                <td className="py-2 px-2 font-semibold text-gray-700">{entry.tgtHeight} {entry.tgtUnit === 'feet' ? 'ft' : 'm'}</td>
                <td className="py-2 px-2 font-semibold text-gray-700">{entry.dist} {entry.distUnit}</td>
                <td className="py-2 px-2 font-semibold text-gray-700">{r.horizonMi.toFixed(2)} mi</td>
                <td className="py-2 px-2 font-semibold text-gray-700">
                  {r.fullyVisible ? '0 ft' : r.fullyHidden ? 'All' : `${r.hiddenFt.toFixed(1)} ft`}
                </td>
                <td className="py-2 px-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusColor(r)}`}>
                    {statusLabel(r)}
                  </span>
                </td>
                <td className="py-2 px-1">
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    title="Remove"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ObservationCalculator({
  defaultObserverHeight,
  defaultTargetHeight,
  defaultDistance,
  onSubmitResult,
  isLoggedIn = false,
  onSignInClick,
}: {
  defaultObserverHeight?: string;
  defaultTargetHeight?: string;
  defaultDistance?: string;
  onSubmitResult?: (data: CalculationData) => void;
  isLoggedIn?: boolean;
  onSignInClick?: () => void;
}) {


  const [obsHeight, setObsHeight] = useState(defaultObserverHeight || '6');
  const [obsUnit, setObsUnit] = useState<HeightUnit>('feet');
  const [tgtHeight, setTgtHeight] = useState(defaultTargetHeight || '100');
  const [tgtUnit, setTgtUnit] = useState<HeightUnit>('feet');
  const [dist, setDist] = useState(defaultDistance || '10');
  const [distUnit, setDistUnit] = useState<DistUnit>('miles');
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

  // Share state
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');


  // Compare Mode state
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonEntries, setComparisonEntries] = useState<ComparisonEntry[]>([]);
  const [compareView, setCompareView] = useState<'cards' | 'table'>('cards');
  const [addedFlash, setAddedFlash] = useState(false);

  const MAX_ENTRIES = 5;

  const results = useMemo(() => {
    if (!showResults) return null;
    const o = parseFloat(obsHeight) || 0;
    const t = parseFloat(tgtHeight) || 0;
    const d = parseFloat(dist) || 0;
    return compute(o, obsUnit, t, tgtUnit, d, distUnit);
  }, [obsHeight, obsUnit, tgtHeight, tgtUnit, dist, distUnit, showResults]);

  const handleCalculate = () => setShowResults(true);

  const handleReset = () => {
    setObsHeight('6');
    setObsUnit('feet');
    setTgtHeight('100');
    setTgtUnit('feet');
    setDist('10');
    setDistUnit('miles');
    setShowResults(false);
    setShowDiagram(false);
  };

  const handleCopy = () => {
    if (!results) return;
    const text = [
      `Visibility Test Results`,

      `Observer: ${results.obsFt.toFixed(1)} ft | Target: ${results.tgtFt.toFixed(1)} ft | Distance: ${results.distMi.toFixed(2)} mi`,
      `Horizon: ${results.horizonMi.toFixed(2)} mi (${results.horizonKm.toFixed(2)} km)`,
      `Hidden: ${results.hiddenFt.toFixed(2)} ft (${results.hiddenM.toFixed(2)} m)`,
      `Angle: ${results.angleDeg.toFixed(4)}°`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Share Result ────────────────────────────────────────────────────────────
  const generateShareText = useCallback((r: Results): string => {
    const statusText = r.fullyVisible
      ? 'FULLY VISIBLE'
      : r.fullyHidden
      ? 'FULLY HIDDEN'
      : 'PARTIALLY HIDDEN';

    const hiddenText = r.fullyVisible
      ? '0 ft (0 m)'
      : r.fullyHidden
      ? `All ${r.tgtFt.toFixed(1)} ft (${ftToM(r.tgtFt).toFixed(1)} m)`
      : `${r.hiddenFt.toFixed(2)} ft (${r.hiddenM.toFixed(2)} m)`;

    return [
      `Visibility Test Result`,
      `${'─'.repeat(30)}`,
      ``,
      `Distance: ${r.distMi.toFixed(2)} mi (${r.horizonKm > 0 ? miToKm(r.distMi).toFixed(2) : '0.00'} km)`,
      `Observer Height: ${r.obsFt.toFixed(1)} ft (${ftToM(r.obsFt).toFixed(1)} m)`,
      `Target Height: ${r.tgtFt.toFixed(1)} ft (${ftToM(r.tgtFt).toFixed(1)} m)`,
      ``,
      `Calculated:`,
      `  Horizon Distance: ${r.horizonMi.toFixed(2)} mi (${r.horizonKm.toFixed(2)} km)`,
      `  Hidden Height: ${hiddenText}`,
      `  Viewing Angle: ${r.angleDeg.toFixed(4)}°`,
      ``,
      `Verdict: ${statusText}`,
      ``,
      `Globe model (R = ${EARTH_RADIUS_MI.toLocaleString()} mi). No refraction.`,
    ].join('\n');
  }, []);

  const handleShare = useCallback(async () => {
    if (!results) return;

    const shareText = generateShareText(results);

    // Try native Web Share API first (mobile & supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Visibility Test Result',
          text: shareText,
        });
        setShareState('shared');
        setTimeout(() => setShareState('idle'), 2500);
        return;
      } catch (err: any) {
        // User cancelled or share failed — fall through to clipboard
        if (err?.name === 'AbortError') {
          return; // User cancelled, do nothing
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2500);
    } catch (_err) {

      setShareState('error');
      setTimeout(() => setShareState('idle'), 2500);
    }
  }, [results, generateShareText]);


  const handleAddToComparison = () => {
    if (!results || comparisonEntries.length >= MAX_ENTRIES) return;
    const entry: ComparisonEntry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      label: `${obsHeight}${obsUnit === 'feet' ? 'ft' : 'm'} obs, ${tgtHeight}${tgtUnit === 'feet' ? 'ft' : 'm'} tgt @ ${dist}${distUnit === 'miles' ? 'mi' : 'km'}`,
      obsHeight,
      obsUnit,
      tgtHeight,
      tgtUnit,
      dist,
      distUnit,
      results,
    };
    setComparisonEntries(prev => [...prev, entry]);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 800);
  };

  const handleRemoveEntry = (id: string) => {
    setComparisonEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleClearAll = () => {
    setComparisonEntries([]);
  };

  const handleCopyComparison = () => {
    if (comparisonEntries.length === 0) return;
    const header = 'Visibility Test — Compare Mode Results\n' + '='.repeat(45) + '\n';
    const rows = comparisonEntries.map((e, i) => {
      const r = e.results;
      return [
        `#${i + 1}: ${e.label}`,
        `  Horizon: ${r.horizonMi.toFixed(2)} mi (${r.horizonKm.toFixed(2)} km)`,
        `  Hidden:  ${r.hiddenFt.toFixed(2)} ft (${r.hiddenM.toFixed(2)} m)`,
        `  Angle:   ${r.angleDeg.toFixed(4)}°`,
        `  Status:  ${statusLabel(r)}`,
      ].join('\n');
    }).join('\n\n');
    navigator.clipboard.writeText(header + rows);
  };

  // Recalculate on input change if results are already showing
  const onInput = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (showResults) setShowResults(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Most Used by Researchers
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Run the Visibility Test</h2>
              <p className="text-cyan-200/70 text-xs mt-0.5">Enter your measurements and see what should be visible</p>
            </div>
          </div>
        </div>

        {/* Compare Mode Toggle */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 transition-all duration-300 ${
              compareMode
                ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-300 shadow-sm shadow-indigo-100'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                compareMode ? 'bg-indigo-500 shadow-sm' : 'bg-gray-200'
              }`}>
                <ArrowLeftRight className={`w-3.5 h-3.5 ${compareMode ? 'text-white' : 'text-gray-500'}`} />

              </div>
              <div className="text-left">
                <div className={`text-xs font-semibold ${compareMode ? 'text-indigo-900' : 'text-gray-700'}`}>
                  Compare Mode
                </div>
                <div className="text-[10px] text-gray-400">
                  Run up to {MAX_ENTRIES} calculations side by side
                </div>
              </div>
            </div>
            {/* Toggle switch */}
            <div className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 ${
              compareMode ? 'bg-indigo-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                compareMode ? 'translate-x-[22px]' : 'translate-x-[3px]'
              }`} />
            </div>
          </button>
        </div>

        {/* Inputs */}
        <div className="p-4 space-y-3">
          {/* Observer Height */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              Observer Height
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={obsHeight}
                onChange={(e) => onInput(setObsHeight)(e.target.value)}
                min="0"
                step="any"
                placeholder="6"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
              <select
                value={obsUnit}
                onChange={(e) => { setObsUnit(e.target.value as HeightUnit); if (showResults) setShowResults(true); }}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-medium bg-gray-50 cursor-pointer focus:ring-2 focus:ring-cyan-500"
              >
                <option value="feet">ft</option>
                <option value="meters">m</option>
              </select>
            </div>
          </div>

          {/* Target Height */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              <Mountain className="w-3.5 h-3.5 text-green-500" />
              Target Height
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tgtHeight}
                onChange={(e) => onInput(setTgtHeight)(e.target.value)}
                min="0"
                step="any"
                placeholder="100"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
              <select
                value={tgtUnit}
                onChange={(e) => { setTgtUnit(e.target.value as HeightUnit); if (showResults) setShowResults(true); }}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-medium bg-gray-50 cursor-pointer focus:ring-2 focus:ring-cyan-500"
              >
                <option value="feet">ft</option>
                <option value="meters">m</option>
              </select>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              <Ruler className="w-3.5 h-3.5 text-purple-500" />
              Distance to Target
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={dist}
                onChange={(e) => onInput(setDist)(e.target.value)}
                min="0"
                step="any"
                placeholder="10"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
              <select
                value={distUnit}
                onChange={(e) => { setDistUnit(e.target.value as DistUnit); if (showResults) setShowResults(true); }}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-medium bg-gray-50 cursor-pointer focus:ring-2 focus:ring-cyan-500"
              >
                <option value="miles">mi</option>
                <option value="km">km</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98]"
            >
              <Calculator className="w-4 h-4" />
              Calculate
            </button>
            {/* Add to Comparison button (only in compare mode with results) */}
            {compareMode && results && (
              <button
                onClick={handleAddToComparison}
                disabled={comparisonEntries.length >= MAX_ENTRIES}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] ${
                  comparisonEntries.length >= MAX_ENTRIES
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : addedFlash
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                }`}
                title={comparisonEntries.length >= MAX_ENTRIES ? `Max ${MAX_ENTRIES} entries` : 'Add to comparison'}
              >
                {addedFlash ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{addedFlash ? 'Added' : 'Add'}</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results - inline, compact */}
        {results && (
          <div className="border-t border-gray-100 bg-gray-50/50">
            {/* Status pill */}
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${results.fullyVisible ? 'bg-green-500' : results.fullyHidden ? 'bg-red-500' : 'bg-amber-500'}`} />
                <span className={`text-xs font-semibold ${results.fullyVisible ? 'text-green-700' : results.fullyHidden ? 'text-red-700' : 'text-amber-700'}`}>
                  {results.fullyVisible ? 'Fully Visible' : results.fullyHidden ? 'Fully Hidden' : 'Partially Hidden'}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* 3 result rows - compact */}
            <div className="px-4 pb-3 space-y-2">
              {/* Horizon Distance */}
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Horizon</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{results.horizonMi.toFixed(2)} mi</span>
                  <span className="text-xs text-gray-400 ml-1.5">{results.horizonKm.toFixed(2)} km</span>
                </div>
              </div>

              {/* Hidden Height */}
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${results.fullyVisible ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Mountain className={`w-3.5 h-3.5 ${results.fullyVisible ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Hidden</span>
                </div>
                <div className="text-right">
                  {results.fullyVisible ? (
                    <span className="text-sm font-bold text-green-600">0 ft</span>
                  ) : results.fullyHidden ? (
                    <span className="text-sm font-bold text-red-600">All ({results.tgtFt.toFixed(0)} ft)</span>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-gray-900">{results.hiddenFt.toFixed(1)} ft</span>
                      <span className="text-xs text-gray-400 ml-1.5">{results.hiddenM.toFixed(1)} m</span>
                    </>
                  )}
                </div>
              </div>

              {/* Angle */}
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Ruler className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Angle</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{results.angleDeg.toFixed(4)}&deg;</span>
                </div>
              </div>
            </div>

            {/* ─── Share Result Button ──────────────────────────────────────── */}
            <div className="px-4 pb-3">
              <button
                onClick={handleShare}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${
                  shareState === 'copied'
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : shareState === 'shared'
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : shareState === 'error'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 hover:shadow-lg hover:shadow-slate-500/20'
                }`}
              >
                {shareState === 'copied' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to Clipboard
                  </>
                ) : shareState === 'shared' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Shared Successfully
                  </>
                ) : shareState === 'error' ? (
                  <>
                    <X className="w-4 h-4" />
                    Failed to Share
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share Result
                  </>
                )}
              </button>
              {shareState === 'idle' && (
                <p className="text-[10px] text-gray-300 text-center mt-1.5">
                  {typeof navigator !== 'undefined' && navigator.share
                    ? 'Opens your device share menu'
                    : 'Copies a formatted summary to your clipboard'}
                </p>
              )}
            </div>

            {/* ─── Submit This Result Button ──────────────────────────────── */}
            <div className="px-4 pb-3">
              <button
                onClick={() => {
                  if (!results) return;
                  if (!isLoggedIn) {
                    onSignInClick?.();
                    return;
                  }
                  const calcData: CalculationData = {
                    observerHeight: parseFloat(obsHeight) || 0,
                    observerUnit: obsUnit,
                    targetHeight: parseFloat(tgtHeight) || 0,
                    targetUnit: tgtUnit,
                    distance: parseFloat(dist) || 0,
                    distanceUnit: distUnit,
                    horizonMi: results.horizonMi,
                    horizonKm: results.horizonKm,
                    hiddenFt: results.hiddenFt,
                    hiddenM: results.hiddenM,
                    visibleFt: results.visibleFt,
                    visibleM: results.visibleM,
                    angleDeg: results.angleDeg,
                    fullyVisible: results.fullyVisible,
                    fullyHidden: results.fullyHidden,
                  };
                  onSubmitResult?.(calcData);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                {isLoggedIn ? 'Submit This Result' : 'Sign in to Submit'}
              </button>
              <p className="text-[10px] text-gray-300 text-center mt-1.5">
                {isLoggedIn
                  ? 'Share your real-world observation with the community'
                  : 'Sign in to submit your observation as a community result'}
              </p>
            </div>


            <div className="px-4 pb-3">
              <button
                onClick={() => setShowDiagram(!showDiagram)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showDiagram ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showDiagram ? 'Hide diagram' : 'Show diagram'}
              </button>
              {showDiagram && (
                <div className="mt-1 bg-white rounded-lg border border-gray-200 p-2">
                  <MiniDiagram r={results} />
                </div>
              )}
            </div>

            {/* Compare mode hint when active but no entries yet */}
            {compareMode && comparisonEntries.length === 0 && (
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-500 flex-shrink-0" />

                  <p className="text-[11px] text-indigo-700">
                    Click the <strong className="font-bold">+ Add</strong> button to save this result, then change your inputs and add more to compare.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="px-4 pb-3">
              <p className="text-[10px] text-gray-300 text-center leading-relaxed">
                Globe model (R = {EARTH_RADIUS_MI.toLocaleString()} mi). No refraction.
              </p>
            </div>
          </div>
        )}

        {/* ─── Compare Mode Panel ─────────────────────────────────────────── */}
        {compareMode && comparisonEntries.length > 0 && (
          <div className="border-t-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white">
            {/* Compare header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Comparison</h3>
                  <p className="text-[10px] text-gray-400">{comparisonEntries.length} of {MAX_ENTRIES} scenarios</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* View toggle */}
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setCompareView('cards')}
                    className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                      compareView === 'cards' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setCompareView('table')}
                    className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                      compareView === 'table' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Table
                  </button>
                </div>
                {/* Copy comparison */}
                <button
                  onClick={handleCopyComparison}
                  className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                  title="Copy all results"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {/* Clear all */}
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Entries capacity bar */}
            <div className="px-4 pb-2">
              <div className="flex gap-1">
                {Array.from({ length: MAX_ENTRIES }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i < comparisonEntries.length ? 'bg-indigo-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Card view */}
            {compareView === 'cards' && (
              <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {comparisonEntries.map((entry, i) => (
                  <ComparisonCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onRemove={() => handleRemoveEntry(entry.id)}
                  />
                ))}
              </div>
            )}

            {/* Table view */}
            {compareView === 'table' && (
              <div className="px-4 pb-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <ComparisonTable entries={comparisonEntries} onRemove={handleRemoveEntry} />
                </div>
              </div>
            )}

            {/* Comparison insights */}
            {comparisonEntries.length >= 2 && (
              <div className="px-4 pb-4">
                <ComparisonInsights entries={comparisonEntries} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Comparison Insights ─────────────────────────────────────────────────────
function ComparisonInsights({ entries }: { entries: ComparisonEntry[] }) {
  const maxHorizon = entries.reduce((max, e) => e.results.horizonMi > max.results.horizonMi ? e : max, entries[0]);
  const minHidden = entries.reduce((min, e) => e.results.hiddenFt < min.results.hiddenFt ? e : min, entries[0]);
  const fullyVisibleCount = entries.filter(e => e.results.fullyVisible).length;
  const fullyHiddenCount = entries.filter(e => e.results.fullyHidden).length;

  const maxIdx = entries.indexOf(maxHorizon);
  const minIdx = entries.indexOf(minHidden);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Insights</h4>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Eye className="w-2.5 h-2.5 text-blue-600" />
          </div>
          <p className="text-[11px] text-gray-600">
            <span className="font-semibold text-gray-800">Farthest horizon:</span> Scenario #{maxIdx + 1} at{' '}
            <span className="font-bold text-blue-600">{maxHorizon.results.horizonMi.toFixed(2)} mi</span>
          </p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mountain className="w-2.5 h-2.5 text-green-600" />
          </div>
          <p className="text-[11px] text-gray-600">
            <span className="font-semibold text-gray-800">Least hidden:</span> Scenario #{minIdx + 1} at{' '}
            <span className="font-bold text-green-600">{minHidden.results.hiddenFt.toFixed(1)} ft</span>
          </p>
        </div>
        {(fullyVisibleCount > 0 || fullyHiddenCount > 0) && (
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Layers className="w-2.5 h-2.5 text-amber-600" />
            </div>
            <p className="text-[11px] text-gray-600">
              {fullyVisibleCount > 0 && (
                <span><span className="font-bold text-green-600">{fullyVisibleCount}</span> fully visible</span>
              )}
              {fullyVisibleCount > 0 && fullyHiddenCount > 0 && <span> · </span>}
              {fullyHiddenCount > 0 && (
                <span><span className="font-bold text-red-600">{fullyHiddenCount}</span> fully hidden</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
