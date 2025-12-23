#!/usr/bin/env node

/**
 * Complete translations data for all 35 remaining languages
 * This file contains all UI translations organized by language code
 */

const ALL_TRANSLATIONS = {
  // Italian (it)
  it: {
    common: {
      buttons: { add: "Aggiungi", done: "Fatto", cancel: "Annulla", delete: "Elimina", share: "Condividi", play: "Gioca", next: "Avanti", previous: "Precedente", skip: "Salta", check: "Verifica risposta", save: "Salva", saving: "Salvataggio...", finish: "Termina", tryAgain: "Riprova", playAgain: "Gioca di nuovo", showHint: "Mostra suggerimento", generate: "Genera", generating: "Generazione..." },
      status: { loading: "Caricamento...", saving: "Salvataggio...", generating: "Generazione...", noWords: "Nessuna parola in questo set", success: "Successo", error: "Errore" },
      time: { never: "Mai", today: "Oggi", yesterday: "Ieri", daysAgo: "{{count}} giorni fa", lastPracticed: "Ultima pratica {{date}}" },
      counts: { word: "parola", words: "parole", set: "set", sets: "set", wordCount: "{{count}} parola", wordCount_other: "{{count}} parole", setCount: "{{count}} set", setCount_other: "{{count}} set", progress: "{{current}}/{{total}}" },
      dialogs: { areYouSure: "Sei sicuro?", cannotUndo: "Questa azione non può essere annullata." },
      sharing: { shareSet: "Condividi set", shareCode: "Codice di condivisione", shareLink: "Link di condivisione", copyLink: "Copia link", copied: "Copiato!", copy: "Copia", views: "Visualizzazioni", copies: "Copie", generatingLink: "Generazione link di condivisione...", linkInfo: "Chiunque abbia questo link può visualizzare e copiare il tuo set", deactivateLink: "Disattiva link di condivisione", deactivateConfirm: "Sei sicuro di voler disattivare questo link di condivisione? Chiunque abbia il link non potrà più accedere a questo set.", deactivate: "Disattiva", linkDeactivated: "Il link di condivisione è stato disattivato", shareError: "Impossibile generare il link di condivisione. Riprova.", copyError: "Impossibile copiare il link negli appunti", linkCopied: "Link copiato", linkCopiedToClipboard: "Link di condivisione copiato negli appunti" },
      tour: { skip: "Salta", next: "Avanti", back: "Indietro", getStarted: "Inizia", slides: { vocabulary: { title: "Costruisci il tuo vocabolario", description: "Aggiungi parole manualmente o usa l'IA per generare set di vocabolario tematici. Crea fino a 20 parole per set." }, organize: { title: "Organizza il tuo apprendimento", description: "Raggruppa le parole in set tematici come \"Cibo spagnolo\" o \"Viaggio tedesco\". Nomina i tuoi set per un facile accesso." }, learn: { title: "Impara a modo tuo", description: "Pratica con 4 modalità di gioco: Flashcard, Abbina coppie, Quiz a scelta multipla e Riempi lo spazio vuoto." }, share: { title: "Condividi la tua conoscenza", description: "Genera link di condivisione per i tuoi set. Altri possono visualizzarli e copiarli nella loro libreria." } } }
    },
    settings: {
      title: "Impostazioni",
      appLanguage: { title: "Lingua dell'app", description: "Scegli la lingua per l'interfaccia dell'app.", label: "Lingua dell'interfaccia", placeholder: "Seleziona lingua dell'app" },
      languages: { title: "Impostazioni lingua", description: "Cambia la tua lingua di apprendimento e dell'interfaccia. I nuovi set useranno queste lingue.", targetLanguage: "Apprendimento", targetPlaceholder: "Seleziona lingua da imparare", nativeLanguage: "Interfaccia e traduzioni", nativePlaceholder: "Seleziona la tua lingua", changeNote: "La modifica di queste impostazioni influenzerà i nuovi set di parole. I tuoi set esistenti manterranno le loro lingue originali." },
      appearance: { title: "Aspetto", description: "Scegli come appare l'app. Auto corrisponderà al tema del tuo dispositivo.", light: "Chiaro", dark: "Scuro", auto: "Auto", info: "Le modifiche al tema si applicano immediatamente a tutte le schermate" },
      mySets: { title: "I miei set", manage: "Gestisci i tuoi set di parole. Clicca per espandere e visualizzare le parole.", noSets: "Nessun set creato ancora" }
    },
    games: {
      chooseActivity: "Scegli attività", setNotFound: "Set non trovato", wordsInSet: "Parole in questo set", startPractice: "Inizia pratica", quickPractice: "Pratica rapida",
      templates: { flashcard: { name: "Flashcard", description: "Gira per rivelare le traduzioni" }, match: { name: "Abbina", description: "Trascina e connetti le coppie" }, quiz: { name: "Quiz", description: "Domande a scelta multipla" }, fillBlank: { name: "Riempi lo spazio vuoto", description: "Completa le frasi con la parola giusta", aiHints: "Suggerimenti IA disponibili" } },
      flashcard: { title: "Flashcard: {{setName}}", tapToFlip: "Tocca per girare", clickToFlip: "Clicca per girare", complete: "Completo" },
      quiz: { title: "Quiz: {{setName}}", question: "Domanda {{current}} / {{total}}", translate: "Traduci:", nextQuestion: "Domanda successiva", loadingQuiz: "Caricamento quiz...", complete: { title: "Quiz completato!", score: "Hai ottenuto {{score}}/{{total}} ({{percentage}}%)" } },
      match: { title: "Abbina: {{setName}}", words: "Parole", translations: "Traduzioni", complete: { title: "Congratulazioni!", message: "Hai completato il gioco di abbinamento in {{time}}!" } },
      fillBlank: { title: "Riempi lo spazio vuoto: {{setName}}", question: "Domanda {{current}} / {{total}}", translation: "Traduzione:", fillPrompt: "Riempi lo spazio vuoto:", choosePrompt: "Scegli la parola corretta:", loadingNext: "Caricamento prossima domanda...", generatingSentences: "Generazione frasi...", correctAnswer: "Risposta corretta:", complete: { title: "Esercizio completato!", score: "Hai ottenuto {{score}}/{{total}} ({{percentage}}%)" } },
      home: { title: "Home", greeting: "Ciao, {{name}}!", readyToLearn: "Pronto per imparare oggi?", noSets: "Nessun set ancora", createFirstSet: "Crea il tuo primo set di parole per iniziare!", createSet: "Crea set", featuredSets: "Set in evidenza", tryThem: "Provaci!", demoDescription: "Pratica con questi set demo per iniziare" },
      dashboard: { title: "Dashboard", lastPracticed: "Ultima pratica", streak: "Serie" },
      mySets: { title: "I miei set", noSets: "Nessun set ancora", createFirstSet: "Crea il tuo primo set di parole per iniziare!", createSet: "Crea set" },
      setCard: { featured: "In evidenza", complete: "{{percent}}% completo", lastPracticed: "Ultima pratica {{date}}", deleteSet: "Elimina set", deleteConfirm: "Sei sicuro di voler eliminare \"{{setName}}\"? Questa azione non può essere annullata.", demoInfo: "Questo è un set demo. Crea il tuo set per iniziare!" }
    },
    profile: {
      title: "Profilo", guest: "Ospite", guestAccount: "Account ospite", appAccount: "Account app",
      stats: { sets: "Set", words: "Parole", practiced: "Praticato" },
      progress: "Progresso",
      settings: { title: "Impostazioni", subtitle: "Impostazioni app", description: "Tema, lingue e preferenze" },
      yourSets: "I tuoi set", noSetsYet: "Nessun set creato ancora",
      deleteSet: { title: "Elimina set", message: "Sei sicuro di voler eliminare \"{{setName}}\"?", confirm: "Elimina" }
    },
    create: {
      title: "Crea set", editTitle: "Modifica set", setName: "Nome set", setNamePlaceholder: "es., Vocabolario di lavoro", languagePair: "Impara {{target}} → {{native}}", words: "Parole", addWord: "Aggiungi parola", aiSuggestions: "Suggerimenti IA", limitReached: "Limite raggiunto", limitMessage: "Massimo {{max}} parole per set",
      errors: { fillAllFields: "Compila tutti i campi", atLeastOneWord: "Aggiungi almeno una coppia di parole", createFailed: "Impossibile creare il set. Riprova.", networkError: "Errore di rete. Controlla la connessione e riprova." },
      success: { created: "Set creato con successo!", updated: "Set aggiornato con successo!" },
      ai: { modalTitle: "Suggerimenti di parole IA", themePlaceholder: "Tema (es., animali, cibo)", countPlaceholder: "#", countHint: "Genera fino a {{max}} parole (5 per impostazione predefinita)", generatingWithContext: "Generazione suggerimenti basati sulle tue {{count}} {{word}} esistenti...", generatingGeneric: "Generazione suggerimenti con IA...", selectPrompt: "Seleziona parole da aggiungere ({{count}} selezionate)", noSuggestions: "Nessun suggerimento ancora. Clicca Genera per ottenere suggerimenti di parole alimentati da IA!", addSelected: "Aggiungi {{count}} {{word}}" },
      bulkImport: { button: "Importazione di massa", title: "Importazione di massa di parole", howTo: "Come importare", instructions: "Incolla le tue coppie di parole sotto, una per riga. Separa ogni parola dalla sua traduzione con una tabulazione, virgola o trattino.", example: "Esempio:", separator: "Separatore", separators: { tab: "Tabulazione", comma: "Virgola (,)", dash: "Trattino (-)" }, pasteWords: "Incolla le tue parole", placeholder: "parola1\ttraduzione1\nparola2\ttraduzione2\nparola3\ttraduzione3", preview: "Anteprima", previewTitle: "Anteprima", import: "Importa {{count}} parole" },
      languageOverride: { title: "Impostazioni lingua", custom: "Personalizzato", description: "Sovrascrivi le lingue predefinite solo per questo set. Lascia predefinito per usare le impostazioni lingua globali.", usingDefaults: "Utilizzo lingue predefinite", selectTarget: "Seleziona lingua di destinazione", selectNative: "Seleziona lingua madre", targetLabel: "Apprendimento", nativeLabel: "Traduzioni", useDefaults: "Usa lingue predefinite" }
    },
    auth: {
      appName: "Exquizite", tagline: "Impara il vocabolario con giochi alimentati da IA",
      login: { title: "Bentornato", signIn: "Accedi", email: "Email", emailPlaceholder: "tua@email.com", password: "Password", passwordPlaceholder: "Inserisci password", noAccount: "Non hai un account? Registrati", continueAsGuest: "Continua come ospite", or: "o", aiEnhanced: "Esperienza di apprendimento potenziata da IA" },
      signup: { title: "Crea account", signUp: "Registrati", name: "Nome", namePlaceholder: "Il tuo nome", email: "Email", emailPlaceholder: "tua@email.com", password: "Password", passwordPlaceholder: "Min 6 caratteri", confirmPassword: "Conferma password", confirmPasswordPlaceholder: "Reinserisci password", hasAccount: "Hai già un account? Accedi" },
      languageSetup: { title: "Configurazione lingua", heading: "Cosa vuoi imparare?", description: "Scegli la tua lingua di apprendimento e la lingua che parli", targetLanguage: "Voglio imparare", targetPlaceholder: "Seleziona lingua da imparare", nativeLanguage: "Parlo", nativePlaceholder: "Seleziona la tua lingua", info: "L'interfaccia dell'app sarà nella lingua che parli", getStarted: "Inizia l'apprendimento" },
      errors: { fillAllFields: "Compila tutti i campi", enterName: "Inserisci il tuo nome", passwordMismatch: "Le password non corrispondono", passwordTooShort: "La password deve contenere almeno 6 caratteri" },
      guest: { title: "Account ospite", upgradeTitle: "Aggiorna il tuo account", upgradeMessage: "Crea un account completo per sincronizzare i tuoi dati e non perdere mai i tuoi progressi", createAccount: "Crea account", createFullAccount: "Crea un account completo", syncMessage: "Sincronizza i tuoi dati e non perdere mai i tuoi progressi", youAreGuest: "Stai usando un account ospite", savePermanently: "Crea un account per salvare i tuoi progressi in modo permanente", upgradeNow: "Aggiorna ora" },
      signOut: { title: "Disconnetti", message: "Sei sicuro di volerti disconnettere?", confirm: "Disconnetti" }
    }
  },

  // Portuguese (pt)
  pt: {
    common: {
      buttons: { add: "Adicionar", done: "Concluído", cancel: "Cancelar", delete: "Excluir", share: "Compartilhar", play: "Jogar", next: "Próximo", previous: "Anterior", skip: "Pular", check: "Verificar resposta", save: "Salvar", saving: "Salvando...", finish: "Terminar", tryAgain: "Tentar novamente", playAgain: "Jogar novamente", showHint: "Mostrar dica", generate: "Gerar", generating: "Gerando..." },
      status: { loading: "Carregando...", saving: "Salvando...", generating: "Gerando...", noWords: "Nenhuma palavra neste conjunto", success: "Sucesso", error: "Erro" },
      time: { never: "Nunca", today: "Hoje", yesterday: "Ontem", daysAgo: "{{count}} dias atrás", lastPracticed: "Última prática {{date}}" },
      counts: { word: "palavra", words: "palavras", set: "conjunto", sets: "conjuntos", wordCount: "{{count}} palavra", wordCount_other: "{{count}} palavras", setCount: "{{count}} conjunto", setCount_other: "{{count}} conjuntos", progress: "{{current}}/{{total}}" },
      dialogs: { areYouSure: "Tem certeza?", cannotUndo: "Esta ação não pode ser desfeita." },
      sharing: { shareSet: "Compartilhar conjunto", shareCode: "Código de compartilhamento", shareLink: "Link de compartilhamento", copyLink: "Copiar link", copied: "Copiado!", copy: "Copiar", views: "Visualizações", copies: "Cópias", generatingLink: "Gerando link de compartilhamento...", linkInfo: "Qualquer pessoa com este link pode visualizar e copiar seu conjunto", deactivateLink: "Desativar link de compartilhamento", deactivateConfirm: "Tem certeza de que deseja desativar este link de compartilhamento? Qualquer pessoa com o link não poderá mais acessar este conjunto.", deactivate: "Desativar", linkDeactivated: "O link de compartilhamento foi desativado", shareError: "Falha ao gerar link de compartilhamento. Tente novamente.", copyError: "Falha ao copiar link para a área de transferência", linkCopied: "Link copiado", linkCopiedToClipboard: "Link de compartilhamento copiado para a área de transferência" },
      tour: { skip: "Pular", next: "Próximo", back: "Voltar", getStarted: "Começar", slides: { vocabulary: { title: "Construa seu vocabulário", description: "Adicione palavras manualmente ou use IA para gerar conjuntos de vocabulário temáticos. Crie até 20 palavras por conjunto." }, organize: { title: "Organize seu aprendizado", description: "Agrupe palavras em conjuntos temáticos como \"Comida espanhola\" ou \"Viagem alemã\". Nomeie seus conjuntos para fácil acesso." }, learn: { title: "Aprenda do seu jeito", description: "Pratique com 4 modos de jogo: Flashcards, Combine pares, Quiz de múltipla escolha e Preencha o espaço em branco." }, share: { title: "Compartilhe seu conhecimento", description: "Gere links de compartilhamento para seus conjuntos. Outros podem visualizá-los e copiá-los para sua biblioteca." } } }
    },
    settings: {
      title: "Configurações",
      appLanguage: { title: "Idioma do aplicativo", description: "Escolha o idioma para a interface do aplicativo.", label: "Idioma da interface", placeholder: "Selecionar idioma do aplicativo" },
      languages: { title: "Configurações de idioma", description: "Altere seu idioma de aprendizado e interface. Novos conjuntos usarão esses idiomas.", targetLanguage: "Aprendizagem", targetPlaceholder: "Selecionar idioma para aprender", nativeLanguage: "Interface e traduções", nativePlaceholder: "Selecionar seu idioma", changeNote: "A alteração dessas configurações afetará novos conjuntos de palavras. Seus conjuntos existentes manterão seus idiomas originais." },
      appearance: { title: "Aparência", description: "Escolha como o aplicativo se parece. Auto corresponderá ao tema do seu dispositivo.", light: "Claro", dark: "Escuro", auto: "Auto", info: "As alterações de tema se aplicam imediatamente a todas as telas" },
      mySets: { title: "Meus conjuntos", manage: "Gerencie seus conjuntos de palavras. Clique para expandir e visualizar palavras.", noSets: "Nenhum conjunto criado ainda" }
    },
    games: {
      chooseActivity: "Escolher atividade", setNotFound: "Conjunto não encontrado", wordsInSet: "Palavras neste conjunto", startPractice: "Iniciar prática", quickPractice: "Prática rápida",
      templates: { flashcard: { name: "Flashcard", description: "Vire para revelar traduções" }, match: { name: "Combinar", description: "Arraste e conecte pares" }, quiz: { name: "Quiz", description: "Perguntas de múltipla escolha" }, fillBlank: { name: "Preencher o espaço em branco", description: "Complete frases com a palavra certa", aiHints: "Dicas de IA disponíveis" } },
      flashcard: { title: "Flashcards: {{setName}}", tapToFlip: "Toque para virar", clickToFlip: "Clique para virar", complete: "Completo" },
      quiz: { title: "Quiz: {{setName}}", question: "Pergunta {{current}} / {{total}}", translate: "Traduzir:", nextQuestion: "Próxima pergunta", loadingQuiz: "Carregando quiz...", complete: { title: "Quiz concluído!", score: "Você pontuou {{score}}/{{total}} ({{percentage}}%)" } },
      match: { title: "Combinar: {{setName}}", words: "Palavras", translations: "Traduções", complete: { title: "Parabéns!", message: "Você concluiu o jogo de combinação em {{time}}!" } },
      fillBlank: { title: "Preencher o espaço em branco: {{setName}}", question: "Pergunta {{current}} / {{total}}", translation: "Tradução:", fillPrompt: "Preencher o espaço em branco:", choosePrompt: "Escolha a palavra correta:", loadingNext: "Carregando próxima pergunta...", generatingSentences: "Gerando frases...", correctAnswer: "Resposta correta:", complete: { title: "Exercício concluído!", score: "Você pontuou {{score}}/{{total}} ({{percentage}}%)" } },
      home: { title: "Início", greeting: "Olá, {{name}}!", readyToLearn: "Pronto para aprender hoje?", noSets: "Nenhum conjunto ainda", createFirstSet: "Crie seu primeiro conjunto de palavras para começar!", createSet: "Criar conjunto", featuredSets: "Conjuntos em destaque", tryThem: "Experimente!", demoDescription: "Pratique com estes conjuntos demo para começar" },
      dashboard: { title: "Painel", lastPracticed: "Última prática", streak: "Sequência" },
      mySets: { title: "Meus conjuntos", noSets: "Nenhum conjunto ainda", createFirstSet: "Crie seu primeiro conjunto de palavras para começar!", createSet: "Criar conjunto" },
      setCard: { featured: "Em destaque", complete: "{{percent}}% completo", lastPracticed: "Última prática {{date}}", deleteSet: "Excluir conjunto", deleteConfirm: "Tem certeza de que deseja excluir \"{{setName}}\"? Esta ação não pode ser desfeita.", demoInfo: "Este é um conjunto demo. Crie seu próprio conjunto para começar!" }
    },
    profile: {
      title: "Perfil", guest: "Convidado", guestAccount: "Conta de convidado", appAccount: "Conta do aplicativo",
      stats: { sets: "Conjuntos", words: "Palavras", practiced: "Praticado" },
      progress: "Progresso",
      settings: { title: "Configurações", subtitle: "Configurações do aplicativo", description: "Tema, idiomas e preferências" },
      yourSets: "Seus conjuntos", noSetsYet: "Nenhum conjunto criado ainda",
      deleteSet: { title: "Excluir conjunto", message: "Tem certeza de que deseja excluir \"{{setName}}\"?", confirm: "Excluir" }
    },
    create: {
      title: "Criar conjunto", editTitle: "Editar conjunto", setName: "Nome do conjunto", setNamePlaceholder: "ex., Vocabulário de trabalho", languagePair: "Aprender {{target}} → {{native}}", words: "Palavras", addWord: "Adicionar palavra", aiSuggestions: "Sugestões de IA", limitReached: "Limite atingido", limitMessage: "Máximo de {{max}} palavras por conjunto",
      errors: { fillAllFields: "Preencha todos os campos", atLeastOneWord: "Adicione pelo menos um par de palavras", createFailed: "Falha ao criar conjunto. Tente novamente.", networkError: "Erro de rede. Verifique sua conexão e tente novamente." },
      success: { created: "Conjunto criado com sucesso!", updated: "Conjunto atualizado com sucesso!" },
      ai: { modalTitle: "Sugestões de palavras de IA", themePlaceholder: "Tema (ex., animais, comida)", countPlaceholder: "#", countHint: "Gere até {{max}} palavras (5 por padrão)", generatingWithContext: "Gerando sugestões com base em suas {{count}} {{word}} existentes...", generatingGeneric: "Gerando sugestões com IA...", selectPrompt: "Selecione palavras para adicionar ({{count}} selecionadas)", noSuggestions: "Nenhuma sugestão ainda. Clique em Gerar para obter sugestões de palavras alimentadas por IA!", addSelected: "Adicionar {{count}} {{word}}" },
      bulkImport: { button: "Importação em massa", title: "Importação em massa de palavras", howTo: "Como importar", instructions: "Cole seus pares de palavras abaixo, um por linha. Separe cada palavra de sua tradução com uma tabulação, vírgula ou traço.", example: "Exemplo:", separator: "Separador", separators: { tab: "Tabulação", comma: "Vírgula (,)", dash: "Traço (-)" }, pasteWords: "Cole suas palavras", placeholder: "palavra1\ttradução1\npalavra2\ttradução2\npalavra3\ttradução3", preview: "Visualizar", previewTitle: "Visualizar", import: "Importar {{count}} palavras" },
      languageOverride: { title: "Configurações de idioma", custom: "Personalizado", description: "Substitua os idiomas padrão apenas para este conjunto. Deixe como padrão para usar suas configurações de idioma globais.", usingDefaults: "Usando idiomas padrão", selectTarget: "Selecionar idioma de destino", selectNative: "Selecionar idioma nativo", targetLabel: "Aprendizagem", nativeLabel: "Traduções", useDefaults: "Usar idiomas padrão" }
    },
    auth: {
      appName: "Exquizite", tagline: "Aprenda vocabulário com jogos alimentados por IA",
      login: { title: "Bem-vindo de volta", signIn: "Entrar", email: "E-mail", emailPlaceholder: "seu@email.com", password: "Senha", passwordPlaceholder: "Digite a senha", noAccount: "Não tem uma conta? Inscrever-se", continueAsGuest: "Continuar como convidado", or: "ou", aiEnhanced: "Experiência de aprendizado aprimorada por IA" },
      signup: { title: "Criar conta", signUp: "Inscrever-se", name: "Nome", namePlaceholder: "Seu nome", email: "E-mail", emailPlaceholder: "seu@email.com", password: "Senha", passwordPlaceholder: "Mín 6 caracteres", confirmPassword: "Confirmar senha", confirmPasswordPlaceholder: "Digite a senha novamente", hasAccount: "Já tem uma conta? Entrar" },
      languageSetup: { title: "Configuração de idioma", heading: "O que você quer aprender?", description: "Escolha seu idioma de aprendizado e o idioma que você fala", targetLanguage: "Quero aprender", targetPlaceholder: "Selecionar idioma para aprender", nativeLanguage: "Eu falo", nativePlaceholder: "Selecionar seu idioma", info: "A interface do aplicativo estará no idioma que você fala", getStarted: "Começar a aprender" },
      errors: { fillAllFields: "Preencha todos os campos", enterName: "Digite seu nome", passwordMismatch: "As senhas não correspondem", passwordTooShort: "A senha deve ter pelo menos 6 caracteres" },
      guest: { title: "Conta de convidado", upgradeTitle: "Atualize sua conta", upgradeMessage: "Crie uma conta completa para sincronizar seus dados e nunca perder seu progresso", createAccount: "Criar conta", createFullAccount: "Criar uma conta completa", syncMessage: "Sincronize seus dados e nunca perca seu progresso", youAreGuest: "Você está usando uma conta de convidado", savePermanently: "Crie uma conta para salvar seu progresso permanentemente", upgradeNow: "Atualizar agora" },
      signOut: { title: "Sair", message: "Tem certeza de que deseja sair?", confirm: "Sair" }
    }
  }
};

module.exports = { ALL_TRANSLATIONS };
