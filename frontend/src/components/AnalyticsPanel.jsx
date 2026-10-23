import { useState, useMemo } from 'react';
import { TrendingUp, Package, ShoppingCart, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTopAchats } from '../hooks/useSupabase';

/** Calcule la date de début selon le preset sélectionné */
const getDateRange = (preset) => {
  const now = new Date();
  const dateFin = now.toISOString().split('T')[0];
  const msPerDay = 24 * 60 * 60 * 1000;
  const presetMap = { '7j': 7, '30j': 30, '90j': 90, '1an': 365 };
  const days = presetMap[preset] || 30;
  const dateDebut = new Date(Date.now() - days * msPerDay).toISOString().split('T')[0];
  return { dateDebut, dateFin };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border-kaira-purple/30">
        <p className="text-kaira-text font-medium text-sm mb-1">{label}</p>
        <p className="text-kaira-cyan font-bold">{payload[0].value.toLocaleString('fr-FR')} unités</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPanel({ desktop = false }) {
  const [preset, setPreset] = useState('30j');
  const { dateDebut, dateFin } = useMemo(() => getDateRange(preset), [preset]);
  const { data, loading, error } = useTopAchats(dateDebut, dateFin);

  const formatYAxis = (tickItem) =>
    tickItem.length > 20 ? `${tickItem.substring(0, 20)}...` : tickItem;

  const totalProducts  = data?.length || 0;
  const totalQuantity  = data?.reduce((sum, item) => sum + (item.total_quantite || 0), 0) || 0;
  const topProduct     = data?.[0]?.designation || 'N/A';
  const totalOrders    = data?.reduce((sum, item) => sum + (item.nombre_commandes || 0), 0) || 0;

  // On desktop we show top 10 in the chart, on mobile top 5
  const chartData = data?.slice(0, desktop ? 10 : 5) || [];
  const chartHeight = desktop ? 420 : 300;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-kaira-text flex items-center gap-2">
          <TrendingUp className="text-kaira-purple" size={24} />
          <span>Performances</span>
        </h2>
      </div>

      {/* Date Presets */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['7j', '30j', '90j', '1an'].map(p => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              preset === p
                ? 'bg-kaira-purple/20 text-kaira-purple border border-kaira-purple/50'
                : 'bg-kaira-surface border border-kaira-border text-kaira-muted hover:text-kaira-text'
            }`}
          >
            {p === '7j' ? '7 Jours' : p === '30j' ? '30 Jours' : p === '90j' ? '3 Mois' : '1 An'}
          </button>
        ))}
      </div>

      {/* Desktop: stats row above chart / Mobile: below */}
      {desktop && (
        <div className="grid grid-cols-4 gap-4 slide-up">
          <StatCard icon={<Package size={16} className="text-kaira-cyan" />} label="Réf. Actives" value={loading ? '-' : totalProducts} />
          <StatCard icon={<ShoppingCart size={16} className="text-kaira-purple" />} label="Vol. Global" value={loading ? '-' : totalQuantity.toLocaleString('fr-FR')} />
          <StatCard icon={<TrendingUp size={16} className="text-kaira-emerald" />} label="Commandes" value={loading ? '-' : totalOrders.toLocaleString('fr-FR')} />
          <div className="glass-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-kaira-muted">
              <Award size={16} className="text-kaira-amber" />
              <span className="text-xs">Best Seller</span>
            </div>
            <span className="text-sm font-semibold text-kaira-text truncate">{loading ? '-' : topProduct}</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div
        className="glass-card p-4 slide-up"
        style={{ height: chartHeight + 60, animationDelay: '100ms' }}
      >
        <h3 className="text-sm font-medium text-kaira-muted mb-4">
          Top {chartData.length} Produits (Quantité achetée)
        </h3>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kaira-purple"></div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-kaira-rose text-sm">
            Erreur de chargement des données
          </div>
        ) : data?.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-kaira-muted text-sm">
            Aucune donnée pour cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%"  stopColor="var(--color-kaira-cyan)"   stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-kaira-purple)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-kaira-border)" />
              <XAxis type="number" stroke="var(--color-kaira-muted)" fontSize={10} />
              <YAxis
                dataKey="designation"
                type="category"
                stroke="var(--color-kaira-text)"
                fontSize={10}
                tickFormatter={formatYAxis}
                width={desktop ? 140 : 80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-kaira-surface)', opacity: 0.4 }} />
              <Bar dataKey="total_quantite" fill="url(#colorPv)" radius={[0, 4, 4, 0]} barSize={desktop ? 16 : 20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mobile stats grid (shown only in mobile mode) */}
      {!desktop && (
        <div className="grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard icon={<Package size={16} className="text-kaira-cyan" />} label="Réf. Actives" value={loading ? '-' : totalProducts} />
          <StatCard icon={<ShoppingCart size={16} className="text-kaira-purple" />} label="Vol. Global" value={loading ? '-' : totalQuantity.toLocaleString('fr-FR')} />
          <div className="glass-card p-4 flex flex-col gap-2 col-span-2">
            <div className="flex items-center gap-2 text-kaira-muted">
              <Award size={16} className="text-kaira-amber" />
              <span className="text-xs">Best Seller</span>
            </div>
            <span className="text-sm font-semibold text-kaira-text truncate">{loading ? '-' : topProduct}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-kaira-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xl font-bold text-kaira-text">{value}</span>
    </div>
  );
}
