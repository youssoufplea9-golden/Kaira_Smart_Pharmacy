import { supabase } from './supabase';

const STORAGE_LOGS_KEY = 'kaira_access_logs';
const MAX_LOCAL_LOGS = 150;

function getDeviceDescription() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  const platform = isMobile ? 'Smartphone (Mobile)' : 'Ordinateur (PC Bureau)';
  return platform;
}

/**
 * Enregistre un événement dans le journal d'accès
 * @param {'CONNEXION' | 'PRISE_DE_CONTROLE' | 'DECONNEXION' | 'DECONNEXION_DISTANTE' | 'ECHEC_MDP' | 'CHANGEMENT_MDP'} eventType
 * @param {string} [details]
 */
export async function recordAccessLog(eventType, details = '') {
  const device = getDeviceDescription();
  const entry = {
    id: Date.now() + Math.random().toString(36).substring(2, 6),
    event_type: eventType,
    device_info: device,
    details: details || '',
    created_at: new Date().toISOString(),
  };

  // 1. Sauvegarde locale synchrone (toujours disponible)
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [entry, ...existing].slice(0, MAX_LOCAL_LOGS);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erreur écriture log local:', err);
  }

  // 2. Sauvegarde dans Supabase
  try {
    await supabase.from('access_logs').insert([
      {
        event_type: eventType,
        device_info: device,
        details: details || '',
        created_at: entry.created_at,
      },
    ]);
  } catch {
    // Mode hors-ligne / .env non configuré : le log local suffit
  }

  return entry;
}

/**
 * Récupère l'historique des logs (Supabase avec fallback localStorage)
 */
export async function fetchAccessLogs(limit = 60) {
  // Tentative Supabase
  try {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Supabase indisponible
  }

  // Fallback local
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
