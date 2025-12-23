#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// All translations by language
const translations = {
  fr: {
    common: {
      buttons: { add: "Ajouter", done: "Terminé", cancel: "Annuler", delete: "Supprimer", share: "Partager", play: "Jouer", next: "Suivant", previous: "Précédent", skip: "Passer", check: "Vérifier la réponse", save: "Enregistrer", saving: "Enregistrement...", finish: "Terminer", tryAgain: "Réessayer", playAgain: "Rejouer", showHint: "Afficher l'indice", generate: "Générer", generating: "Génération..." },
      status: { loading: "Chargement...", saving: "Enregistrement...", generating: "Génération...", noWords: "Aucun mot dans cet ensemble", success: "Succès", error: "Erreur" },
      time: { never: "Jamais", today: "Aujourd'hui", yesterday: "Hier", daysAgo: "Il y a {{count}} jours", lastPracticed: "Dernière pratique {{date}}" },
      counts: { word: "mot", words: "mots", set: "ensemble", sets: "ensembles", wordCount: "{{count}} mot", wordCount_other: "{{count}} mots", setCount: "{{count}} ensemble", setCount_other: "{{count}} ensembles", progress: "{{current}}/{{total}}" },
      dialogs: { areYouSure: "Êtes-vous sûr ?", cannotUndo: "Cette action ne peut pas être annulée." },
      sharing: { shareSet: "Partager l'ensemble", shareCode: "Code de partage", shareLink: "Lien de partage", copyLink: "Copier le lien", copied: "Copié !", copy: "Copier", views: "Vues", copies: "Copies", generatingLink: "Génération du lien de partage...", linkInfo: "Toute personne disposant de ce lien peut voir et copier votre ensemble", deactivateLink: "Désactiver le lien de partage", deactivateConfirm: "Êtes-vous sûr de vouloir désactiver ce lien de partage ? Toute personne disposant du lien ne pourra plus accéder à cet ensemble.", deactivate: "Désactiver", linkDeactivated: "Le lien de partage a été désactivé", shareError: "Échec de la génération du lien de partage. Veuillez réessayer.", copyError: "Échec de la copie du lien dans le presse-papiers", linkCopied: "Lien copié", linkCopiedToClipboard: "Lien de partage copié dans le presse-papiers" },
      tour: { skip: "Passer", next: "Suivant", back: "Retour", getStarted: "Commencer", slides: { vocabulary: { title: "Construisez votre vocabulaire", description: "Ajoutez des mots manuellement ou utilisez l'IA pour générer des ensembles de vocabulaire thématiques. Créez jusqu'à 20 mots par ensemble." }, organize: { title: "Organisez votre apprentissage", description: "Regroupez les mots dans des ensembles thématiques comme \"Nourriture espagnole\" ou \"Voyage allemand\". Nommez vos ensembles pour un accès facile." }, learn: { title: "Apprenez à votre façon", description: "Pratiquez avec 4 modes de jeu : Flashcards, Associer les paires, Quiz à choix multiples et Remplir le blanc." }, share: { title: "Partagez vos connaissances", description: "Générez des liens de partage pour vos ensembles. Les autres peuvent les voir et les copier dans leur bibliothèque." } } }
    },
    settings: {
      title: "Paramètres",
      appLanguage: { title: "Langue de l'application", description: "Choisissez la langue de l'interface de l'application.", label: "Langue de l'interface", placeholder: "Sélectionner la langue de l'application" },
      languages: { title: "Paramètres de langue", description: "Modifiez votre langue d'apprentissage et d'interface. Les nouveaux ensembles utiliseront ces langues.", targetLanguage: "Apprentissage", targetPlaceholder: "Sélectionner la langue à apprendre", nativeLanguage: "Interface et traductions", nativePlaceholder: "Sélectionner votre langue", changeNote: "La modification de ces paramètres affectera les nouveaux ensembles de mots. Vos ensembles existants conserveront leurs langues d'origine." },
      appearance: { title: "Apparence", description: "Choisissez l'apparence de l'application. Auto correspondra au thème de votre appareil.", light: "Clair", dark: "Sombre", auto: "Auto", info: "Les modifications de thème s'appliquent immédiatement à tous les écrans" },
      mySets: { title: "Mes ensembles", manage: "Gérez vos ensembles de mots. Cliquez pour développer et voir les mots.", noSets: "Aucun ensemble créé pour le moment" }
    },
    games: {
      chooseActivity: "Choisir une activité", setNotFound: "Ensemble introuvable", wordsInSet: "Mots dans cet ensemble", startPractice: "Commencer la pratique", quickPractice: "Pratique rapide",
      templates: { flashcard: { name: "Flashcard", description: "Retournez pour révéler les traductions" }, match: { name: "Associer", description: "Glissez et connectez les paires" }, quiz: { name: "Quiz", description: "Questions à choix multiples" }, fillBlank: { name: "Remplir le blanc", description: "Complétez les phrases avec le bon mot", aiHints: "Indices IA disponibles" } },
      flashcard: { title: "Flashcards : {{setName}}", tapToFlip: "Appuyez pour retourner", clickToFlip: "Cliquez pour retourner", complete: "Terminé" },
      quiz: { title: "Quiz : {{setName}}", question: "Question {{current}} / {{total}}", translate: "Traduire :", nextQuestion: "Question suivante", loadingQuiz: "Chargement du quiz...", complete: { title: "Quiz terminé !", score: "Vous avez obtenu {{score}}/{{total}} ({{percentage}}%)" } },
      match: { title: "Associer : {{setName}}", words: "Mots", translations: "Traductions", complete: { title: "Félicitations !", message: "Vous avez terminé le jeu d'association en {{time}} !" } },
      fillBlank: { title: "Remplir le blanc : {{setName}}", question: "Question {{current}} / {{total}}", translation: "Traduction :", fillPrompt: "Remplir le blanc :", choosePrompt: "Choisissez le mot correct :", loadingNext: "Chargement de la question suivante...", generatingSentences: "Génération des phrases...", correctAnswer: "Réponse correcte :", complete: { title: "Exercice terminé !", score: "Vous avez obtenu {{score}}/{{total}} ({{percentage}}%)" } },
      home: { title: "Accueil", greeting: "Bonjour, {{name}} !", readyToLearn: "Prêt à apprendre aujourd'hui ?", noSets: "Aucun ensemble pour le moment", createFirstSet: "Créez votre premier ensemble de mots pour commencer !", createSet: "Créer un ensemble", featuredSets: "Ensembles en vedette", tryThem: "Essayez-les !", demoDescription: "Pratiquez avec ces ensembles de démonstration pour commencer" },
      dashboard: { title: "Tableau de bord", lastPracticed: "Dernière pratique", streak: "Série" },
      mySets: { title: "Mes ensembles", noSets: "Aucun ensemble pour le moment", createFirstSet: "Créez votre premier ensemble de mots pour commencer !", createSet: "Créer un ensemble" },
      setCard: { featured: "En vedette", complete: "{{percent}}% terminé", lastPracticed: "Dernière pratique {{date}}", deleteSet: "Supprimer l'ensemble", deleteConfirm: "Êtes-vous sûr de vouloir supprimer \"{{setName}}\" ? Cette action ne peut pas être annulée.", demoInfo: "Ceci est un ensemble de démonstration. Créez votre propre ensemble pour commencer !" }
    },
    profile: {
      title: "Profil", guest: "Invité", guestAccount: "Compte invité", appAccount: "Compte d'application",
      stats: { sets: "Ensembles", words: "Mots", practiced: "Pratiqué" },
      progress: "Progrès",
      settings: { title: "Paramètres", subtitle: "Paramètres de l'application", description: "Thème, langues et préférences" },
      yourSets: "Vos ensembles", noSetsYet: "Aucun ensemble créé pour le moment",
      deleteSet: { title: "Supprimer l'ensemble", message: "Êtes-vous sûr de vouloir supprimer \"{{setName}}\" ?", confirm: "Supprimer" }
    },
    create: {
      title: "Créer un ensemble", editTitle: "Modifier l'ensemble", setName: "Nom de l'ensemble", setNamePlaceholder: "p. ex., Vocabulaire professionnel", languagePair: "Apprendre {{target}} → {{native}}", words: "Mots", addWord: "Ajouter un mot", aiSuggestions: "Suggestions IA", limitReached: "Limite atteinte", limitMessage: "Maximum {{max}} mots par ensemble",
      errors: { fillAllFields: "Veuillez remplir tous les champs", atLeastOneWord: "Veuillez ajouter au moins une paire de mots", createFailed: "Échec de la création de l'ensemble. Veuillez réessayer.", networkError: "Erreur réseau. Veuillez vérifier votre connexion et réessayer." },
      success: { created: "Ensemble créé avec succès !", updated: "Ensemble mis à jour avec succès !" },
      ai: { modalTitle: "Suggestions de mots IA", themePlaceholder: "Thème (p. ex., animaux, nourriture)", countPlaceholder: "#", countHint: "Générez jusqu'à {{max}} mots (5 par défaut)", generatingWithContext: "Génération de suggestions basées sur vos {{count}} {{word}} existants...", generatingGeneric: "Génération de suggestions avec l'IA...", selectPrompt: "Sélectionnez les mots à ajouter ({{count}} sélectionnés)", noSuggestions: "Aucune suggestion pour le moment. Cliquez sur Générer pour obtenir des suggestions de mots alimentées par l'IA !", addSelected: "Ajouter {{count}} {{word}}" },
      bulkImport: { button: "Importation en masse", title: "Importation en masse de mots", howTo: "Comment importer", instructions: "Collez vos paires de mots ci-dessous, une par ligne. Séparez chaque mot de sa traduction par une tabulation, une virgule ou un tiret.", example: "Exemple :", separator: "Séparateur", separators: { tab: "Tabulation", comma: "Virgule (,)", dash: "Tiret (-)" }, pasteWords: "Collez vos mots", placeholder: "mot1\ttraduction1\nmot2\ttraduction2\nmot3\ttraduction3", preview: "Aperçu", previewTitle: "Aperçu", import: "Importer {{count}} mots" },
      languageOverride: { title: "Paramètres de langue", custom: "Personnalisé", description: "Remplacez les langues par défaut pour cet ensemble uniquement. Laissez par défaut pour utiliser vos paramètres de langue globaux.", usingDefaults: "Utilisation des langues par défaut", selectTarget: "Sélectionner la langue cible", selectNative: "Sélectionner la langue maternelle", targetLabel: "Apprentissage", nativeLabel: "Traductions", useDefaults: "Utiliser les langues par défaut" }
    },
    auth: {
      appName: "Exquizite", tagline: "Apprenez le vocabulaire avec des jeux alimentés par l'IA",
      login: { title: "Bon retour", signIn: "Se connecter", email: "E-mail", emailPlaceholder: "votre@email.com", password: "Mot de passe", passwordPlaceholder: "Entrez le mot de passe", noAccount: "Vous n'avez pas de compte ? S'inscrire", continueAsGuest: "Continuer en tant qu'invité", or: "ou", aiEnhanced: "Expérience d'apprentissage améliorée par l'IA" },
      signup: { title: "Créer un compte", signUp: "S'inscrire", name: "Nom", namePlaceholder: "Votre nom", email: "E-mail", emailPlaceholder: "votre@email.com", password: "Mot de passe", passwordPlaceholder: "Min 6 caractères", confirmPassword: "Confirmer le mot de passe", confirmPasswordPlaceholder: "Ré-entrez le mot de passe", hasAccount: "Vous avez déjà un compte ? Se connecter" },
      languageSetup: { title: "Configuration de la langue", heading: "Que voulez-vous apprendre ?", description: "Choisissez votre langue d'apprentissage et la langue que vous parlez", targetLanguage: "Je veux apprendre", targetPlaceholder: "Sélectionner la langue à apprendre", nativeLanguage: "Je parle", nativePlaceholder: "Sélectionner votre langue", info: "L'interface de l'application sera dans la langue que vous parlez", getStarted: "Commencer l'apprentissage" },
      errors: { fillAllFields: "Veuillez remplir tous les champs", enterName: "Veuillez entrer votre nom", passwordMismatch: "Les mots de passe ne correspondent pas", passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères" },
      guest: { title: "Compte invité", upgradeTitle: "Améliorez votre compte", upgradeMessage: "Créez un compte complet pour synchroniser vos données et ne jamais perdre votre progrès", createAccount: "Créer un compte", createFullAccount: "Créer un compte complet", syncMessage: "Synchronisez vos données et ne perdez jamais votre progrès", youAreGuest: "Vous utilisez un compte invité", savePermanently: "Créez un compte pour enregistrer votre progrès de manière permanente", upgradeNow: "Améliorer maintenant" },
      signOut: { title: "Se déconnecter", message: "Êtes-vous sûr de vouloir vous déconnecter ?", confirm: "Se déconnecter" }
    }
  }
};

const translationsDir = path.join(__dirname, '..', 'translations');

// Create French translations
const lang = 'fr';
const langDir = path.join(translationsDir, lang);

if (!fs.existsSync(langDir)) {
  fs.mkdirSync(langDir, { recursive: true });
}

Object.keys(translations[lang]).forEach(namespace => {
  const filePath = path.join(langDir, `${namespace}.json`);
  fs.writeFileSync(filePath, JSON.stringify(translations[lang][namespace], null, 2), 'utf8');
  console.log(`✓ Created ${lang}/${namespace}.json`);
});

console.log('\n✅ French translations created!');
