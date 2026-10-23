# 💊 Kaira — Dashboard Pharmacie Intelligente

> Système complet de monitoring des ruptures de stock, d'analytics, de recommandations saisonnières, de gestion avancée des seuils d'alerte et de double interface PC/Mobile pour officines connectées à Winpharma.

![Stack](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![Styling](https://img.shields.io/badge/Styling-TailwindCSS_v4-06B6D4?logo=tailwindcss)
![Backend](https://img.shields.io/badge/Backend-Supabase-3FCF8E?logo=supabase)
![Sync](https://img.shields.io/badge/Sync-Windows_executable-3776AB?logo=windows)
![Deploy](https://img.shields.io/badge/Deploy-NSSM-FF6C37)
![Author](https://img.shields.io/badge/Créé_par-Youssouf_Plea-8b5cf6)
![License](https://img.shields.io/badge/Licence-Propriétaire_(Tous_droits_réservés)-red)

---

## 📐 Architecture du Système

```
┌──────────────┐     CSV      ┌──────────────────┐    API REST    ┌─────────────┐
│   Winpharma  │ ──────────►  │  kaira_sync.exe  │ ────────────►  │  Supabase   │
│  (PC Pharma) │  ruptures/   │  (Service Win)   │  service_role  │ (PostgreSQL)│
└──────────────┘  achats.csv  └──────────────────┘                └──────┬──────┘
                                                                         │
                                                                    anon key
                                                                         │
                                                                  ┌──────▼──────┐
                                                                  │   App Web   │
                                                                  │  PWA React  │
                                                                  └──────┬──────┘
                                                  ┌──────────────────────┴──────────────────────┐
                                                  │                                             │
                                           ┌──────▼──────┐                               ┌──────▼──────┐
                                           │  🖥 Écran PC │                               │ 📱 Smartphone│
                                           │ (Vue Bureau)│                               │ (Vue Mobile)│
                                           └─────────────┘                               └─────────────┘
```

---

## ✨ Fonctionnalités Principales

| Module | Description |
|--------|-------------|
| **🔴 Ruptures de Stock** | Surveillance en temps réel des ruptures (refresh auto toutes les 30s) avec badges d'urgence et synthèse visuelle. |
| **⚙️ Seuils d'Alerte Intelligents** | Définition d'un seuil global et d'overrides manuels individuels par médicament — persistés dans Supabase et en local. |
| **🖥 Double Interface (PC & Mobile)** | Disposition ergonomique sur grand écran (sidebar fixe, grilles multi-colonnes, stats étendues) ou mobile (barre basse). |
| **🎨 Système Multi-Thèmes** | 4 thèmes modernes (Sombre, Clair, Océan, Sakura) sélectionnables à la volée avec mémorisation instantanée. |
| **📊 Analytics Officine** | Graphiques Recharts des top produits achetés avec filtres dynamiques (7j, 30j, 90j, 1 an). |
| **🧠 Smart Advisor** | Prédiction d'approvisionnement basée sur la saisonnalité pour anticiper les besoins mois par mois. |
| **🔒 Accès Sécurisé par Mot de Passe** | Écran de verrouillage dédié sans identifiant (mot de passe initial : `Bamako2026`) et session unique exclusive. |
| **📋 Journal d'Audit & Traçabilité** | Historique en temps réel des entrées/sorties (connexions, déconnexions, expulsions distantes, échecs). |
| **⚙️ Bloc Unifié Paramètres** | Regroupement modulaire (Sécurité, Journal d'accès, Thèmes, Seuils) avec bascule Mobile/PC gardée à part. |
| **🛡 Démarrage Résilient** | L'application démarre même sans fichier `.env` configuré grâce à son fallback automatique sur `localStorage`. |
| **📱 PWA & Hors-Ligne** | Installable sur smartphone et tablette comme une application native, avec cache Service Worker. |

---

## 🆕 Dernières Nouveautés & Mises à Jour

### 1. 🖥 Double Interface Ergonomique (Mode PC vs Mode Mobile)
- **Mode Bureau (PC)** :
  - **Sidebar latérale de navigation** fixe à gauche avec repères visuels lumineux.
  - **Zone de contenu élargie** (`max-w-5xl`) exploitant la largeur d'écran.
  - **Affichage en grille réactive** (2 à 3 colonnes) pour les cartes de ruptures et les conseils de l'Advisor.
  - **Tableau de bord Analytics étendu** : barre des 4 KPI clés sur une seule ligne et graphique Top 10 avec labels élargis.
- **Mode Mobile (Smartphone)** :
  - **Barre de navigation inférieure** optimisée pour une utilisation au pouce.
  - Flux vertical compact avec cartes ergonomiques et graphiques synthétiques (Top 5).
- **Switcher instantané** :
  - Un bouton dans l'en-tête permet de basculer manuellement entre **Mode PC** 🖥 et **Mode Mobile** 📱 à tout moment.
  - Détection automatique à la première ouverture selon la résolution de l'écran (seuil : 768px).
  - Persistance du choix utilisateur dans le navigateur (`localStorage: kaira_view_mode`).

---

### 2. 🎨 Système Multi-Thèmes Complet (4 Ambiances)
Chaque thème redéfinit dynamiquement l'intégralité de la palette (surfaces, cartes translucides, bordures, lueurs et textes dégradés) :
- 🌑 **Sombre (Par défaut)** : Ambiance futuriste dark glassmorphism (cyan et violet néon sur fond noir spatial).
- ☀️ **Clair** : Style médical immaculé, haute lisibilité, fond gris perle contrasté et ombres subtiles.
- 🌊 **Océan** : Harmonie marine profonde, accents bleu azur et turquoise.
- 🌸 **Sakura** : Égide violine raffinée et touches rose poudré.
- **Sélecteur visuel** : Menu déroulant dans le header avec pastilles de prévisualisation des teintes.
- **Persistance automatique** : Enregistré dans `localStorage: kaira_theme` et appliqué via l'attribut `data-theme` sans scintillement.

---

### 3. ⚙️ Gestion Avancée des Seuils d'Alerte de Rupture
- **Seuil Global Configurable** :
  - Un curseur interactif et un champ numérique permettent d'ajuster le niveau de stock minimal déclenchant une alerte (valeur par défaut : **5 unités**).
- **Seuils Individuels Manuels** :
  - Chaque médicament peut être personnalisé avec son propre seuil (ex: seuil critique à 20 boîtes pour le Doliprane, mais 2 pour un produit rare).
  - Le seuil individuel est prioritaire sur le seuil global.
  - Possibilité de supprimer un seuil individuel pour revenir instantanément au seuil global.
- **Classification Dynamique en 3 Niveaux** :
  - 🔴 **Critique** : Stock à 0, ou stock restant $\le$ 50% du seuil applicable.
  - 🟠 **Alerte** : Stock restant $\le$ seuil applicable.
  - 🟢 **Normal / Faible** : Stock au-dessus du seuil.
- **Bandeau de bord synthétique** : Compteurs d'alertes par statut affichés en tête du panel Ruptures.
- **Haute Tolérance aux Pannes** : Sauvegarde synchrone dans Supabase (table `alert_thresholds`) avec relai transparent dans `localStorage` si le réseau ou la base est inaccessible.

---

### 4. 🛡 Robustesse & Mode Démo Immédiat (Zero-Config Test)
- L'application frontend ne plante plus si les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ne sont pas encore renseignées.
- Le client Supabase s'initialise silencieusement en mode dégradé et bascule automatiquement les hooks sur les mécanismes de secours locaux (`localStorage`).
- Permet de tester et visualiser l'interface, les thèmes et les fonctionnalités immédiatement après clonage du dépôt.

---

### 5. ✍️ Précision Orthographique & Identité
- Harmonisation du titre et des métadonnées sous l'appellation officielle : **« Pharmacie Intelligente »**.

---

### 6. 🔒 Système de Sécurité & Session Unique Exclusive
- **Écran de verrouillage dédié (Lock Screen)** : L'application est protégée dès l'ouverture sans demander d'identifiant, uniquement un mot de passe.
- **Mot de passe par défaut** : Déverrouillage initial avec le mot de passe **`Bamako2026`**.
- **Panel de modification sécurisé** (accessible via le bouton *Sécurité* 🔑 dans l'en-tête) :
  - 1️⃣ Saisie obligatoire du **mot de passe actuel**.
  - 2️⃣ Définition du **nouveau mot de passe**.
  - 3️⃣ **Confirmation** du nouveau mot de passe.
- **Bouton « Verrouiller »** 🔒 : Permet au pharmacien de verrouiller l'écran avec **demande de confirmation obligatoire** (*« Êtes-vous sûr de vouloir vous déconnecter et verrouiller l'accès ? »*) avec possibilité d'annuler ou de valider la déconnexion.
- **Session Unique Exclusive (1 seul appareil à la fois)** :
  - Si un appareil tente de se connecter alors qu'une session est déjà ouverte ailleurs, une fenêtre de confirmation apparaît :  
    *« Une session est actuellement ouverte sur un autre appareil. Voulez-vous réellement déconnecter les autres appareils et prendre la main ? »*
  - Si l'utilisateur confirme, **toutes les autres sessions sont immédiatement déconnectées sans préavis**.
  - L'ancien appareil affiche un bandeau d'alerte explicatif : *« Votre session a été fermée sans préavis car un autre appareil s'est connecté et a pris la main »*.
- **Hachage cryptographique** : Protection par SHA-256 (Web Crypto API) sans stockage en clair.

---

### 7. 📋 Journal d'Audit & Traçabilité des Accès (Entrées / Sorties)
- **Traçabilité complète des événements** :
  - 🟢 **Connexion** : Horodatage précis des ouvertures de session.
  - 🟡 **Prise de contrôle** : Enregistrement des connexions ayant forcé l'expulsion d'autres appareils.
  - 🔴 **Déconnexion** : Verrouillages volontaires effectués par l'utilisateur.
  - ⚠️ **Expulsion distante** : Enregistrement des sessions fermées à distance sans préavis.
  - ⛔ **Échecs** : Tentatives de déverrouillage avec mot de passe erroné.
  - 🔑 **Changements de mot de passe** : Traçabilité des modifications d'accès.
- **Détails enregistrés** : Date et heure précises (format français `JJ/MM/AAAA HH:MM:SS`), type d'appareil (*Smartphone Mobile* ou *Ordinateur PC Bureau*) et descriptif de l'événement.
- **Double persistance** : Sauvegarde dans Supabase (table `access_logs`) avec secours instantané en `localStorage`.

---

### 8. ⚙️ Bloc Unifié des Paramètres (avec bascule Mobile/PC indépendante)
- **Centralisation ergonomique** : Un bouton unique **« Paramètres »** dans l'en-tête (et la sidebar PC) regroupe désormais les fonctionnalités de configuration :
  - 🔒 **Sécurité** : Modification du mot de passe en 3 étapes.
  - 📋 **Journal d'Accès** : Consultation en temps réel du journal d'audit avec bouton d'actualisation.
  - 🎨 **Apparence** : Sélection visuelle des 4 ambiances (Sombre, Clair, Océan, Sakura).
  - ⚙️ **Seuils d'Alerte** : Ajustement du seuil global et des seuils individuels par médicament.
- **Option Mobile / PC préservée à part** : Le commutateur de vue **« Mode Mobile / Mode PC »** reste un bouton autonome et direct dans la barre supérieure, garantissant un accès instantané sans devoir ouvrir les paramètres.

---

## 🗂️ Structure du Projet

```
Kaira/
├── supabase/
│   ├── schema.sql                          # Tables, RLS, fonctions RPC
│   └── migrations/
│       ├── 001_alert_thresholds.sql        # Table SQL des seuils d'alerte
│       ├── 002_active_session.sql          # Gestion de session unique exclusive
│       └── 003_access_logs.sql             # Table du journal d'audit des accès
├── sync/
│   ├── sync_winpharma.py                   # Script de synchronisation Python (watchdog)
│   ├── requirements.txt                    # Dépendances Python (supabase, pandas, etc.)
│   ├── build.bat                           # Script de compilation en kaira_sync.exe
│   └── .env.example                        # Modèle des variables de synchronisation
├── frontend/
│   ├── index.html                          # Point d'entrée web & PWA
│   ├── package.json                        # Dépendances React 19, Lucide, Recharts
│   ├── vite.config.js                      # Configuration Vite & TailwindCSS v4
│   ├── .env.example                        # Modèle des clés Supabase publiques
│   ├── public/
│   │   ├── manifest.json                   # Manifest PWA (mode standalone)
│   │   ├── sw.js                           # Service Worker de mise en cache
│   │   └── icons/                          # Icônes de l'application
│   └── src/
│       ├── App.jsx                         # Shell applicatif (double layout, bouton PC/Mobile à part, modal Paramètres)
│       ├── index.css                       # Design system Tailwind v4 & 4 thèmes CSS
│       ├── main.jsx                        # Point d'amorçage React
│       ├── lib/
│       │   ├── supabase.js                 # Client Supabase résilient avec tolérance aux variables vides
│       │   └── accessLogs.js               # Service d'enregistrement et de lecture des logs d'accès
│       ├── hooks/
│       │   ├── useSupabase.js              # Hooks réactifs (ruptures, achats, recommandations, seuils)
│       │   └── useAuth.js                  # Authentification, session unique, logs d'accès et hash SHA-256
│       └── components/
│           ├── LockScreen.jsx              # Écran de verrouillage avec confirmation de prise de contrôle
│           ├── SettingsModal.jsx           # Bloc unifié des paramètres (Sécurité, Logs, Thèmes, Seuils)
│           ├── RupturesPanel.jsx           # Panel des ruptures (grille PC / liste mobile)
│           ├── ThresholdSettingsModal.jsx  # Modal de configuration directe des seuils
│           ├── AnalyticsPanel.jsx          # Dashboard des achats (stat cards + graphique Recharts)
│           └── SmartAdvisorPanel.jsx       # Recommandations prédictives saisonnières
├── deploy/
│   └── install_service.bat                 # Automatisation du service Windows (NSSM)
└── README.md
```

---

## 🚀 Guide d'Installation & Démarrage

### Prérequis
- **PC du développeur** : Windows, Python 3.11+ et accès Internet pour compiler l'agent de synchronisation
- **PC de l'officine** : Windows 10/11 et NSSM. Python et les dépendances Python ne sont pas nécessaires
- **Environnement Web** : Node.js 18+ et npm
- **Base Cloud** : Compte [Supabase](https://supabase.com) (formule gratuite)

---

### 1. Configuration de la Base de Données Supabase

1. Créez un nouveau projet sur [supabase.com](https://supabase.com).
2. Rendez-vous dans **SQL Editor** → **New Query**.
3. Exécutez le script d'initialisation général : `supabase/schema.sql`.
4. Exécutez les migrations, dans l'ordre :
   - `supabase/migrations/001_alert_thresholds.sql`
   - `supabase/migrations/002_active_session.sql`
   - `supabase/migrations/003_access_logs.sql`
5. Récupérez vos clés dans **Settings** → **API** :
   - `Project URL`
   - `anon public` (pour le frontend)
   - `service_role secret` (exclusivement pour le fichier `.env` de l'agent de synchronisation)

> ⚠️ **Sécurité** : La clé `service_role` est un secret privilégié. Ne la placez jamais dans le frontend, dans Vercel ou dans Git. Transférez le fichier `.env` à l'officine par un canal sécurisé.

---

### 2. Lancement du Frontend en Local

```bash
cd frontend

# Copier le fichier d'exemple des variables d'environnement
copy .env.example .env

# Renseigner vos clés dans .env :
# VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Installer les dépendances
npm install

# Démarrer le serveur de développement Vite
npm run dev
```

L'application s'ouvre sur `http://localhost:5173`.  
*Remarque : Si vous ne configurez pas `.env` immédiatement, l'application s'ouvre quand même et vous permet de naviguer dans l'interface et de tester les thèmes.*

---

### 3. Synchronisation Winpharma

L'agent est compilé en un exécutable autonome sur le PC du développeur. Le PC de l'officine n'a besoin ni de Python ni des bibliothèques Python.

#### Compilation (sur le PC du développeur)

1. Utilisez un PC Windows avec Python 3.11 ou supérieur. Compilez pour la même architecture Windows que le PC de l'officine (x64 dans la plupart des cas).
2. Ouvrez un terminal dans le dossier `sync` du projet.
3. Lancez le script de compilation :

   ```powershell
   .\build.bat
   ```

   Le script installe les dépendances nécessaires à la compilation et produit :
   `sync\dist\kaira_sync.exe`.

4. Préparez un dossier de livraison séparé du dépôt, par exemple `C:\Kaira_Livraison\`. Placez-y ces quatre éléments :
   - `kaira_sync.exe`, copié depuis `sync\dist\kaira_sync.exe` ;
   - `install_service.bat`, copié depuis `deploy\install_service.bat` ;
   - `nssm.exe`, extrait de l'archive NSSM en choisissant la version correspondant à Windows ;
   - `.env`, créé depuis `sync\.env.example` et configuré avec les identifiants Supabase de l'officine :

     ```env
     SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
     SUPABASE_SERVICE_KEY=votre_cle_service_role
     ```

   Le fichier `.env` doit se trouver dans le même dossier que `kaira_sync.exe`. Il contient un secret : ne l'ajoutez pas au dépôt et transmettez-le de manière sécurisée.

#### Déploiement (sur le PC de l'officine)

1. Copiez le dossier de livraison complet dans un emplacement permanent, par exemple `C:\Kaira_Sync\`. Ne le lancez pas depuis un dossier temporaire ou un dossier de téléchargements qui pourrait être supprimé.
2. Configurez Winpharma pour exporter ses fichiers dans `C:\Winpharma_Exports\`.
3. Vérifiez que le dossier contient bien `kaira_sync.exe`, `.env`, `nssm.exe` et `install_service.bat`.
4. Faites un clic droit sur `install_service.bat`, puis sélectionnez **Exécuter en tant qu'administrateur**. Le script installe le service `KairaSyncService` et démarre l'exécutable.
5. Vérifiez son état avec la commande suivante dans une invite de commandes administrateur ouverte dans le dossier de livraison :

   ```cmd
   nssm.exe status KairaSyncService
   ```

Le service surveille `C:\Winpharma_Exports` et traite les CSV présents au démarrage ainsi que ceux ajoutés ensuite.

#### Répertoire d'export Winpharma
Configurer Winpharma pour générer ses exports dans le dossier :
`C:\Winpharma_Exports\`

Fichiers attendus :
- `ruptures*.csv` (séparateur `;`, colonnes : `code_cip`, `designation`, optionnel : `stock_actuel`, `laboratoire`)
- `achats*.csv` (séparateur `;`, colonnes : `code_cip`, `designation`, `quantite`, `date_achat`, optionnel : `prix_unitaire`, `fournisseur`)

---

### 4. Gestion du Service Windows (NSSM)

Le service démarre automatiquement avec Windows. Pour l'administrer, ouvrez une invite de commandes en tant qu'administrateur dans le dossier de livraison et utilisez `nssm.exe` qui s'y trouve :

```batch
nssm.exe status KairaSyncService
nssm.exe stop KairaSyncService
nssm.exe start KairaSyncService
nssm.exe restart KairaSyncService
```

Les journaux du service sont écrits dans le sous-dossier `logs` du dossier de livraison. Pour reconstruire l'agent après une modification du code, répétez la compilation sur le PC développeur et remplacez l'ancien `kaira_sync.exe` après avoir arrêté le service.

---

## ⚙️ Guide d'Utilisation des Seuils d'Alerte

1. Cliquez sur l'icône **⚙️** située en haut à droite du panel **Ruptures**.
2. **Pour le seuil global** : déplacez le slider ou saisissez la valeur voulue, puis cliquez sur **Sauvegarder**.
3. **Pour un médicament spécifique** :
   - Utilisez la section **« Ajouter un seuil pour… »** pour choisir un médicament.
   - Réglez son seuil dédié et cliquez sur **Sauvegarder**.
   - Ce seuil s'appliquera immédiatement en priorité sur le seuil global.
4. **Pour réinitialiser** : cliquez sur l'icône poubelle à côté d'un seuil spécifique pour rétablir la valeur globale par défaut.

---

## 🔒 Sécurité et Droits d'Accès

| Composant | Stratégie de Sécurité |
|-----------|------------------------|
| **Base Supabase** | Row Level Security (RLS) activé. Seule la clé `service_role` a les droits d'écriture sur les stocks et achats. |
| **PWA Frontend** | Accès restreint via la clé `anon` publique en lecture seule sur les stocks, avec politique dédiée pour la gestion des seuils. |
| **Agent de synchronisation** | Clé `service_role` dans le fichier `.env` privé, à côté de l'exécutable sur le poste officine. |
| **Transports** | Chiffrement SSL/TLS complet (HTTPS / WSS). |
| **Résilience Données** | Cache `localStorage` synchrone pour garantir la continuité de service en cas de coupure internet. |

---

## ❓ FAQ — Questions Fréquentes

**Q : L'application fonctionne-t-elle si la connexion internet est coupée ?**  
> Oui. L'application met en cache les dernières informations récupérées. Si le réseau tombe, l'interface reste pleinement opérationnelle et les seuils d'alerte continuent d'être gérés via le cache local.

**Q : Comment changer de thème visuel ?**  
> Cliquez sur le bouton portant l'icône de palette dans la barre supérieure et choisissez parmi **Sombre**, **Clair**, **Océan** ou **Sakura**. Le choix est conservé automatiquement.

**Q : Comment basculer entre l'affichage PC et Mobile ?**  
> Un clic sur le bouton **« Mode Mobile »** ou **« Mode PC »** dans l'en-tête adapte instantanément la disposition (sidebar latérale vs barre basse, grilles vs cartes empilées).

**Q : Que faire si mes fichiers CSV Winpharma ont un encodage particulier ?**  
> Le script `sync_winpharma.py` détecte et convertit nativement les fichiers encodés en `cp1252` (ANSI Windows) ainsi qu'en `UTF-8`.

---

## 👤 Propriété & Auteur

**Créé et développé par Youssouf Plea**  

© 2026 **Youssouf Plea**. Tous droits réservés.  
*Kaira — Dashboard Pharmacie Intelligente* est un logiciel propriétaire protégé par les lois internationales relatives à la propriété intellectuelle. Toute reproduction, copie, distribution, ingénierie inverse ou exploitation commerciale non autorisée par écrit par l'auteur est strictement interdite.
