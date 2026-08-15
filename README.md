# 🚀 PostuTrack

PostuTrack est une application de bureau conçue pour organiser, suivre et optimiser ses recherches de stage ou d'emploi. Plus qu'un simple tableau de bord, elle intègre l'intelligence artificielle pour adapter dynamiquement un CV et une lettre de motivation maître à chaque nouvelle offre d'emploi.

Contiens du code généré par intelligence artificielle avec vérification systématique d'un humain.

## ✨ Fonctionnalités Principales

*   **📊 Tableau de bord interactif :** Vue d'ensemble des statistiques (Candidatures totales, Entretiens, Offres reçues).
*   **📂 Gestion des candidatures :** Suivi précis des envois avec gestion des statuts (Postulé, En cours, Entretien, Offre, Refusé), des types de contrats, et des liens vers les annonces.
*   **🤖 Adaptateur CV & IA :** Génération sur-mesure de CV (compatibles RenderCV) et de lettres de motivation en analysant la description de l'offre. Supporte plusieurs modèles d'IA.
*   **👤 Profil Centralisé :** Remplissage automatique via l'import d'un CV existant (PDF/TXT) et gestion sécurisée des clés API.
*   **💾 Sauvegarde locale :** Les données restent privées grâce au `localStorage`. Un système d'import/export JSON permet de sauvegarder et restaurer ses informations facilement.

## 📦 Installation et Premier Démarrage (Utilisateurs)

Si vous avez téléchargé le fichier d'installation final dans [releases](https://github.com/anirboukantar-del/postutrack-app/releases) (`.exe` ou `.msi` sous Windows) :

1.  **Installation :** Double-cliquez sur le fichier d'installation et suivez les instructions classiques à l'écran.
2.  **Configuration du Profil :** Au premier lancement, allez dans l'onglet **Mon Profil**. Vous pouvez importer directement votre CV au format PDF pour que l'application remplisse automatiquement vos coordonnées et votre "CV Maître".
3.  **Activation de l'IA :** Toujours dans **Mon Profil**, descendez à la section "Configuration de l'IA". Sélectionnez le modèle de votre choix (Google Gemini est recommandé et gratuit) et collez votre clé API. *Vos clés restent strictement sur votre ordinateur.*
  - créez une clé API Gemini gratuitement sur https://aistudio.google.com/app/api-keys
4.  **Restauration (Optionnel) :** Si vous utilisiez déjà l'application en version développement, utilisez le bouton "Importer une sauvegarde" pour retrouver toutes vos candidatures.

## 💻 Développement et Compilation (Développeurs)

### Prérequis
*   [Node.js](https://nodejs.org/) (et npm)
*   L'environnement [Rust et les prérequis Tauri](https://tauri.app/v1/guides/getting-started/prerequisites) installés sur la machine.

### Démarrage rapide

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/votre-nom/postutrack-app.git](https://github.com/votre-nom/postutrack-app.git)
    cd postutrack-app
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Lancer l'application en mode développement :**
    ```bash
    npx tauri dev
    ```

4.  **Compiler l'application finale (.exe / .app / .deb) :**
    ```bash
    npx tauri build
    ```

Crédits : 
- https://github.com/rendercv/rendercv.git RenderCV
- https://github.com/jina-ai Jina AI
