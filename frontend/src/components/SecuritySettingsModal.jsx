import { useState } from 'react';
import { X, ShieldCheck, KeyRound, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

export default function SecuritySettingsModal({ isOpen, onClose, onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Veuillez renseigner le mot de passe actuel.');
      return;
    }
    if (!newPassword) {
      setError('Veuillez renseigner le nouveau mot de passe.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setSubmitting(true);
    const result = await onChangePassword(currentPassword, newPassword, confirmPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccess(result.message || 'Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        handleReset();
      }, 1500);
    } else {
      setError(result.error || 'Erreur lors du changement de mot de passe.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-card bg-kaira-surface/95 border border-kaira-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-kaira-border flex justify-between items-center bg-kaira-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-kaira-cyan/15 text-kaira-cyan border border-kaira-cyan/25">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-kaira-text">Paramètres de Sécurité</h2>
              <p className="text-xs text-kaira-muted">Modifier le mot de passe de l'officine</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Field 1: Mot de passe actuel */}
          <div>
            <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-1.5">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                id="security-current-pwd"
                type={showCurrent ? 'text' : 'password'}
                autoFocus
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Entrez le mot de passe actuel..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-2 focus:ring-kaira-cyan/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Field 2: Nouveau mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="security-new-pwd"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Entrez le nouveau mot de passe..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-2 focus:ring-kaira-cyan/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Field 3: Confirmer le nouveau mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-kaira-text uppercase tracking-wider mb-1.5">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="security-confirm-pwd"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Retapez le nouveau mot de passe..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-kaira-surface border border-kaira-border text-kaira-text placeholder-kaira-muted focus:outline-none focus:border-kaira-cyan focus:ring-2 focus:ring-kaira-cyan/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kaira-muted hover:text-kaira-cyan transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-kaira-rose/10 border border-kaira-rose/25 text-kaira-rose text-xs animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-kaira-emerald/10 border border-kaira-emerald/25 text-kaira-emerald text-xs animate-in fade-in duration-200">
              <Check size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-kaira-border">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-medium text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-kaira-cyan to-kaira-purple hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-kaira-cyan/20 disabled:opacity-50"
            >
              <KeyRound size={14} />
              <span>{submitting ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
