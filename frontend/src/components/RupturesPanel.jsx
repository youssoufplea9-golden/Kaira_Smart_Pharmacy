import { useState } from 'react';
import { Search, RefreshCw, AlertCircle, PackageX, Settings2 } from 'lucide-react';
import { useRuptures, useAlertThresholds } from '../hooks/useSupabase';
import ThresholdSettingsModal, { getAlertLevel, ALERT_LABELS } from './ThresholdSettingsModal';

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'à l\'instant';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `il y a ${diffInHours}h`;
  return `il y a ${Math.floor(diffInHours / 24)}j`;
};

const BORDER_COLOR = {
  critical: 'border-l-kaira-rose',
  warning:  'border-l-kaira-amber',
  ok:       'border-l-kaira-emerald',
};

export default function RupturesPanel({ desktop = false }) {
  const { data, loading, error, refetch } = useRuptures();
  const { thresholds, globalThreshold, getThreshold, upsertThreshold, deleteThreshold } = useAlertThresholds();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const filteredData = data?.filter(item =>
    item.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code_cip?.includes(searchTerm)
  ) || [];

  const levelCounts = filteredData.reduce((acc, item) => {
    const level = getAlertLevel(item.stock_actuel, getThreshold(item.code_cip));
    if (level) acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const CardItem = ({ item, index }) => {
    const effectiveThreshold = getThreshold(item.code_cip);
    const level = getAlertLevel(item.stock_actuel, effectiveThreshold);
    const { label: alertLabel, cls: alertCls } = ALERT_LABELS[level] || {};
    const hasOverride = thresholds.some(t => t.code_cip === item.code_cip);

    return (
      <div
        key={item.id || index}
        className={`glass-card p-4 slide-up border-l-4 ${BORDER_COLOR[level] || 'border-l-kaira-rose'}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-kaira-text text-sm pr-2 leading-tight">{item.designation}</h3>
          <span className="text-xs bg-kaira-surface px-2 py-1 rounded text-kaira-muted whitespace-nowrap">
            CIP: {item.code_cip}
          </span>
        </div>
        <div className="text-xs text-kaira-muted mb-3">{item.laboratoire || 'Laboratoire Inconnu'}</div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              level === 'critical' ? 'bg-kaira-rose' :
              level === 'warning'  ? 'bg-kaira-amber' : 'bg-kaira-emerald'
            }`}></div>
            <span className="text-kaira-text">
              Stock:{' '}
              <span className={`font-bold ${
                level === 'critical' ? 'text-kaira-rose' :
                level === 'warning'  ? 'text-kaira-amber' : 'text-kaira-emerald'
              }`}>
                {item.stock_actuel ?? 0}
              </span>
            </span>
          </div>
          {alertLabel && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${alertCls}`}>
              {alertLabel}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-kaira-border/40">
          <div className="flex items-center gap-1 text-[10px] text-kaira-muted">
            <span>Seuil :</span>
            <span className={`font-mono font-bold ${hasOverride ? 'text-kaira-purple' : 'text-kaira-cyan'}`}>
              {effectiveThreshold}
            </span>
            {hasOverride && <span className="text-kaira-purple">(individuel)</span>}
          </div>
          <div className="text-[10px] text-kaira-muted italic">{timeAgo(item.date_rupture)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-kaira-text">Ruptures</h2>
          {!loading && data && (
            <span className="bg-kaira-rose/20 text-kaira-rose text-xs font-bold px-2 py-1 rounded-full border border-kaira-rose/30 pulse-glow">
              {filteredData.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            id="ruptures-threshold-settings-btn"
            onClick={() => setShowSettings(true)}
            title={`Seuil d'alerte global : ${globalThreshold} unités`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-cyan/50 text-kaira-muted hover:text-kaira-cyan transition-all text-xs"
          >
            <Settings2 size={14} />
            <span className="font-mono font-bold">{globalThreshold}</span>
          </button>
          <button onClick={refetch} className="p-2 text-kaira-cyan hover:bg-kaira-cyan/10 rounded-full transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alert level summary */}
      {!loading && filteredData.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {Object.entries(levelCounts).map(([level, count]) => {
            const { label, cls } = ALERT_LABELS[level] || {};
            if (!label) return null;
            return (
              <span key={level} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
                {label} · {count}
              </span>
            );
          })}
          <span className="text-[10px] text-kaira-muted">
            · Seuil global : <span className="font-mono font-bold text-kaira-cyan">{globalThreshold}</span>
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-kaira-muted" />
        </div>
        <input
          id="ruptures-search-input"
          type="text"
          placeholder="Rechercher (CIP, Nom)..."
          className="w-full bg-kaira-surface/50 border border-kaira-border rounded-xl py-3 pl-10 pr-4 text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-1 focus:ring-kaira-cyan/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      {error ? (
        <div className="glass-card p-6 text-center text-kaira-rose border-kaira-rose/30">
          <AlertCircle size={32} className="mx-auto mb-2" />
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm opacity-80 mt-1">{error.message}</p>
        </div>
      ) : loading && data.length === 0 ? (
        <div className={`grid gap-3 ${desktop ? 'grid-cols-2 xl:grid-cols-3' : ''}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-kaira-muted/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-kaira-muted/10 rounded w-1/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-kaira-muted/20 rounded w-1/4"></div>
                <div className="h-4 bg-kaira-muted/20 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="glass-card p-8 text-center text-kaira-muted">
          <PackageX size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-lg">Aucune rupture</p>
          <p className="text-sm">Tous les stocks sont à jour.</p>
        </div>
      ) : (
        <div className={`grid gap-3 pb-4 ${desktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredData.map((item, index) => (
            <CardItem key={item.id || index} item={item} index={index} />
          ))}
        </div>
      )}

      {/* Threshold Settings Modal */}
      <ThresholdSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        thresholds={thresholds}
        globalThreshold={globalThreshold}
        ruptures={data || []}
        upsertThreshold={upsertThreshold}
        deleteThreshold={deleteThreshold}
      />
    </div>
  );
}
