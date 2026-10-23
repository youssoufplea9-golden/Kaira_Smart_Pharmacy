import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Alert Thresholds ────────────────────────────────────────────────────────

const LS_KEY = 'kaira_alert_thresholds';

/** Reads thresholds from localStorage (fallback when Supabase is unavailable) */
function readLocalThresholds() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [{ code_cip: '*', designation: 'Seuil Global', threshold: 5 }];
  } catch {
    return [{ code_cip: '*', designation: 'Seuil Global', threshold: 5 }];
  }
}

function writeLocalThresholds(thresholds) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(thresholds)); } catch {}
}

/**
 * Hook to manage alert thresholds.
 * Returns:
 *  - thresholds: array of { code_cip, designation, threshold }
 *  - globalThreshold: number (the '*' row value)
 *  - getThreshold(code_cip): returns effective threshold for a given CIP
 *  - upsertThreshold({ code_cip, designation, threshold }): save/update a threshold
 *  - deleteThreshold(code_cip): remove a per-medication override
 *  - loading, error
 */
export function useAlertThresholds() {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThresholds = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('alert_thresholds')
        .select('*')
        .order('code_cip');
      if (err) throw err;
      const rows = data && data.length > 0 ? data : readLocalThresholds();
      setThresholds(rows);
      writeLocalThresholds(rows);
      setError(null);
    } catch (err) {
      console.warn('useAlertThresholds: Supabase unavailable, using localStorage', err);
      setThresholds(readLocalThresholds());
      setError(null); // transparent fallback — don't show an error to the user
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThresholds(); }, [fetchThresholds]);

  /** Returns the effective threshold for a given code_cip */
  const getThreshold = useCallback((code_cip) => {
    const specific = thresholds.find(t => t.code_cip === code_cip);
    if (specific) return specific.threshold;
    const global = thresholds.find(t => t.code_cip === '*');
    return global ? global.threshold : 5;
  }, [thresholds]);

  const globalThreshold = thresholds.find(t => t.code_cip === '*')?.threshold ?? 5;

  /** Upsert a threshold row — tries Supabase first, then localStorage */
  const upsertThreshold = useCallback(async ({ code_cip, designation, threshold }) => {
    const newRow = { code_cip, designation, threshold: Number(threshold) };
    // Optimistic update
    setThresholds(prev => {
      const idx = prev.findIndex(t => t.code_cip === code_cip);
      const next = idx >= 0
        ? prev.map((t, i) => i === idx ? { ...t, ...newRow } : t)
        : [...prev, newRow];
      writeLocalThresholds(next);
      return next;
    });
    // Persist to Supabase
    try {
      const { error: err } = await supabase
        .from('alert_thresholds')
        .upsert(newRow, { onConflict: 'code_cip' });
      if (err) console.warn('upsertThreshold Supabase error (local saved):', err);
    } catch (e) {
      console.warn('upsertThreshold: offline, saved locally', e);
    }
  }, []);

  /** Delete a per-medication threshold override */
  const deleteThreshold = useCallback(async (code_cip) => {
    if (code_cip === '*') return; // never delete global
    setThresholds(prev => {
      const next = prev.filter(t => t.code_cip !== code_cip);
      writeLocalThresholds(next);
      return next;
    });
    try {
      await supabase.from('alert_thresholds').delete().eq('code_cip', code_cip);
    } catch (e) {
      console.warn('deleteThreshold: offline, deleted locally', e);
    }
  }, []);

  return { thresholds, globalThreshold, getThreshold, upsertThreshold, deleteThreshold, loading, error, refetch: fetchThresholds };
}

export function useRuptures() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRuptures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produits_rupture')
        .select('*');
      
      if (error) throw error;
      setData(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching ruptures:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuptures();
    const interval = setInterval(fetchRuptures, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchRuptures };
}

export function useTopAchats(dateDebut, dateFin) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopAchats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .rpc('top_achats_periode', { date_debut: dateDebut, date_fin: dateFin });
        
        if (error) throw error;
        setData(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching top achats:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (dateDebut && dateFin) {
      fetchTopAchats();
    }
  }, [dateDebut, dateFin]);

  return { data, loading, error };
}

export function useRecommandations(moisCible) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommandations = async () => {
      try {
        setLoading(true);
        const month = moisCible || new Date().getMonth() + 1;
        const { data, error } = await supabase
          .rpc('recommandations_saisonnieres', { mois_cible: month });
        
        if (error) throw error;
        setData(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching recommandations:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommandations();
  }, [moisCible]);

  return { data, loading, error };
}
