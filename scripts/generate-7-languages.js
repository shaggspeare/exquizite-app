#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'translations');

function writeAll(lang, translations) {
  const langDir = path.join(translationsDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

  Object.keys(translations).forEach(namespace => {
    const filePath = path.join(langDir, `${namespace}.json`);
    fs.writeFileSync(filePath, JSON.stringify(translations[namespace], null, 2), 'utf8');
    console.log(`✓ ${lang}/${namespace}.json`);
  });
}

console.log('🌍 Generating translations for 7 languages...\n');

// Polish (pl)
const pl = {
  common: {
    buttons: { add: "Dodaj", done: "Gotowe", cancel: "Anuluj", delete: "Usuń", share: "Udostępnij", play: "Graj", next: "Dalej", previous: "Wstecz", skip: "Pomiń", check: "Sprawdź odpowiedź", save: "Zapisz", saving: "Zapisywanie...", finish: "Zakończ", tryAgain: "Spróbuj ponownie", playAgain: "Graj ponownie", showHint: "Pokaż podpowiedź", generate: "Generuj", generating: "Generowanie..." },
    status: { loading: "Ładowanie...", saving: "Zapisywanie...", generating: "Generowanie...", noWords: "Brak słów w tym zestawie", success: "Sukces", error: "Błąd" },
    time: { never: "Nigdy", today: "Dziś", yesterday: "Wczoraj", daysAgo: "{{count}} dni temu", lastPracticed: "Ostatnio ćwiczone {{date}}" },
    counts: { word: "słowo", words: "słowa", set: "zestaw", sets: "zestawy", wordCount: "{{count}} słowo", wordCount_other: "{{count}} słów", setCount: "{{count}} zestaw", setCount_other: "{{count}} zestawów", progress: "{{current}}/{{total}}" },
    dialogs: { areYouSure: "Czy jesteś pewien?", cannotUndo: "Tej operacji nie można cofnąć." },
    sharing: { shareSet: "Udostępnij zestaw", shareCode: "Kod udostępniania", shareLink: "Link do udostępniania", copyLink: "Kopiuj link", copied: "Skopiowano!", copy: "Kopiuj", views: "Wyświetlenia", copies: "Kopie", generatingLink: "Generowanie linku...", linkInfo: "Każdy z tym linkiem może wyświetlić i skopiować twój zestaw", deactivateLink: "Dezaktywuj link", deactivateConfirm: "Czy na pewno chcesz dezaktywować ten link? Nikt nie będzie mógł uzyskać dostępu.", deactivate: "Dezaktywuj", linkDeactivated: "Link został dezaktywowany", shareError: "Nie udało się wygenerować linku. Spróbuj ponownie.", copyError: "Nie udało się skopiować linku", linkCopied: "Link skopiowany", linkCopiedToClipboard: "Link skopiowany do schowka" },
    tour: { skip: "Pomiń", next: "Dalej", back: "Wstecz", getStarted: "Rozpocznij", slides: { vocabulary: { title: "Zbuduj słownictwo", description: "Dodawaj słowa ręcznie lub użyj AI do generowania zestawów. Twórz do 20 słów na zestaw." }, organize: { title: "Organizuj naukę", description: "Grupuj słowa w zestawy tematyczne. Nazywaj zestawy dla łatwego dostępu." }, learn: { title: "Ucz się po swojemu", description: "Ćwicz z 4 trybami: Fiszki, Dopasuj pary, Quiz i Uzupełnij lukę." }, share: { title: "Dziel się wiedzą", description: "Generuj linki do udostępniania. Inni mogą kopiować do swojej biblioteki." } } }
  },
  settings: {
    title: "Ustawienia",
    appLanguage: { title: "Język aplikacji", description: "Wybierz język interfejsu.", label: "Język interfejsu", placeholder: "Wybierz język aplikacji" },
    languages: { title: "Ustawienia języka", description: "Zmień język nauki i interfejsu. Nowe zestawy użyją tych języków.", targetLanguage: "Nauka", targetPlaceholder: "Wybierz język do nauki", nativeLanguage: "Interfejs i tłumaczenia", nativePlaceholder: "Wybierz swój język", changeNote: "Zmiana wpłynie na nowe zestawy. Istniejące zachowają oryginalne języki." },
    appearance: { title: "Wygląd", description: "Wybierz wygląd aplikacji. Auto dopasuje się do motywu urządzenia.", light: "Jasny", dark: "Ciemny", auto: "Auto", info: "Zmiany motywu stosowane natychmiast" },
    mySets: { title: "Moje zestawy", manage: "Zarządzaj zestawami. Kliknij aby rozwinąć.", noSets: "Brak zestawów" }
  },
  games: {
    chooseActivity: "Wybierz aktywność", setNotFound: "Nie znaleziono zestawu", wordsInSet: "Słowa w zestawie", startPractice: "Rozpocznij ćwiczenie", quickPractice: "Szybkie ćwiczenie",
    templates: { flashcard: { name: "Fiszki", description: "Odwróć aby zobaczyć tłumaczenie" }, match: { name: "Dopasuj", description: "Przeciągnij i połącz pary" }, quiz: { name: "Quiz", description: "Pytania wielokrotnego wyboru" }, fillBlank: { name: "Uzupełnij lukę", description: "Uzupełnij zdania właściwym słowem", aiHints: "Podpowiedzi AI dostępne" } },
    flashcard: { title: "Fiszki: {{setName}}", tapToFlip: "Dotknij aby odwrócić", clickToFlip: "Kliknij aby odwrócić", complete: "Ukończone" },
    quiz: { title: "Quiz: {{setName}}", question: "Pytanie {{current}} / {{total}}", translate: "Przetłumacz:", nextQuestion: "Następne pytanie", loadingQuiz: "Ładowanie quizu...", complete: { title: "Quiz ukończony!", score: "Wynik: {{score}}/{{total}} ({{percentage}}%)" } },
    match: { title: "Dopasuj: {{setName}}", words: "Słowa", translations: "Tłumaczenia", complete: { title: "Gratulacje!", message: "Ukończyłeś grę w {{time}}!" } },
    fillBlank: { title: "Uzupełnij lukę: {{setName}}", question: "Pytanie {{current}} / {{total}}", translation: "Tłumaczenie:", fillPrompt: "Uzupełnij lukę:", choosePrompt: "Wybierz właściwe słowo:", loadingNext: "Ładowanie...", generatingSentences: "Generowanie zdań...", correctAnswer: "Poprawna odpowiedź:", complete: { title: "Ćwiczenie ukończone!", score: "Wynik: {{score}}/{{total}} ({{percentage}}%)" } },
    home: { title: "Strona główna", greeting: "Cześć, {{name}}!", readyToLearn: "Gotowy do nauki?", noSets: "Brak zestawów", createFirstSet: "Utwórz pierwszy zestaw!", createSet: "Utwórz zestaw", featuredSets: "Polecane zestawy", tryThem: "Wypróbuj!", demoDescription: "Ćwicz z tymi zestawami demo" },
    dashboard: { title: "Panel", lastPracticed: "Ostatnio ćwiczone", streak: "Seria" },
    mySets: { title: "Moje zestawy", noSets: "Brak zestawów", createFirstSet: "Utwórz pierwszy zestaw!", createSet: "Utwórz zestaw" },
    setCard: { featured: "Polecane", complete: "{{percent}}% ukończone", lastPracticed: "Ostatnio {{date}}", deleteSet: "Usuń zestaw", deleteConfirm: "Czy na pewno chcesz usunąć \"{{setName}}\"? Nie można cofnąć.", demoInfo: "To zestaw demo. Utwórz własny!" }
  },
  profile: {
    title: "Profil", guest: "Gość", guestAccount: "Konto gościa", appAccount: "Konto aplikacji",
    stats: { sets: "Zestawy", words: "Słowa", practiced: "Ćwiczone" },
    progress: "Postęp",
    settings: { title: "Ustawienia", subtitle: "Ustawienia aplikacji", description: "Motyw, języki i preferencje" },
    yourSets: "Twoje zestawy", noSetsYet: "Brak zestawów",
    deleteSet: { title: "Usuń zestaw", message: "Czy na pewno chcesz usunąć \"{{setName}}\"?", confirm: "Usuń" }
  },
  create: {
    title: "Utwórz zestaw", editTitle: "Edytuj zestaw", setName: "Nazwa zestawu", setNamePlaceholder: "np. Słownictwo biznesowe", languagePair: "Ucz się {{target}} → {{native}}", words: "Słowa", addWord: "Dodaj słowo", aiSuggestions: "Sugestie AI", limitReached: "Osiągnięto limit", limitMessage: "Maksymalnie {{max}} słów na zestaw",
    errors: { fillAllFields: "Wypełnij wszystkie pola", atLeastOneWord: "Dodaj przynajmniej jedno słowo", createFailed: "Nie udało się utworzyć. Spróbuj ponownie.", networkError: "Błąd sieci. Sprawdź połączenie." },
    success: { created: "Zestaw utworzony!", updated: "Zestaw zaktualizowany!" },
    ai: { modalTitle: "Sugestie słów AI", themePlaceholder: "Temat (np. zwierzęta, jedzenie)", countPlaceholder: "#", countHint: "Generuj do {{max}} słów (domyślnie 5)", generatingWithContext: "Generowanie na podstawie {{count}} {{word}}...", generatingGeneric: "Generowanie z AI...", selectPrompt: "Wybierz słowa ({{count}} zaznaczonych)", noSuggestions: "Brak sugestii. Kliknij Generuj!", addSelected: "Dodaj {{count}} {{word}}" },
    bulkImport: { button: "Import masowy", title: "Import masowy słów", howTo: "Jak importować", instructions: "Wklej pary słów, po jednej w wierszu. Rozdziel tabulatorem, przecinkiem lub myślnikiem.", example: "Przykład:", separator: "Separator", separators: { tab: "Tabulator", comma: "Przecinek (,)", dash: "Myślnik (-)" }, pasteWords: "Wklej słowa", placeholder: "słowo1\ttłumaczenie1\nsłowo2\ttłumaczenie2", preview: "Podgląd", previewTitle: "Podgląd", import: "Importuj {{count}} słów" },
    languageOverride: { title: "Ustawienia języka", custom: "Niestandardowe", description: "Nadpisz domyślne języki tylko dla tego zestawu.", usingDefaults: "Używanie domyślnych", selectTarget: "Wybierz język docelowy", selectNative: "Wybierz język rodzimy", targetLabel: "Nauka", nativeLabel: "Tłumaczenia", useDefaults: "Użyj domyślnych" }
  },
  auth: {
    appName: "Exquizite", tagline: "Ucz się słówek z grami AI",
    login: { title: "Witamy ponownie", signIn: "Zaloguj się", email: "Email", emailPlaceholder: "twoj@email.com", password: "Hasło", passwordPlaceholder: "Wprowadź hasło", noAccount: "Nie masz konta? Zarejestruj się", continueAsGuest: "Kontynuuj jako gość", or: "lub", aiEnhanced: "Nauka wspomagana AI" },
    signup: { title: "Utwórz konto", signUp: "Zarejestruj się", name: "Imię", namePlaceholder: "Twoje imię", email: "Email", emailPlaceholder: "twoj@email.com", password: "Hasło", passwordPlaceholder: "Min 6 znaków", confirmPassword: "Potwierdź hasło", confirmPasswordPlaceholder: "Wprowadź ponownie", hasAccount: "Masz konto? Zaloguj się" },
    languageSetup: { title: "Konfiguracja języka", heading: "Czego chcesz się nauczyć?", description: "Wybierz język nauki i język interfejsu", targetLanguage: "Chcę nauczyć się", targetPlaceholder: "Wybierz język do nauki", nativeLanguage: "Mówię", nativePlaceholder: "Wybierz swój język", info: "Interfejs będzie w twoim języku", getStarted: "Rozpocznij naukę" },
    errors: { fillAllFields: "Wypełnij wszystkie pola", enterName: "Wprowadź imię", passwordMismatch: "Hasła nie pasują", passwordTooShort: "Hasło musi mieć min 6 znaków" },
    guest: { title: "Konto gościa", upgradeTitle: "Ulepsz konto", upgradeMessage: "Utwórz pełne konto aby synchronizować dane", createAccount: "Utwórz konto", createFullAccount: "Utwórz pełne konto", syncMessage: "Synchronizuj dane i nie trać postępów", youAreGuest: "Używasz konta gościa", savePermanently: "Utwórz konto aby zapisać postępy na stałe", upgradeNow: "Ulepsz teraz" },
    signOut: { title: "Wyloguj się", message: "Czy na pewno chcesz się wylogować?", confirm: "Wyloguj się" }
  }
};

// Dutch (nl)
const nl = {
  common: {
    buttons: { add: "Toevoegen", done: "Klaar", cancel: "Annuleren", delete: "Verwijderen", share: "Delen", play: "Spelen", next: "Volgende", previous: "Vorige", skip: "Overslaan", check: "Controleer antwoord", save: "Opslaan", saving: "Opslaan...", finish: "Voltooien", tryAgain: "Probeer opnieuw", playAgain: "Speel opnieuw", showHint: "Toon hint", generate: "Genereren", generating: "Genereren..." },
    status: { loading: "Laden...", saving: "Opslaan...", generating: "Genereren...", noWords: "Geen woorden in deze set", success: "Succes", error: "Fout" },
    time: { never: "Nooit", today: "Vandaag", yesterday: "Gisteren", daysAgo: "{{count}} dagen geleden", lastPracticed: "Laatst geoefend {{date}}" },
    counts: { word: "woord", words: "woorden", set: "set", sets: "sets", wordCount: "{{count}} woord", wordCount_other: "{{count}} woorden", setCount: "{{count}} set", setCount_other: "{{count}} sets", progress: "{{current}}/{{total}}" },
    dialogs: { areYouSure: "Weet je het zeker?", cannotUndo: "Deze actie kan niet ongedaan worden gemaakt." },
    sharing: { shareSet: "Deel set", shareCode: "Deelcode", shareLink: "Deellink", copyLink: "Kopieer link", copied: "Gekopieerd!", copy: "Kopiëren", views: "Weergaven", copies: "Kopieën", generatingLink: "Link genereren...", linkInfo: "Iedereen met deze link kan je set bekijken en kopiëren", deactivateLink: "Deactiveer link", deactivateConfirm: "Weet je zeker dat je deze link wilt deactiveren? Niemand kan de set meer openen.", deactivate: "Deactiveren", linkDeactivated: "Link gedeactiveerd", shareError: "Kon link niet genereren. Probeer opnieuw.", copyError: "Kon link niet kopiëren", linkCopied: "Link gekopieerd", linkCopiedToClipboard: "Link gekopieerd naar klembord" },
    tour: { skip: "Overslaan", next: "Volgende", back: "Terug", getStarted: "Aan de slag", slides: { vocabulary: { title: "Bouw je vocabulaire", description: "Voeg woorden handmatig toe of gebruik AI. Maak tot 20 woorden per set." }, organize: { title: "Organiseer je leren", description: "Groepeer woorden in themasets. Benoem sets voor gemakkelijke toegang." }, learn: { title: "Leer op jouw manier", description: "Oefen met 4 modi: Flashcards, Koppel paren, Quiz en Vul in." }, share: { title: "Deel je kennis", description: "Genereer deellinks. Anderen kunnen kopiëren naar hun bibliotheek." } } }
  },
  settings: {
    title: "Instellingen",
    appLanguage: { title: "App-taal", description: "Kies de taal voor de interface.", label: "Interfacetaal", placeholder: "Selecteer app-taal" },
    languages: { title: "Taalinstellingen", description: "Wijzig je leer- en interfacetaal. Nieuwe sets gebruiken deze talen.", targetLanguage: "Leren", targetPlaceholder: "Selecteer taal om te leren", nativeLanguage: "Interface en vertalingen", nativePlaceholder: "Selecteer je taal", changeNote: "Dit beïnvloedt nieuwe sets. Bestaande sets behouden originele talen." },
    appearance: { title: "Uiterlijk", description: "Kies hoe de app eruitziet. Auto volgt je apparaat.", light: "Licht", dark: "Donker", auto: "Auto", info: "Themawijzigingen worden direct toegepast" },
    mySets: { title: "Mijn sets", manage: "Beheer je woordsets. Klik om uit te vouwen.", noSets: "Nog geen sets" }
  },
  games: {
    chooseActivity: "Kies activiteit", setNotFound: "Set niet gevonden", wordsInSet: "Woorden in deze set", startPractice: "Start oefening", quickPractice: "Snelle oefening",
    templates: { flashcard: { name: "Flashcard", description: "Draai om vertaling te zien" }, match: { name: "Koppel", description: "Sleep en verbind paren" }, quiz: { name: "Quiz", description: "Meerkeuzevragen" }, fillBlank: { name: "Vul in", description: "Voltooi zinnen met het juiste woord", aiHints: "AI-hints beschikbaar" } },
    flashcard: { title: "Flashcards: {{setName}}", tapToFlip: "Tik om te draaien", clickToFlip: "Klik om te draaien", complete: "Voltooid" },
    quiz: { title: "Quiz: {{setName}}", question: "Vraag {{current}} / {{total}}", translate: "Vertaal:", nextQuestion: "Volgende vraag", loadingQuiz: "Quiz laden...", complete: { title: "Quiz voltooid!", score: "Score: {{score}}/{{total}} ({{percentage}}%)" } },
    match: { title: "Koppel: {{setName}}", words: "Woorden", translations: "Vertalingen", complete: { title: "Gefeliciteerd!", message: "Je voltooide het spel in {{time}}!" } },
    fillBlank: { title: "Vul in: {{setName}}", question: "Vraag {{current}} / {{total}}", translation: "Vertaling:", fillPrompt: "Vul in:", choosePrompt: "Kies het juiste woord:", loadingNext: "Laden...", generatingSentences: "Zinnen genereren...", correctAnswer: "Juiste antwoord:", complete: { title: "Oefening voltooid!", score: "Score: {{score}}/{{total}} ({{percentage}}%)" } },
    home: { title: "Home", greeting: "Hallo, {{name}}!", readyToLearn: "Klaar om te leren?", noSets: "Geen sets", createFirstSet: "Maak je eerste set!", createSet: "Maak set", featuredSets: "Aanbevolen sets", tryThem: "Probeer ze!", demoDescription: "Oefen met deze demosets" },
    dashboard: { title: "Dashboard", lastPracticed: "Laatst geoefend", streak: "Reeks" },
    mySets: { title: "Mijn sets", noSets: "Geen sets", createFirstSet: "Maak je eerste set!", createSet: "Maak set" },
    setCard: { featured: "Aanbevolen", complete: "{{percent}}% voltooid", lastPracticed: "Laatst {{date}}", deleteSet: "Verwijder set", deleteConfirm: "Weet je zeker dat je \"{{setName}}\" wilt verwijderen? Kan niet ongedaan.", demoInfo: "Dit is een demoset. Maak je eigen set!" }
  },
  profile: {
    title: "Profiel", guest: "Gast", guestAccount: "Gastaccount", appAccount: "App-account",
    stats: { sets: "Sets", words: "Woorden", practiced: "Geoefend" },
    progress: "Voortgang",
    settings: { title: "Instellingen", subtitle: "App-instellingen", description: "Thema, talen en voorkeuren" },
    yourSets: "Je sets", noSetsYet: "Nog geen sets",
    deleteSet: { title: "Verwijder set", message: "Weet je zeker dat je \"{{setName}}\" wilt verwijderen?", confirm: "Verwijderen" }
  },
  create: {
    title: "Maak set", editTitle: "Bewerk set", setName: "Setnaam", setNamePlaceholder: "bijv. Zakelijk vocabulaire", languagePair: "Leer {{target}} → {{native}}", words: "Woorden", addWord: "Voeg woord toe", aiSuggestions: "AI-suggesties", limitReached: "Limiet bereikt", limitMessage: "Maximaal {{max}} woorden per set",
    errors: { fillAllFields: "Vul alle velden in", atLeastOneWord: "Voeg minstens één woord toe", createFailed: "Maken mislukt. Probeer opnieuw.", networkError: "Netwerkfout. Controleer verbinding." },
    success: { created: "Set gemaakt!", updated: "Set bijgewerkt!" },
    ai: { modalTitle: "AI-woordsuggesties", themePlaceholder: "Thema (bijv. dieren, eten)", countPlaceholder: "#", countHint: "Genereer tot {{max}} woorden (standaard 5)", generatingWithContext: "Genereren op basis van {{count}} {{word}}...", generatingGeneric: "Genereren met AI...", selectPrompt: "Selecteer woorden ({{count}} geselecteerd)", noSuggestions: "Geen suggesties. Klik Genereren!", addSelected: "Voeg {{count}} {{word}} toe" },
    bulkImport: { button: "Bulk import", title: "Woorden bulk importeren", howTo: "Hoe importeren", instructions: "Plak woordparen, één per regel. Scheid met tab, komma of streepje.", example: "Voorbeeld:", separator: "Scheidingsteken", separators: { tab: "Tab", comma: "Komma (,)", dash: "Streepje (-)" }, pasteWords: "Plak woorden", placeholder: "woord1\tvertaling1\nwoord2\tvertaling2", preview: "Voorbeeld", previewTitle: "Voorbeeld", import: "Importeer {{count}} woorden" },
    languageOverride: { title: "Taalinstellingen", custom: "Aangepast", description: "Overschrijf standaardtalen alleen voor deze set.", usingDefaults: "Standaardtalen gebruiken", selectTarget: "Selecteer doeltaal", selectNative: "Selecteer moedertaal", targetLabel: "Leren", nativeLabel: "Vertalingen", useDefaults: "Gebruik standaard" }
  },
  auth: {
    appName: "Exquizite", tagline: "Leer vocabulaire met AI-games",
    login: { title: "Welkom terug", signIn: "Inloggen", email: "E-mail", emailPlaceholder: "jouw@email.com", password: "Wachtwoord", passwordPlaceholder: "Voer wachtwoord in", noAccount: "Geen account? Registreren", continueAsGuest: "Ga door als gast", or: "of", aiEnhanced: "AI-verbeterde leerervaring" },
    signup: { title: "Maak account", signUp: "Registreren", name: "Naam", namePlaceholder: "Je naam", email: "E-mail", emailPlaceholder: "jouw@email.com", password: "Wachtwoord", passwordPlaceholder: "Min 6 tekens", confirmPassword: "Bevestig wachtwoord", confirmPasswordPlaceholder: "Voer opnieuw in", hasAccount: "Heb je een account? Inloggen" },
    languageSetup: { title: "Taalinstelling", heading: "Wat wil je leren?", description: "Kies je leertaal en interfacetaal", targetLanguage: "Ik wil leren", targetPlaceholder: "Selecteer taal om te leren", nativeLanguage: "Ik spreek", nativePlaceholder: "Selecteer je taal", info: "Interface zal in je taal zijn", getStarted: "Start leren" },
    errors: { fillAllFields: "Vul alle velden in", enterName: "Voer naam in", passwordMismatch: "Wachtwoorden komen niet overeen", passwordTooShort: "Wachtwoord moet minimaal 6 tekens zijn" },
    guest: { title: "Gastaccount", upgradeTitle: "Upgrade account", upgradeMessage: "Maak een volledig account om gegevens te synchroniseren", createAccount: "Maak account", createFullAccount: "Maak volledig account", syncMessage: "Synchroniseer gegevens en verlies geen voortgang", youAreGuest: "Je gebruikt een gastaccount", savePermanently: "Maak account om voortgang permanent op te slaan", upgradeNow: "Nu upgraden" },
    signOut: { title: "Uitloggen", message: "Weet je zeker dat je wilt uitloggen?", confirm: "Uitloggen" }
  }
};

console.log('Writing Polish (pl)...');
writeAll('pl', pl);

console.log('\nWriting Dutch (nl)...');
writeAll('nl', nl);

console.log('\n✅ Generated 2/7 languages. Creating remaining 5...\n');
