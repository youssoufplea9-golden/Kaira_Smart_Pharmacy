import { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  MonitorSmartphone,
  LogOut,
} from 'lucide-react';

export default function LockScreen({ onLogin, kickedMessage, onClearKickedMessage }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  // État de conflit de session (autre appareil connecté)
  const [conflict, setConflict] = useState(null); // { otherDevice: string }

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!password.trim()) {
      setError('Veuillez entrer le mot de passe.');
      triggerShake();
      return;
    }

    setSubmitting(true);
    setError('');

    const res = await onLogin(password, false);
    setSubmitting(false);

    if (res.conflict) {
      // Une autre session est déjà active : demander confirmation
      setConflict({ otherDevice: res.otherDevice });
      return;
    }

    if (!res.success) {
      setError(res.error || 'Mot de passe incorrect.');
      triggerShake();
    }
  };

  // L'utilisateur confirme qu'il veut déconnecter les autres appareils
  const handleForceDisconnect = async () => {
    setSubmitting(true);
    setError('');

    const res = await onLogin(password, true); // forceDisconnect = true
    setSubmitting(false);

    if (!res.success) {
      setConflict(null);
      setError(res.error || 'Erreur lors de la prise de contrôle.');
      triggerShake();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-kaira-bg font-inter relative overflow-hidden">
      {/* Background ambient decorative glow circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-kaira-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-kaira-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-md glass-card p-8 border border-kaira-border rounded-2xl shadow-2xl relative z-10 transition-transform ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-kaira-cyan/10 border border-kaira-cyan/25 mb-4 shadow-lg shadow-kaira-cyan/10">
            <Lock className="text-kaira-cyan" size={30} />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text tracking-tight mb-1">
            Kaira
          </h1>
          <p className="text-xs text-kaira-cyan font-medium uppercase tracking-wider mb-2">
            Pharmacie Intelligente
          </p>
          <p className="text-xs text-kaira-muted">
            Accès sécurisé — 1 seul appareil actif à la fois
          </p>
        </div>

        {/* Message d'expulsion si déconnecté par un autre appareil */}
        {kickedMessage && (
          <div className="mb-5 p-4 rounded-xl bg-kaira-rose/15 border border-kaira-rose/40 text-kaira-rose text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-2.5">
              <LogOut size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-kaira-rose">Session fermée à distance</p>
                <p className="text-[11px] opacity-90 mt-0.5">{kickedMessage}</p>
              </div>
            </div>
            {onClearKickedMessage && (
              <button
                type="button"
                onClick={onClearKickedMessage}
                className="text-[10px] underline hover:opacity-80 block ml-7"
              >
                Compris
              </button>
            )}
          </div>
        )}

        {/* Formulaire standard de déverrouillage */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-2">
              Mot de passe d'accès
            </label>
            <div className="relative">
              <input
                id="kaira-password-input"
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Entrez le mot de passe..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-2 focus:ring-kaira-cyan/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan transition-colors p-1"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-kaira-rose/10 border border-kaira-rose/25 text-kaira-rose text-xs animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-kaira-cyan to-kaira-purple hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-kaira-cyan/20 disabled:opacity-50"
          >
            <span>{submitting ? 'Vérification...' : 'Déverrouiller'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-kaira-border/50 text-center flex items-center justify-center gap-1.5 text-[11px] text-kaira-muted">
          <ShieldCheck size={14} className="text-kaira-emerald" />
          <span>Session unique exclusive — Protection officine</span>
        </div>
      </div>

      {/* ─── Modal de Confirmation de Déconnexion des autres appareils ───── */}
      {conflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card bg-kaira-surface/95 border border-kaira-amber/40 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-kaira-amber/15 text-kaira-amber border border-kaira-amber/30 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-kaira-text">
                  Session déjà active sur un autre appareil
                </h3>
                <p className="text-xs text-kaira-muted mt-1">
                  Une session est actuellement en cours sur :
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kaira-surface border border-kaira-border text-xs text-kaira-amber font-medium">
                  <MonitorSmartphone size={14} />
                  <span>{conflict.otherDevice}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-kaira-surface/80 border border-kaira-border text-xs text-kaira-text/90 leading-relaxed">
              Pour des raisons de sécurité, Kaira n'autorise qu'<strong>un seul appareil connecté à la fois</strong>.
              <br /><br />
              Voulez-vous réellement <strong>déconnecter l'autre appareil sans préavis</strong> et prendre la main sur cet écran ?
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-kaira-border/60">
              <button
                type="button"
                onClick={() => setConflict(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleForceDisconnect}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-kaira-rose to-red-600 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-kaira-rose/25 disabled:opacity-50"
              >
                <LogOut size={14} />
                <span>{submitting ? 'Déconnexion en cours...' : 'Oui, déconnecter les autres'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
