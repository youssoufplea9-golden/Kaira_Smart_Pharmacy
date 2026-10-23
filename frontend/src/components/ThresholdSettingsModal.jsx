import { useState, useEffect, useRef } from 'react';
import { X, Settings2, Globe, Pill, Trash2, Plus, CheckCircle, AlertTriangle, Save } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Determine badge color according to stock vs threshold */
export function getAlertLevel(stock, threshold) {
  if (stock === null || stock === undefined) return null;
  const s = Number(stock);
  const t = Number(threshold);
  if (s === 0) return 'critical';      // rupture totale
  if (s <= Math.ceil(t * 0.5)) return 'critical';
  if (s <= t) return 'warning';
  return 'ok';
}

export const ALERT_LABELS = {
  critical: { label: '🔴 Critique', cls: 'bg-kaira-rose/20 text-kaira-rose border-kaira-rose/40' },
  warning:  { label: '🟠 Alerte',   cls: 'bg-kaira-amber/20 text-kaira-amber border-kaira-amber/40' },
  ok:       { label: '🟢 Normal',   cls: 'bg-kaira-emerald/20 text-kaira-emerald border-kaira-emerald/40' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderInput({ value, onChange, min = 0, max = 100, label }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-kaira-muted">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            className="w-16 text-center bg-kaira-surface border border-kaira-border rounded-lg py-1 text-kaira-text text-sm font-bold focus:outline-none focus:border-kaira-cyan focus:ring-1 focus:ring-kaira-cyan/50"
          />
          <span className="text-xs text-kaira-muted">unités</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="threshold-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-kaira-cyan) 0%, var(--color-kaira-cyan) ${(value / max) * 100}%, rgba(17,24,39,0.8) ${(value / max) * 100}%, rgba(17,24,39,0.8) 100%)`
          }}
        />
        <div className="flex justify-between text-[9px] text-kaira-muted mt-1">
          <span>{min}</span>
          <span className="text-kaira-rose">Critique ≤{Math.ceil(value * 0.5)}</span>
          <span className="text-kaira-amber">Alerte ≤{value}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

function OverrideRow({ item, onSave, onDelete }) {
  const [val, setVal] = useState(item.threshold);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave({ code_cip: item.code_cip, designation: item.designation, threshold: val });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="glass-card p-3 flex items-center gap-3 border-kaira-border/50">
      <Pill size={14} className="text-kaira-purple shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-kaira-text truncate">{item.designation || item.code_cip}</p>
        <p className="text-[10px] text-kaira-muted font-mono">CIP: {item.code_cip}</p>
      </div>
      <input
        type="number"
        min={0}
        max={999}
        value={val}
        onChange={e => setVal(Math.max(0, Number(e.target.value)))}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        className="w-16 text-center bg-kaira-surface border border-kaira-border rounded-lg py-1 text-kaira-text text-xs font-bold focus:outline-none focus:border-kaira-cyan"
      />
      <button
        onClick={handleSave}
        className="p-1.5 rounded-lg bg-kaira-cyan/10 hover:bg-kaira-cyan/20 text-kaira-cyan transition-colors"
        title="Sauvegarder"
      >
        {saved ? <CheckCircle size={14} /> : <Save size={14} />}
      </button>
      <button
        onClick={() => onDelete(item.code_cip)}
        className="p-1.5 rounded-lg bg-kaira-rose/10 hover:bg-kaira-rose/20 text-kaira-rose transition-colors"
        title="Supprimer le seuil individuel"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

/**
 * ThresholdSettingsModal
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - thresholds: array from useAlertThresholds
 *  - globalThreshold: number
 *  - ruptures: array from useRuptures (to add overrides quickly)
 *  - upsertThreshold: fn
 *  - deleteThreshold: fn
 */
export default function ThresholdSettingsModal({
  open,
  onClose,
  thresholds = [],
  globalThreshold,
  ruptures = [],
  upsertThreshold,
  deleteThreshold,
}) {
  const [globalVal, setGlobalVal] = useState(globalThreshold ?? 5);
  const [globalSaved, setGlobalSaved] = useState(false);
  const [addingCip, setAddingCip] = useState(null);  // code_cip being added
  const backdropRef = useRef(null);

  // Sync with prop changes
  useEffect(() => { setGlobalVal(globalThreshold ?? 5); }, [globalThreshold]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const overrides = thresholds.filter(t => t.code_cip !== '*');
  const overrideCips = new Set(overrides.map(t => t.code_cip));

  // Ruptures not yet having a custom override
  const availableToAdd = ruptures.filter(r => r.code_cip && !overrideCips.has(r.code_cip));

  const handleGlobalSave = async () => {
    await upsertThreshold({ code_cip: '*', designation: 'Seuil Global', threshold: globalVal });
    setGlobalSaved(true);
    setTimeout(() => setGlobalSaved(false), 1500);
  };

  const handleAddOverride = (rupture) => {
    upsertThreshold({
      code_cip: rupture.code_cip,
      designation: rupture.designation,
      threshold: globalVal,
    });
    setAddingCip(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="threshold-modal-title"
      >
        {/* Sheet */}
        <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10,14,26,0.97)',
            border: '1px solid rgba(6,182,212,0.2)',
            boxShadow: '0 0 60px rgba(6,182,212,0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-kaira-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-kaira-cyan/10 rounded-xl">
                <Settings2 size={18} className="text-kaira-cyan" />
              </div>
              <div>
                <h2 id="threshold-modal-title" className="text-base font-bold text-kaira-text">
                  Seuils d'Alerte
                </h2>
                <p className="text-[10px] text-kaira-muted">Configuration des niveaux de rupture</p>
              </div>
            </div>
            <button
              id="threshold-modal-close"
              onClick={onClose}
              className="p-2 hover:bg-kaira-surface rounded-xl text-kaira-muted hover:text-kaira-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Legend */}
            <div className="flex gap-2 flex-wrap">
              {Object.values(ALERT_LABELS).map(({ label, cls }) => (
                <span key={label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
                  {label}
                </span>
              ))}
              <span className="text-[10px] text-kaira-muted self-center ml-1">basé sur le seuil défini</span>
            </div>

            {/* Global Threshold */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-kaira-cyan" />
                <h3 className="text-sm font-semibold text-kaira-text">Seuil Global</h3>
                <span className="text-[10px] text-kaira-muted">— appliqué à tous les médicaments</span>
              </div>
              <div className="glass-card p-4 space-y-3">
                <SliderInput
                  value={globalVal}
                  onChange={setGlobalVal}
                  min={0}
                  max={100}
                  label="Stock minimum avant alerte"
                />
                <button
                  id="threshold-global-save-btn"
                  onClick={handleGlobalSave}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-kaira-cyan/20 hover:bg-kaira-cyan/30 text-kaira-cyan text-sm font-semibold border border-kaira-cyan/30 transition-all"
                >
                  {globalSaved ? <CheckCircle size={16} /> : <Save size={16} />}
                  {globalSaved ? 'Sauvegardé !' : 'Appliquer le seuil global'}
                </button>
              </div>
            </section>

            {/* Per-medication overrides */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Pill size={14} className="text-kaira-purple" />
                  <h3 className="text-sm font-semibold text-kaira-text">Seuils Individuels</h3>
                </div>
                <span className="text-[10px] text-kaira-muted">{overrides.length} override{overrides.length !== 1 ? 's' : ''}</span>
              </div>

              {overrides.length === 0 && (
                <p className="text-xs text-kaira-muted text-center py-3">
                  Aucun seuil individuel — le seuil global s'applique à tous.
                </p>
              )}

              <div className="space-y-2">
                {overrides.map(item => (
                  <OverrideRow
                    key={item.code_cip}
                    item={item}
                    onSave={upsertThreshold}
                    onDelete={deleteThreshold}
                  />
                ))}
              </div>
            </section>

            {/* Add override from ruptures list */}
            {availableToAdd.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Plus size={14} className="text-kaira-emerald" />
                  <h3 className="text-xs font-semibold text-kaira-muted uppercase tracking-wide">
                    Ajouter un seuil pour…
                  </h3>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableToAdd.map(r => (
                    <button
                      key={r.code_cip}
                      onClick={() => handleAddOverride(r)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-kaira-border/50 hover:border-kaira-emerald/40 hover:bg-kaira-emerald/5 transition-all text-left"
                    >
                      <Plus size={12} className="text-kaira-emerald shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-kaira-text truncate">{r.designation}</p>
                        <p className="text-[10px] text-kaira-muted font-mono">CIP: {r.code_cip}</p>
                      </div>
                      <span className="text-[10px] text-kaira-muted shrink-0">Ajouter →</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Info box */}
            <div className="flex gap-2 p-3 bg-kaira-amber/5 border border-kaira-amber/20 rounded-xl">
              <AlertTriangle size={14} className="text-kaira-amber shrink-0 mt-0.5" />
              <p className="text-[11px] text-kaira-muted leading-relaxed">
                <span className="text-kaira-amber font-semibold">Règle de calcul :</span>{' '}
                Stock = 0 → Critique · Stock ≤ ½ seuil → Critique · Stock ≤ seuil → Alerte · Au-dessus → Normal.
                Le seuil individuel prime sur le seuil global.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slider styling */}
      <style>{`
        .threshold-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-kaira-cyan);
          cursor: pointer;
          box-shadow: 0 0 6px rgba(6,182,212,0.5);
          border: 2px solid rgba(10,14,26,0.9);
        }
        .threshold-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-kaira-cyan);
          cursor: pointer;
          box-shadow: 0 0 6px rgba(6,182,212,0.5);
          border: 2px solid rgba(10,14,26,0.9);
        }
      `}</style>
    </>
  );
}
