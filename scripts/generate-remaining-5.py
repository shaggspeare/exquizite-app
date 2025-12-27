#!/usr/bin/env python3
import json
import os

translations_dir = "/Users/slava/Projects/exquizite-app/translations"

# Swedish (sv)
sv = {
    "common": {
        "buttons": {"add": "Lägg till", "done": "Klar", "cancel": "Avbryt", "delete": "Radera", "share": "Dela", "play": "Spela", "next": "Nästa", "previous": "Föregående", "skip": "Hoppa över", "check": "Kontrollera svar", "save": "Spara", "saving": "Sparar...", "finish": "Avsluta", "tryAgain": "Försök igen", "playAgain": "Spela igen", "showHint": "Visa tips", "generate": "Generera", "generating": "Genererar..."},
        "status": {"loading": "Laddar...", "saving": "Sparar...", "generating": "Genererar...", "noWords": "Inga ord i denna uppsättning", "success": "Framgång", "error": "Fel"},
        "time": {"never": "Aldrig", "today": "Idag", "yesterday": "Igår", "daysAgo": "{{count}} dagar sedan", "lastPracticed": "Senast övad {{date}}"},
        "counts": {"word": "ord", "words": "ord", "set": "uppsättning", "sets": "uppsättningar", "wordCount": "{{count}} ord", "wordCount_other": "{{count}} ord", "setCount": "{{count}} uppsättning", "setCount_other": "{{count}} uppsättningar", "progress": "{{current}}/{{total}}"},
        "dialogs": {"areYouSure": "Är du säker?", "cannotUndo": "Denna åtgärd kan inte ångras."},
        "sharing": {"shareSet": "Dela uppsättning", "shareCode": "Delningskod", "shareLink": "Delningslänk", "copyLink": "Kopiera länk", "copied": "Kopierad!", "copy": "Kopiera", "views": "Visningar", "copies": "Kopior", "generatingLink": "Genererar länk...", "linkInfo": "Alla med denna länk kan se och kopiera din uppsättning", "deactivateLink": "Inaktivera länk", "deactivateConfirm": "Är du säker på att du vill inaktivera länken?", "deactivate": "Inaktivera", "linkDeactivated": "Länk inaktiverad", "shareError": "Kunde inte generera länk", "copyError": "Kunde inte kopiera länk", "linkCopied": "Länk kopierad", "linkCopiedToClipboard": "Länk kopierad till urklipp"},
        "tour": {"skip": "Hoppa över", "next": "Nästa", "back": "Tillbaka", "getStarted": "Kom igång", "slides": {"vocabulary": {"title": "Bygg ditt ordförråd", "description": "Lägg till ord manuellt eller använd AI. Skapa upp till 20 ord per uppsättning."}, "organize": {"title": "Organisera ditt lärande", "description": "Gruppera ord i temauppsättningar. Namnge uppsättningar för enkel åtkomst."}, "learn": {"title": "Lär dig på ditt sätt", "description": "Öva med 4 lägen: Flashcards, Matcha par, Quiz och Fyll i."}, "share": {"title": "Dela din kunskap", "description": "Generera delningslänkar. Andra kan kopiera till sitt bibliotek."}}}
    },
    "settings": {
        "title": "Inställningar",
        "appLanguage": {"title": "Appspråk", "description": "Välj språk för gränssnittet.", "label": "Gränssnittsspråk", "placeholder": "Välj appspråk"},
        "languages": {"title": "Språkinställningar", "description": "Ändra ditt lär- och gränssnittsspråk.", "targetLanguage": "Lärande", "targetPlaceholder": "Välj språk att lära", "nativeLanguage": "Gränssnitt och översättningar", "nativePlaceholder": "Välj ditt språk", "changeNote": "Detta påverkar nya uppsättningar."},
        "appearance": {"title": "Utseende", "description": "Välj hur appen ser ut. Auto följer din enhet.", "light": "Ljus", "dark": "Mörk", "auto": "Auto", "info": "Temaändringar tillämpas direkt"},
        "mySets": {"title": "Mina uppsättningar", "manage": "Hantera orduppsättningar.", "noSets": "Inga uppsättningar än"}
    },
    "games": {
        "chooseActivity": "Välj aktivitet", "setNotFound": "Uppsättning hittades inte", "wordsInSet": "Ord i denna uppsättning", "startPractice": "Starta övning", "quickPractice": "Snabb övning",
        "templates": {"flashcard": {"name": "Flashcard", "description": "Vänd för att se översättning"}, "match": {"name": "Matcha", "description": "Dra och koppla par"}, "quiz": {"name": "Quiz", "description": "Flervalsfrågor"}, "fillBlank": {"name": "Fyll i", "description": "Komplettera meningar", "aiHints": "AI-tips tillgängliga"}},
        "flashcard": {"title": "Flashcards: {{setName}}", "tapToFlip": "Tryck för att vända", "clickToFlip": "Klicka för att vända", "complete": "Klar"},
        "quiz": {"title": "Quiz: {{setName}}", "question": "Fråga {{current}} / {{total}}", "translate": "Översätt:", "nextQuestion": "Nästa fråga", "loadingQuiz": "Laddar quiz...", "complete": {"title": "Quiz klar!", "score": "Poäng: {{score}}/{{total}} ({{percentage}}%)"}},
        "match": {"title": "Matcha: {{setName}}", "words": "Ord", "translations": "Översättningar", "complete": {"title": "Grattis!", "message": "Du slutförde spelet på {{time}}!"}},
        "fillBlank": {"title": "Fyll i: {{setName}}", "question": "Fråga {{current}} / {{total}}", "translation": "Översättning:", "fillPrompt": "Fyll i:", "choosePrompt": "Välj rätt ord:", "loadingNext": "Laddar...", "generatingSentences": "Genererar meningar...", "correctAnswer": "Rätt svar:", "complete": {"title": "Övning klar!", "score": "Poäng: {{score}}/{{total}} ({{percentage}}%)"}},
        "home": {"title": "Hem", "greeting": "Hej, {{name}}!", "readyToLearn": "Redo att lära?", "noSets": "Inga uppsättningar", "createFirstSet": "Skapa din första uppsättning!", "createSet": "Skapa uppsättning", "featuredSets": "Utvalda uppsättningar", "tryThem": "Prova dem!", "demoDescription": "Öva med dessa demoställningar"},
        "dashboard": {"title": "Instrumentpanel", "lastPracticed": "Senast övad", "streak": "Serie"},
        "mySets": {"title": "Mina uppsättningar", "noSets": "Inga uppsättningar", "createFirstSet": "Skapa din första uppsättning!", "createSet": "Skapa uppsättning"},
        "setCard": {"featured": "Utvald", "complete": "{{percent}}% klar", "lastPracticed": "Senast {{date}}", "deleteSet": "Radera uppsättning", "deleteConfirm": "Vill du radera \"{{setName}}\"?", "demoInfo": "Detta är en demo. Skapa din egen!"}
    },
    "profile": {
        "title": "Profil", "guest": "Gäst", "guestAccount": "Gästkonto", "appAccount": "Appkonto",
        "stats": {"sets": "Uppsättningar", "words": "Ord", "practiced": "Övad"},
        "progress": "Framsteg",
        "settings": {"title": "Inställningar", "subtitle": "Appinställningar", "description": "Tema, språk och preferenser"},
        "yourSets": "Dina uppsättningar", "noSetsYet": "Inga uppsättningar än",
        "deleteSet": {"title": "Radera uppsättning", "message": "Vill du radera \"{{setName}}\"?", "confirm": "Radera"}
    },
    "create": {
        "title": "Skapa uppsättning", "editTitle": "Redigera uppsättning", "setName": "Uppsättningsnamn", "setNamePlaceholder": "t.ex. Affärsordförråd", "languagePair": "Lär {{target}} → {{native}}", "words": "Ord", "addWord": "Lägg till ord", "aiSuggestions": "AI-förslag", "limitReached": "Gräns nådd", "limitMessage": "Max {{max}} ord per uppsättning",
        "errors": {"fillAllFields": "Fyll i alla fält", "atLeastOneWord": "Lägg till minst ett ord", "createFailed": "Kunde inte skapa", "networkError": "Nätverksfel"},
        "success": {"created": "Uppsättning skapad!", "updated": "Uppsättning uppdaterad!"},
        "ai": {"modalTitle": "AI-ordförslag", "themePlaceholder": "Tema (t.ex. djur, mat)", "countPlaceholder": "#", "countHint": "Generera upp till {{max}} ord", "generatingWithContext": "Genererar baserat på {{count}} {{word}}...", "generatingGeneric": "Genererar med AI...", "selectPrompt": "Välj ord ({{count}} valda)", "noSuggestions": "Inga förslag. Klicka Generera!", "addSelected": "Lägg till {{count}} {{word}}"},
        "bulkImport": {"button": "Massimport", "title": "Massimportera ord", "howTo": "Hur man importerar", "instructions": "Klistra in ordpar, ett per rad.", "example": "Exempel:", "separator": "Separator", "separators": {"tab": "Tab", "comma": "Komma (,)", "dash": "Streck (-)"}, "pasteWords": "Klistra in ord", "placeholder": "ord1\töversättning1", "preview": "Förhandsvisning", "previewTitle": "Förhandsvisning", "import": "Importera {{count}} ord"},
        "languageOverride": {"title": "Språkinställningar", "custom": "Anpassad", "description": "Åsidosätt standardspråk endast för denna uppsättning.", "usingDefaults": "Använder standard", "selectTarget": "Välj målspråk", "selectNative": "Välj modersmål", "targetLabel": "Lärande", "nativeLabel": "Översättningar", "useDefaults": "Använd standard"}
    },
    "auth": {
        "appName": "Exquizite", "tagline": "Lär dig ordförråd med AI-spel",
        "login": {"title": "Välkommen tillbaka", "signIn": "Logga in", "email": "E-post", "emailPlaceholder": "din@email.com", "password": "Lösenord", "passwordPlaceholder": "Ange lösenord", "noAccount": "Inget konto? Registrera", "continueAsGuest": "Fortsätt som gäst", "or": "eller", "aiEnhanced": "AI-förbättrad inlärning"},
        "signup": {"title": "Skapa konto", "signUp": "Registrera", "name": "Namn", "namePlaceholder": "Ditt namn", "email": "E-post", "emailPlaceholder": "din@email.com", "password": "Lösenord", "passwordPlaceholder": "Min 6 tecken", "confirmPassword": "Bekräfta lösenord", "confirmPasswordPlaceholder": "Ange igen", "hasAccount": "Har konto? Logga in"},
        "languageSetup": {"title": "Språkinställning", "heading": "Vad vill du lära dig?", "description": "Välj ditt lärspråk och gränssnittsspråk", "targetLanguage": "Jag vill lära mig", "targetPlaceholder": "Välj språk att lära", "nativeLanguage": "Jag talar", "nativePlaceholder": "Välj ditt språk", "info": "Gränssnittet kommer att vara på ditt språk", "getStarted": "Börja lära"},
        "errors": {"fillAllFields": "Fyll i alla fält", "enterName": "Ange namn", "passwordMismatch": "Lösenorden matchar inte", "passwordTooShort": "Lösenord måste vara minst 6 tecken"},
        "guest": {"title": "Gästkonto", "upgradeTitle": "Uppgradera konto", "upgradeMessage": "Skapa fullständigt konto för att synkronisera data", "createAccount": "Skapa konto", "createFullAccount": "Skapa fullständigt konto", "syncMessage": "Synkronisera data och förlora inte framsteg", "youAreGuest": "Du använder gästkonto", "savePermanently": "Skapa konto för att spara framsteg permanent", "upgradeNow": "Uppgradera nu"},
        "signOut": {"title": "Logga ut", "message": "Vill du logga ut?", "confirm": "Logga ut"}
    }
}

def write_lang(code, data):
    lang_dir = os.path.join(translations_dir, code)
    os.makedirs(lang_dir, exist_ok=True)
    for namespace, content in data.items():
        filepath = os.path.join(lang_dir, f"{namespace}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
        print(f"✓ {code}/{namespace}.json")

print("Writing Swedish (sv)...")
write_lang('sv', sv)
print("\n✅ Swedish complete! Generating remaining 4 languages...")
