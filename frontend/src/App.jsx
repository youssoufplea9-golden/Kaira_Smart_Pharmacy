import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Monitor,
  Smartphone,
  Lock,
  Settings,
  LogOut,
} from 'lucide-react';
import RupturesPanel from './components/RupturesPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import SmartAdvisorPanel from './components/SmartAdvisorPanel';
import LockScreen from './components/LockScreen';
import SettingsModal from './components/SettingsModal';
import { useAuth } from './hooks/useAuth';

// ─── Theme configuration ───────────────────────────────────────────────────────
const THEMES = [
  { id: 'sombre', label: 'Sombre', icon: '🌑', dot: '#06b6d4' },
  { id: 'clair',  label: 'Clair',  icon: '☀️', dot: '#0284c7' },
  { id: 'ocean',  label: 'Océan',  icon: '🌊', dot: '#22d3ee' },
  { id: 'sakura', label: 'Sakura', icon: '🌸', dot: '#e879f9' },
];

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kaira_theme') || 'sombre';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kaira_theme', theme);
  }, [theme]);

  return [theme, setTheme];
}

// ─── View mode hook ────────────────────────────────────────────────────────────
function useViewMode() {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('kaira_view_mode');
    if (saved === 'mobile' || saved === 'desktop') return saved;
    // Auto-detect based on screen width
    return window.innerWidth >= 768 ? 'desktop' : 'mobile';
  });

  useEffect(() => {
    localStorage.setItem('kaira_view_mode', mode);
  }, [mode]);

  return [mode, setMode];
}

