import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { recordAccessLog } from '../lib/accessLogs';

// Constantes
const DEFAULT_PASSWORD = 'Bamako2026';
const STORAGE_HASH_KEY = 'kaira_pwd_hash';
const STORAGE_SESSION_KEY = 'kaira_session_auth';
const STORAGE_MY_TOKEN_KEY = 'kaira_my_session_token';
const STORAGE_ACTIVE_TOKEN_KEY = 'kaira_active_session_token';
const STORAGE_ACTIVE_DEVICE_KEY = 'kaira_active_device_info';

// Hachage SHA-256 sécurisé
async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return 'fb_' + String(hash);
}

// Détection de l'appareil
function getDeviceDescription() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  const platform = isMobile ? 'Smartphone (Mobile)' : 'Ordinateur (PC Bureau)';
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${platform} — ${timeStr}`;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(STORAGE_SESSION_KEY) === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [kickedMessage, setKickedMessage] = useState('');

  // Référence au token de session de cette fenêtre/onglet
  const myTokenRef = useRef(sessionStorage.getItem(STORAGE_MY_TOKEN_KEY) || '');
  const broadcastChannelRef = useRef(null);

  // Initialisation du hash de mot de passe par défaut
  useEffect(() => {
    async function initHash() {
      let stored = localStorage.getItem(STORAGE_HASH_KEY);
      if (!stored) {
        stored = await hashPassword(DEFAULT_PASSWORD);
        localStorage.setItem(STORAGE_HASH_KEY, stored);
      }
      setLoading(false);
    }
    initHash();
  }, []);

  // Déconnexion forcée quand un autre appareil prend la main
  const handleForcedLogout = useCallback((reason) => {
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem(STORAGE_MY_TOKEN_KEY);
    myTokenRef.current = '';
    setIsAuthenticated(false);
    const msg = reason || 'Votre session a été fermée sans préavis car un autre appareil s\'est connecté et a pris la main.';
    setKickedMessage(msg);
    recordAccessLog('DECONNEXION_DISTANTE', 'Session fermée car un autre appareil a pris le contrôle');
  }, []);

  // Récupérer la session active (Supabase avec fallback localStorage)
  const getActiveSession = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('active_session')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        return {
          sessionToken: data.session_token,
          deviceInfo: data.device_info,
        };
      }
    } catch {
      // Supabase inaccessible : fallback sur localStorage
    }

    return {
      sessionToken: localStorage.getItem(STORAGE_ACTIVE_TOKEN_KEY) || '',
      deviceInfo: localStorage.getItem(STORAGE_ACTIVE_DEVICE_KEY) || '',
    };
  }, []);

  // Définir une nouvelle session active (écrase la précédente)
  const setActiveSession = useCallback(async (token, deviceInfo) => {
    // 1. Sauvegarde locale
    localStorage.setItem(STORAGE_ACTIVE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_ACTIVE_DEVICE_KEY, deviceInfo);
    sessionStorage.setItem(STORAGE_MY_TOKEN_KEY, token);
    sessionStorage.setItem(STORAGE_SESSION_KEY, 'true');
    myTokenRef.current = token;

    // 2. Diffusion BroadcastChannel locale (entre onglets du même appareil)
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'NEW_SESSION', token });
      }
    } catch {
      // Ignore
    }

    // 3. Sauvegarde dans Supabase (pour synchroniser entre différents téléphones/PC)
    try {
      await supabase.from('active_session').upsert(
        {
          id: 1,
          session_token: token,
          device_info: deviceInfo,
          updated_at: new Date().toISOString(),
          last_heartbeat: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch {
      // Supabase indisponible en mode hors-ligne
    }
  }, []);

  // Tentative de connexion
  const login = useCallback(
    async (passwordAttempt, forceDisconnect = false) => {
      if (!passwordAttempt) {
        return { success: false, error: 'Veuillez saisir votre mot de passe.' };
      }

      // 1. Vérification du mot de passe
      const attemptHash = await hashPassword(passwordAttempt);
      const validHash = localStorage.getItem(STORAGE_HASH_KEY) || (await hashPassword(DEFAULT_PASSWORD));

      if (attemptHash !== validHash) {
        recordAccessLog('ECHEC_MDP', 'Mot de passe incorrect saisi');
        return { success: false, error: 'Mot de passe incorrect.' };
      }

      // 2. Vérification des sessions existantes
      const active = await getActiveSession();
      const existingToken = active.sessionToken;
      const currentMyToken = myTokenRef.current;

      // Si une session existe sur un AUTRE appareil/navigateur
      if (existingToken && existingToken !== currentMyToken) {
        if (!forceDisconnect) {
          // Il y a un conflit : demander confirmation à l'utilisateur
          return {
            success: false,
            conflict: true,
            otherDevice: active.deviceInfo || 'Un autre appareil (PC ou Mobile)',
          };
        }
      }

      // 3. Pas de conflit ou confirmation validée : création de la nouvelle session unique
      const newToken = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const device = getDeviceDescription();

      await setActiveSession(newToken, device);
      setIsAuthenticated(true);
      setKickedMessage('');

      if (forceDisconnect) {
        recordAccessLog('PRISE_DE_CONTROLE', `Prise de contrôle — autres appareils déconnectés (ancien : ${active.deviceInfo || 'Inconnu'})`);
      } else {
        recordAccessLog('CONNEXION', 'Session ouverte avec succès');
      }

      return { success: true };
    },
    [getActiveSession, setActiveSession]
  );

  // Déconnexion volontaire
  const logout = useCallback(async () => {
    const currentMyToken = myTokenRef.current;
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem(STORAGE_MY_TOKEN_KEY);
    myTokenRef.current = '';
    setIsAuthenticated(false);
    recordAccessLog('DECONNEXION', 'Verrouillage / Déconnexion volontaire');

    // Nettoyer la session active si c'était la nôtre
    const localActive = localStorage.getItem(STORAGE_ACTIVE_TOKEN_KEY);
    if (localActive === currentMyToken) {
      localStorage.removeItem(STORAGE_ACTIVE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_ACTIVE_DEVICE_KEY);
      try {
        await supabase.from('active_session').delete().eq('id', 1);
      } catch {
        // Ignore
      }
    }
  }, []);

  // Modification du mot de passe
  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    if (!currentPassword) {
      return { success: false, error: 'Veuillez saisir le mot de passe actuel.' };
    }
    if (!newPassword) {
      return { success: false, error: 'Veuillez saisir le nouveau mot de passe.' };
    }
    if (newPassword.length < 4) {
      return { success: false, error: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'La confirmation ne correspond pas au nouveau mot de passe.' };
    }

    const currentAttemptHash = await hashPassword(currentPassword);
    const validHash = localStorage.getItem(STORAGE_HASH_KEY) || (await hashPassword(DEFAULT_PASSWORD));

    if (currentAttemptHash !== validHash) {
      recordAccessLog('ECHEC_MDP', 'Échec modification mdp (mot de passe actuel erroné)');
      return { success: false, error: 'Le mot de passe actuel est incorrect.' };
    }

    const newHash = await hashPassword(newPassword);
    localStorage.setItem(STORAGE_HASH_KEY, newHash);
    recordAccessLog('CHANGEMENT_MDP', 'Mot de passe d\'accès modifié');

    return { success: true, message: 'Mot de passe modifié avec succès !' };
  }, []);

  // Surveillance en temps réel pour déconnecter immédiatement cet appareil
  // si un autre appareil prend la main
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. BroadcastChannel (entre onglets / fenêtres locales)
    try {
      const bc = new BroadcastChannel('kaira_session_sync');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_SESSION') {
          if (event.data.token && event.data.token !== myTokenRef.current) {
            handleForcedLogout();
          }
        }
      };
    } catch {
      // BroadcastChannel non supporté sur anciens navigateurs
    }

    // 2. Storage event listener (fallback inter-onglets)
    const handleStorage = (e) => {
      if (e.key === STORAGE_ACTIVE_TOKEN_KEY) {
        if (e.newValue && e.newValue !== myTokenRef.current) {
          handleForcedLogout();
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Supabase Realtime (déconnexion instantanée entre appareils distants PC <-> Mobile)
    let channel = null;
    try {
      channel = supabase
        .channel('active_session_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'active_session' },
          (payload) => {
            const remoteToken = payload.new?.session_token;
            if (remoteToken && remoteToken !== myTokenRef.current) {
              handleForcedLogout();
            }
          }
        )
        .subscribe();
    } catch {
      // Mode hors ligne
    }

    // 4. Polling heartbeat toutes les 3 secondes (sécurité infaillible)
    const interval = setInterval(async () => {
      const active = await getActiveSession();
      if (active.sessionToken && active.sessionToken !== myTokenRef.current) {
        handleForcedLogout();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAuthenticated, handleForcedLogout, getActiveSession]);

  return {
    isAuthenticated,
    loading,
    kickedMessage,
    clearKickedMessage: () => setKickedMessage(''),
    login,
    logout,
    changePassword,
  };
}
