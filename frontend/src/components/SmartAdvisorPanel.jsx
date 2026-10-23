import { useState } from 'react';
import { Brain, ChevronDown, Sparkles, TrendingUp } from 'lucide-react';
import { useRecommandations } from '../hooks/useSupabase';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const getScoreColor = (score) => {
  if (score >= 80) return 'bg-kaira-rose text-white shadow-[0_0_10px_rgba(244,63,94,0.3)] border-kaira-rose/50';
  if (score >= 50) return 'bg-kaira-amber text-black shadow-[0_0_10px_rgba(245,158,11,0.3)] border-kaira-amber/50';
  return 'bg-kaira-emerald text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] border-kaira-emerald/50';
};

const getScoreBarColor = (score) => {
  if (score >= 80) return 'bg-kaira-rose';
  if (score >= 50) return 'bg-kaira-amber';
  return 'bg-kaira-emerald';
};

function AdvisorCard({ item, index }) {
  const score = item.score_priorite || 0;
  const barWidth = Math.min(100, Math.max(0, score));

  return (
    <div
      className="glass-card p-4 slide-up border hover:border-kaira-amber/30 transition-all duration-300 relative overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Background glow */}
      <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl opacity-10 ${getScoreBarColor(score)}`}></div>

      <div className="flex justify-between items-start mb-2">
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getScoreColor(score)}`}>
          Priorité {score > 80 ? 'Haute' : score > 50 ? 'Moyenne' : 'Basse'}
        </div>
        <span className="text-xs text-kaira-muted font-mono">CIP: {item.code_cip}</span>
      </div>

      <h3 className="font-bold text-kaira-text text-sm mb-3 leading-tight pr-6">{item.designation}</h3>

      <div className="flex justify-between items-end mb-1 text-xs">
        <div className="flex items-center gap-1 text-kaira-muted">
          <TrendingUp size={12} />
          <span>Moy. mensuelle: </span>
          <span className="text-kaira-text font-semibold">{item.moyenne_quantite_mensuelle || 0}</span>
        </div>
        <div className="text-[10px] text-kaira-muted">
          Basé sur {item.total_annees_observees || 0} an(s)
        </div>
      </div>

      {/* Score Bar */}
      <div className="w-full h-1.5 bg-kaira-surface rounded-full overflow-hidden mt-2">
        <div
          className={`h-full rounded-full ${getScoreBarColor(score)}`}
          style={{ width: `${barWidth}%`, transition: 'width 1s ease-in-out' }}
        ></div>
      </div>
    </div>
  );
}

export default function SmartAdvisorPanel({ desktop = false }) {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { data, loading, error } = useRecommandations(selectedMonth);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-kaira-text flex items-center gap-2">
          <div className="p-1.5 bg-kaira-amber/20 rounded-lg">
            <Brain className="text-kaira-amber" size={20} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-kaira-amber to-kaira-rose">
            Smart Advisor
          </span>
        </h2>

        {/* Month Selector */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="appearance-none bg-kaira-surface border border-kaira-border rounded-lg pl-3 pr-8 py-1.5 text-sm text-kaira-text focus:outline-none focus:border-kaira-amber focus:ring-1 focus:ring-kaira-amber/50 cursor-pointer"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-kaira-muted pointer-events-none" />
        </div>
      </div>

      <div className="text-xs text-kaira-muted mb-4 flex items-center gap-1.5">
        <Sparkles size={12} className="text-kaira-amber" />
        IA Prédictive basée sur l'historique de consommation
      </div>

      {/* Content */}
      {loading ? (
        <div className={`grid gap-3 ${desktop ? 'grid-cols-2 xl:grid-cols-3' : ''}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-kaira-muted/20 rounded w-1/4 mb-3"></div>
              <div className="h-5 bg-kaira-muted/20 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-kaira-muted/10 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-6 text-center text-kaira-rose border-kaira-rose/30">
          <p className="font-medium">Erreur de prédiction</p>
          <p className="text-xs mt-1 opacity-80">{error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card p-8 text-center text-kaira-muted flex flex-col items-center">
          <Brain size={40} className="mb-3 opacity-20" />
          <p className="font-medium">Pas assez de données historiques</p>
          <p className="text-xs mt-1">L'IA nécessite plus d'historique pour ce mois.</p>
        </div>
      ) : (
        <div className={`grid gap-3 pb-4 ${desktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {data.map((item, index) => (
            <AdvisorCard key={item.code_cip || index} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
