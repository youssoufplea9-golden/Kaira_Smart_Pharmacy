import { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  History,
  Palette,
  Sliders,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  RefreshCw,
  Clock,
  Laptop,
  Smartphone,
  LogOut,
  AlertTriangle,
  Pill,
  Trash2,
  Plus,
} from 'lucide-react';
import { fetchAccessLogs } from '../lib/accessLogs';
import { useAlertThresholds, useRuptures } from '../hooks/useSupabase';

// ─── Helpers d'affichage pour les logs ──────────────────────────────────────────
const EVENT_META = {
  CONNEXION: {
    label: 'Connexion',
    badge: 'bg-kaira-emerald/20 text-kaira-emerald border-kaira-emerald/30',
    icon: Check,
  },
  PRISE_DE_CONTROLE: {
    label: 'Prise de contrôle',
    badge: 'bg-kaira-amber/20 text-kaira-amber border-kaira-amber/30',
    icon: AlertTriangle,
  },
  DECONNEXION: {
    label: 'Déconnexion',
    badge: 'bg-kaira-muted/20 text-kaira-muted border-kaira-muted/30',
    icon: LogOut,
  },
  DECONNEXION_DISTANTE: {
    label: 'Expulsion distante',
    badge: 'bg-kaira-rose/20 text-kaira-rose border-kaira-rose/30',
    icon: AlertCircle,
  },
  ECHEC_MDP: {
    label: 'Échec mot de passe',
    badge: 'bg-kaira-rose/20 text-kaira-rose border-kaira-rose/30',
    icon: AlertCircle,
  },
  CHANGEMENT_MDP: {
    label: 'Changement de mot de passe',
    badge: 'bg-kaira-cyan/20 text-kaira-cyan border-kaira-cyan/30',
    icon: KeyRound,
  },
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'security',
  currentTheme,
  onSelectTheme,
  themesList,
  onChangePassword,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // ── Onglet Sécurité (Changement de mot de passe) ──────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // ── Onglet Journal d'Accès (Logs) ──────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadLogs = async () => {
    setLoadingLogs(true);
    const data = await fetchAccessLogs(50);
    setLogs(data);
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'logs') {
      loadLogs();
    }
  }, [isOpen, activeTab]);

  // ── Onglet Seuils d'alerte ────────────────────────────────────────────────
  const {
    thresholds = [],
    globalThreshold = 5,
    upsertThreshold,
    deleteThreshold,
  } = useAlertThresholds();
  const { data: ruptures = [] } = useRuptures();
  const [sliderVal, setSliderVal] = useState(globalThreshold ?? 5);
  const [thresholdSaved, setThresholdSaved] = useState(false);
  const [overrideCip, setOverrideCip] = useState('');
  const [overrideVal, setOverrideVal] = useState('');
  const [overrideDesig, setOverrideDesig] = useState('');

  useEffect(() => {
    setSliderVal(globalThreshold ?? 5);
  }, [globalThreshold]);

  const individualThresholds = (thresholds || []).filter((t) => t.code_cip !== '*');

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPwd) {
      setPwdError('Veuillez renseigner le mot de passe actuel.');
      return;
    }
    if (!newPwd) {
      setPwdError('Veuillez renseigner le nouveau mot de passe.');
      return;
    }
    if (newPwd.length < 4) {
      setPwdError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setPwdSubmitting(true);
    const res = await onChangePassword(currentPwd, newPwd, confirmPwd);
    setPwdSubmitting(false);

    if (res.success) {
      setPwdSuccess(res.message || 'Mot de passe modifié avec succès !');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => setPwdSuccess(''), 3000);
    } else {
      setPwdError(res.error || 'Erreur lors du changement de mot de passe.');
    }
  };

  const handleSaveGlobalThreshold = async () => {
    await setGlobalThreshold(sliderVal);
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2000);
  };

  const handleAddOverride = async () => {
    if (!overrideCip || !overrideVal) return;
    await setIndividualThreshold(overrideCip, overrideDesig || overrideCip, Number(overrideVal));
    setOverrideCip('');
    setOverrideVal('');
    setOverrideDesig('');
  };

  const TABS = [
    { id: 'security',   label: 'Sécurité',       icon: ShieldCheck },
    { id: 'logs',       label: 'Journal d\'Accès',icon: History     },
    { id: 'theme',      label: 'Apparence',      icon: Palette     },
    { id: 'thresholds', label: 'Seuils Alertes', icon: Sliders     },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl glass-card bg-kaira-surface/98 border border-kaira-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-kaira-border flex justify-between items-center bg-kaira-surface">
          <div>
            <h2 className="text-lg font-bold gradient-text">Paramètres</h2>
            <p className="text-xs text-kaira-muted">Gestion globale de l'officine</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface/80 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-kaira-border overflow-x-auto bg-kaira-surface/50 scrollbar-none">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-kaira-cyan text-kaira-cyan bg-kaira-cyan/10'
                    : 'border-transparent text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface/40'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ─── ONGLET 1 : SÉCURITÉ ────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="max-w-md mx-auto space-y-5">
              <div className="p-3.5 rounded-xl bg-kaira-cyan/10 border border-kaira-cyan/20 text-xs text-kaira-text leading-relaxed">
                Le mot de passe protège l'ensemble de l'application. Pour le modifier, saisissez le mot de passe actuel puis confirmez le nouveau.
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-1.5">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      placeholder="Mot de passe actuel..."
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-1 focus:ring-kaira-cyan/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="Nouveau mot de passe (min 4 car.)..."
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-1 focus:ring-kaira-cyan/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmer */}
                <div>
                  <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="Retapez le nouveau mot de passe..."
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-1 focus:ring-kaira-cyan/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Messages d'alerte */}
                {pwdError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-kaira-rose/10 border border-kaira-rose/25 text-kaira-rose text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{pwdError}</span>
                  </div>
                )}
                {pwdSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-kaira-emerald/10 border border-kaira-emerald/25 text-kaira-emerald text-xs">
                    <Check size={16} className="shrink-0" />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-kaira-cyan to-kaira-purple hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-kaira-cyan/20 disabled:opacity-50"
                >
                  <KeyRound size={14} />
                  <span>{pwdSubmitting ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ─── ONGLET 2 : JOURNAL D'ACCÈS (LOGS) ────────────────────── */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-kaira-text">Historique des Entrées et Sorties</h3>
                  <p className="text-xs text-kaira-muted">Traçabilité des connexions, déconnexions et prises de contrôle</p>
                </div>
                <button
                  onClick={loadLogs}
                  disabled={loadingLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-cyan/50 text-xs text-kaira-muted hover:text-kaira-cyan transition-all"
                >
                  <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
                  <span>Actualiser</span>
                </button>
              </div>

              {loadingLogs ? (
                <div className="py-12 text-center text-xs text-kaira-muted flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-kaira-cyan" />
                  <span>Chargement du journal...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-kaira-muted">
                  Aucun événement enregistré pour le moment.
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {logs.map((log, index) => {
                    const meta = EVENT_META[log.event_type] || {
                      label: log.event_type,
                      badge: 'bg-kaira-surface text-kaira-muted border-kaira-border',
                      icon: Clock,
                    };
                    const IconComponent = meta.icon;
                    const isMobileDevice = /smartphone|mobile/i.test(log.device_info);

                    return (
                      <div
                        key={log.id || index}
                        className="p-3 rounded-xl bg-kaira-surface/70 border border-kaira-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-kaira-border/80 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${meta.badge}`}>
                            <IconComponent size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}>
                                {meta.label}
                              </span>
                              <span className="text-xs font-medium text-kaira-text">
                                {log.details}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-kaira-muted">
                              {isMobileDevice ? <Smartphone size={12} /> : <Laptop size={12} />}
                              <span>{log.device_info}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] text-kaira-muted sm:text-right shrink-0">
                          {formatDate(log.created_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── ONGLET 3 : APPARENCE (THÈMES) ───────────────────────── */}
          {activeTab === 'theme' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <h3 className="text-sm font-bold text-kaira-text">Palette et Thème Visuel</h3>
                <p className="text-xs text-kaira-muted">Choisissez l'ambiance graphique de votre dashboard</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {themesList.map((t) => {
                  const isSelected = t.id === currentTheme;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTheme(t.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-kaira-cyan/15 border-kaira-cyan text-kaira-text shadow-md shadow-kaira-cyan/10'
                          : 'bg-kaira-surface border-kaira-border hover:border-kaira-cyan/40 text-kaira-muted hover:text-kaira-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-kaira-text flex items-center gap-2">
                            <span>{t.label}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-kaira-cyan text-black px-1.5 py-0.5 rounded font-bold">
                                Actif
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-kaira-muted">
                            {t.id === 'sombre' && 'Ambiance néon spatiale'}
                            {t.id === 'clair'  && 'Haute lisibilité médicale'}
                            {t.id === 'ocean'  && 'Bleu marine profond & cyan'}
                            {t.id === 'sakura' && 'Violet feutré & rose poudré'}
                          </span>
                        </div>
                      </div>
                      <span
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: t.dot }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── ONGLET 4 : SEUILS D'ALERTE ─────────────────────────── */}
          {activeTab === 'thresholds' && (
            <div className="space-y-6">
              {/* Seuil global */}
              <div className="p-4 rounded-xl bg-kaira-surface border border-kaira-border space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-kaira-text">Seuil d'Alerte Global</h4>
                    <p className="text-xs text-kaira-muted">Déclenche les alertes pour tous les médicaments sans seuil dédié</p>
                  </div>
                  <button
                    onClick={handleSaveGlobalThreshold}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-kaira-cyan to-kaira-purple hover:opacity-90 transition-all"
                  >
                    {thresholdSaved ? <Check size={14} /> : <Sliders size={14} />}
                    <span>{thresholdSaved ? 'Enregistré !' : 'Sauvegarder'}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-kaira-muted mb-1">
                    <span>Stock minimum : <strong className="text-kaira-cyan text-sm">{sliderVal}</strong> unités</span>
                    <span className="text-kaira-rose">Critique ≤ {Math.ceil(sliderVal * 0.5)}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-kaira-surface border border-kaira-border accent-kaira-cyan"
                  />
                </div>
              </div>

              {/* Ajouter un seuil spécifique */}
              <div className="p-4 rounded-xl bg-kaira-surface border border-kaira-border space-y-3">
                <h4 className="text-sm font-bold text-kaira-text">Ajouter un seuil individuel par médicament</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={overrideCip}
                    onChange={(e) => {
                      setOverrideCip(e.target.value);
                      const med = ruptures.find((r) => r.code_cip === e.target.value);
                      if (med) setOverrideDesig(med.designation);
                    }}
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-kaira-bg border border-kaira-border text-kaira-text text-xs focus:outline-none focus:border-kaira-cyan"
                  >
                    <option value="">Sélectionner un médicament...</option>
                    {ruptures.map((m) => (
                      <option key={m.code_cip} value={m.code_cip}>
                        {m.designation} (CIP {m.code_cip})
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="Seuil..."
                      value={overrideVal}
                      onChange={(e) => setOverrideVal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-kaira-bg border border-kaira-border text-kaira-text text-xs focus:outline-none focus:border-kaira-cyan"
                    />
                    <button
                      type="button"
                      onClick={handleAddOverride}
                      disabled={!overrideCip || !overrideVal}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-kaira-cyan hover:bg-kaira-cyan/80 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Liste des overrides existants */}
                {Object.keys(thresholds.individual || {}).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-kaira-border/60 space-y-2">
                    <p className="text-xs font-semibold text-kaira-muted">Seuils personnalisés actifs :</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {Object.entries(thresholds.individual).map(([cip, tVal]) => (
                        <div
                          key={cip}
                          className="flex justify-between items-center p-2 rounded-lg bg-kaira-bg/60 border border-kaira-border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Pill size={14} className="text-kaira-cyan" />
                            <span className="font-medium text-kaira-text">{cip}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-kaira-amber">{tVal} unités</span>
                            <button
                              type="button"
                              onClick={() => removeIndividualThreshold(cip)}
                              className="text-kaira-muted hover:text-kaira-rose transition-colors"
                              title="Supprimer ce seuil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-kaira-border bg-kaira-surface flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-medium text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