// ─── Modal Confirmation Déconnexion ───────────────────────────────────────────
function LogoutConfirmModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm glass-card bg-kaira-surface/98 border border-kaira-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-kaira-rose/15 text-kaira-rose border border-kaira-rose/30">
            <LogOut size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-kaira-text">Confirmer la déconnexion</h3>
            <p className="text-xs text-kaira-muted">Verrouillage de l'application</p>
          </div>
        </div>

        <p className="text-xs text-kaira-text/90 leading-relaxed">
          Êtes-vous sûr de vouloir vous déconnecter et verrouiller l'accès au tableau de bord ?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-kaira-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            id="confirm-logout-btn"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-kaira-rose to-red-600 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-kaira-rose/25"
          >
            <LogOut size={14} />
            <span>Oui, me déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'ruptures',  label: 'Ruptures',  Icon: AlertTriangle, color: 'kaira-rose',   activeColor: 'kaira-cyan'   },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3,     color: 'kaira-muted',  activeColor: 'kaira-purple' },
  { id: 'advisor',   label: 'Advisor',   Icon: Lightbulb,     color: 'kaira-muted',  activeColor: 'kaira-amber'  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('ruptures');
  const [viewMode, setViewMode] = useViewMode();
  const [theme, setTheme] = useTheme();

  // Modal Paramètres Unifié
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('security');

  // Confirmation de déconnexion / verrouillage
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Authentification sécurisée avec session unique
  const {
    isAuthenticated,
    loading,
    login,
    logout,
    changePassword,
    kickedMessage,
    clearKickedMessage,
  } = useAuth();

  const isDesktop = viewMode === 'desktop';

  const getTodayDate = () =>
    new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const toggleViewMode = () => setViewMode(m => m === 'desktop' ? 'mobile' : 'desktop');

  const openSettings = (tab = 'security') => {
    setSettingsTab(tab);
    setShowSettingsModal(true);
  };

  // Si l'état d'authentification se charge encore
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kaira-bg">
        <div className="w-8 h-8 rounded-full border-2 border-kaira-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  // Écran de verrouillage si non authentifié
  if (!isAuthenticated) {
    return (
      <LockScreen
        onLogin={login}
        kickedMessage={kickedMessage}
        onClearKickedMessage={clearKickedMessage}
      />
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="min-h-screen flex flex-col bg-kaira-bg font-inter layout-transition">
        {/* Top Header */}
        <header className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b border-kaira-border">
          <div className="px-6 py-3 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Kaira</h1>
              <p className="text-xs text-kaira-muted capitalize">{getTodayDate()}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Option Mobile / PC gardée À PART */}
              <button
                id="view-mode-toggle"
                onClick={toggleViewMode}
                title="Passer en mode Mobile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-cyan/50 text-kaira-muted hover:text-kaira-cyan transition-all text-xs"
              >
                <Smartphone size={14} />
                <span>Mode Mobile</span>
              </button>

              {/* Bloc Unifié Paramètres (Sécurité, Journal, Thème, Seuils) */}
              <button
                id="open-settings-btn"
                onClick={() => openSettings('security')}
                title="Paramètres de l'officine"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-cyan/50 text-kaira-muted hover:text-kaira-cyan transition-all text-xs"
              >
                <Settings size={14} className="text-kaira-cyan" />
                <span>Paramètres</span>
              </button>

              {/* Verrouiller l'écran avec confirmation */}
              <button
                id="lock-screen-btn"
                onClick={() => setShowLogoutConfirm(true)}
                title="Verrouiller l'accès"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-rose/50 text-kaira-muted hover:text-kaira-rose transition-all text-xs"
              >
                <Lock size={14} />
                <span>Verrouiller</span>
              </button>

              {/* Status */}
              <div className="flex items-center gap-2 bg-kaira-surface/50 px-3 py-1.5 rounded-full border border-kaira-border">
                <div className="w-2 h-2 rounded-full bg-kaira-emerald pulse-glow"></div>
                <span className="text-xs text-kaira-emerald font-medium">Connecté</span>
              </div>
            </div>
          </div>
        </header>

        {/* Body: Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 glass-card rounded-none border-t-0 border-b-0 border-l-0 border-r border-kaira-border flex flex-col py-6 px-3 justify-between">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, Icon, activeColor }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    id={`sidebar-nav-${id}`}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left w-full group ${
                      isActive
                        ? `bg-${activeColor}/10 text-${activeColor} border border-${activeColor}/20`
                        : 'text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface/50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive ? `bg-${activeColor}/15` : 'group-hover:bg-kaira-surface'}`}>
                      <Icon size={18} />
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                    {isActive && (
                      <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${activeColor}`}></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Raccourci Paramètres en bas de la sidebar */}
            <div className="pt-4 border-t border-kaira-border/60">
              <button
                onClick={() => openSettings('security')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-kaira-muted hover:text-kaira-text hover:bg-kaira-surface/50 transition-all text-left w-full group"
              >
                <div className="p-1.5 rounded-lg group-hover:bg-kaira-surface text-kaira-cyan">
                  <Settings size={18} />
                </div>
                <span className="font-medium text-sm">Paramètres</span>
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
              {activeTab === 'ruptures'  && <RupturesPanel  desktop />}
              {activeTab === 'analytics' && <AnalyticsPanel desktop />}
              {activeTab === 'advisor'   && <SmartAdvisorPanel desktop />}
            </div>
          </main>
        </div>

        {/* Modal Paramètres Unifié */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          initialTab={settingsTab}
          currentTheme={theme}
          onSelectTheme={setTheme}
          themesList={THEMES}
          onChangePassword={changePassword}
        />

        {/* Modal de Confirmation de Déconnexion */}
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
        />
      </div>
    );
  }

  // ── Mobile layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20 bg-kaira-bg font-inter layout-transition">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b border-kaira-border">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold gradient-text">Kaira</h1>
            <p className="text-[10px] text-kaira-muted capitalize">{getTodayDate()}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Option Mobile / PC gardée À PART */}
            <button
              id="view-mode-toggle-mobile"
              onClick={toggleViewMode}
              title="Passer en mode PC"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-cyan/50 text-kaira-muted hover:text-kaira-cyan transition-all text-xs"
            >
              <Monitor size={14} />
              <span>PC</span>
            </button>

            {/* Bloc Unifié Paramètres */}
            <button
              id="open-settings-btn-mobile"
              onClick={() => openSettings('security')}
              title="Paramètres"
              className="p-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-cyan/50 text-kaira-muted hover:text-kaira-cyan transition-all"
            >
              <Settings size={16} className="text-kaira-cyan" />
            </button>

            {/* Verrouiller l'accès avec confirmation */}
            <button
              id="lock-screen-btn-mobile"
              onClick={() => setShowLogoutConfirm(true)}
              title="Verrouiller"
              className="p-1.5 rounded-xl bg-kaira-surface border border-kaira-border hover:border-kaira-rose/50 text-kaira-muted hover:text-kaira-rose transition-all"
            >
              <Lock size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4">
        {activeTab === 'ruptures'  && <RupturesPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'advisor'   && <SmartAdvisorPanel />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-none border-b-0 border-l-0 border-r-0 border-t border-kaira-border pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          {NAV_ITEMS.map(({ id, label, Icon, activeColor }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                id={`mobile-nav-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-1/3 ${
                  isActive ? `text-${activeColor}` : 'text-kaira-muted hover:text-kaira-text'
                }`}
              >
                <div className={`p-1.5 rounded-lg mb-1 ${isActive ? `bg-${activeColor}/10` : ''}`}>
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal Paramètres Unifié */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={settingsTab}
        currentTheme={theme}
        onSelectTheme={setTheme}
        themesList={THEMES}
        onChangePassword={changePassword}
      />

      {/* Modal de Confirmation de Déconnexion */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
      />
    </div>
  );
}
