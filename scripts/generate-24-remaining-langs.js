#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'translations');

// Read English as base for structure reference
const enDir = path.join(translationsDir, 'en');
const enCommon = JSON.parse(fs.readFileSync(path.join(enDir, 'common.json'), 'utf8'));

// Helper function to write translations
function writeTranslation(lang, namespace, data) {
  const langDir = path.join(translationsDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  const filePath = path.join(langDir, `${namespace}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${lang}/${namespace}.json`);
}

// Translations for all 24 remaining languages
const TRANSLATIONS = {
  // Turkish (tr)
  tr: {
    common: {
      buttons: { add: "Ekle", done: "Tamamlandı", cancel: "İptal", delete: "Sil", share: "Paylaş", play: "Oyna", next: "Sonraki", previous: "Önceki", skip: "Atla", check: "Cevabı Kontrol Et", save: "Kaydet", saving: "Kaydediliyor...", finish: "Bitir", tryAgain: "Tekrar Dene", playAgain: "Tekrar Oyna", showHint: "İpucu Göster", generate: "Oluştur", generating: "Oluşturuluyor..." },
      status: { loading: "Yükleniyor...", saving: "Kaydediliyor...", generating: "Oluşturuluyor...", noWords: "Bu sette kelime yok", success: "Başarılı", error: "Hata" },
      time: { never: "Asla", today: "Bugün", yesterday: "Dün", daysAgo: "{{count}} gün önce", lastPracticed: "Son pratik {{date}}" },
      counts: { word: "kelime", words: "kelimeler", set: "set", sets: "setler", wordCount: "{{count}} kelime", wordCount_other: "{{count}} kelime", setCount: "{{count}} set", setCount_other: "{{count}} set", progress: "{{current}}/{{total}}" },
      dialogs: { areYouSure: "Emin misiniz?", cannotUndo: "Bu işlem geri alınamaz." },
      sharing: { shareSet: "Seti Paylaş", shareCode: "Paylaşım Kodu", shareLink: "Paylaşım Bağlantısı", copyLink: "Bağlantıyı Kopyala", copied: "Kopyalandı!", copy: "Kopyala", views: "Görüntülemeler", copies: "Kopyalar", generatingLink: "Paylaşım bağlantısı oluşturuluyor...", linkInfo: "Bu bağlantıya sahip herkes setinizi görüntüleyebilir ve kopyalayabilir", deactivateLink: "Paylaşım Bağlantısını Devre Dışı Bırak", deactivateConfirm: "Bu paylaşım bağlantısını devre dışı bırakmak istediğinizden emin misiniz? Bağlantıya sahip hiç kimse artık bu sete erişemeyecek.", deactivate: "Devre Dışı Bırak", linkDeactivated: "Paylaşım bağlantısı devre dışı bırakıldı", shareError: "Paylaşım bağlantısı oluşturulamadı. Lütfen tekrar deneyin.", copyError: "Bağlantı panoya kopyalanamadı", linkCopied: "Bağlantı Kopyalandı", linkCopiedToClipboard: "Paylaşım bağlantısı panoya kopyalandı" },
      tour: { skip: "Atla", next: "Sonraki", back: "Geri", getStarted: "Başlayın", slides: { vocabulary: { title: "Kelime Dağarcığınızı Oluşturun", description: "Kelimeleri manuel olarak ekleyin veya temalarla ilgili kelime setleri oluşturmak için yapay zekayı kullanın. Set başına 20'ye kadar kelime oluşturun." }, organize: { title: "Öğreniminizi Düzenleyin", description: "Kelimeleri \"İspanyol Yemekleri\" veya \"Alman Seyahati\" gibi tematik setlerde gruplandırın. Kolay erişim için setlerinizi adlandırın." }, learn: { title: "Kendi Tarzınızda Öğrenin", description: "4 oyun moduyla pratik yapın: Flashcardlar, Eşleşme, Çoktan Seçmeli Sınav ve Boşluk Doldurma." }, share: { title: "Bilginizi Paylaşın", description: "Setleriniz için paylaşım bağlantıları oluşturun. Diğerleri bunları görüntüleyebilir ve kendi kütüphanelerine kopyalayabilir." } } }
    },
    settings: {
      title: "Ayarlar",
      appLanguage: { title: "Uygulama Dili", description: "Uygulama arayüzü için dili seçin.", label: "Arayüz Dili", placeholder: "Uygulama dilini seçin" },
      languages: { title: "Dil Ayarları", description: "Öğrenme ve arayüz dilinizi değiştirin. Yeni setler bu dilleri kullanacaktır.", targetLanguage: "Öğrenme", targetPlaceholder: "Öğrenilecek dili seçin", nativeLanguage: "Arayüz ve Çeviriler", nativePlaceholder: "Dilinizi seçin", changeNote: "Bu ayarların değiştirilmesi yeni kelime setlerini etkileyecektir. Mevcut setleriniz orijinal dillerini koruyacaktır." },
      appearance: { title: "Görünüm", description: "Uygulamanın nasıl göründüğünü seçin. Otomatik, cihazınızın temasıyla eşleşecektir.", light: "Açık", dark: "Koyu", auto: "Otomatik", info: "Tema değişiklikleri tüm ekranlara anında uygulanır" },
      mySets: { title: "Setlerim", manage: "Kelime setlerinizi yönetin. Kelimeleri genişletmek ve görmek için tıklayın.", noSets: "Henüz set oluşturulmadı" }
    },
    games: {
      chooseActivity: "Etkinlik Seç", setNotFound: "Set bulunamadı", wordsInSet: "Bu setteki kelimeler", startPractice: "Pratiğe Başla", quickPractice: "Hızlı Pratik",
      templates: { flashcard: { name: "Flashcard", description: "Çevirileri görmek için çevirin" }, match: { name: "Eşleştir", description: "Sürükleyin ve çiftleri bağlayın" }, quiz: { name: "Sınav", description: "Çoktan seçmeli sorular" }, fillBlank: { name: "Boşluk Doldur", description: "Doğru kelimeyle cümleleri tamamlayın", aiHints: "Yapay zeka ipuçları mevcut" } },
      flashcard: { title: "Flashcardlar: {{setName}}", tapToFlip: "Çevirmek için dokunun", clickToFlip: "Çevirmek için tıklayın", complete: "Tamamlandı" },
      quiz: { title: "Sınav: {{setName}}", question: "Soru {{current}} / {{total}}", translate: "Çevir:", nextQuestion: "Sonraki Soru", loadingQuiz: "Sınav yükleniyor...", complete: { title: "Sınav Tamamlandı!", score: "{{score}}/{{total}} puan aldınız ({{percentage}}%)" } },
      match: { title: "Eşleştir: {{setName}}", words: "Kelimeler", translations: "Çeviriler", complete: { title: "Tebrikler!", message: "Eşleştirme oyununu {{time}} içinde tamamladınız!" } },
      fillBlank: { title: "Boşluk Doldur: {{setName}}", question: "Soru {{current}} / {{total}}", translation: "Çeviri:", fillPrompt: "Boşluğu doldurun:", choosePrompt: "Doğru kelimeyi seçin:", loadingNext: "Sonraki soru yükleniyor...", generatingSentences: "Cümleler oluşturuluyor...", correctAnswer: "Doğru cevap:", complete: { title: "Alıştırma Tamamlandı!", score: "{{score}}/{{total}} puan aldınız ({{percentage}}%)" } },
      home: { title: "Ana Sayfa", greeting: "Merhaba, {{name}}!", readyToLearn: "Bugün öğrenmeye hazır mısınız?", noSets: "Henüz set yok", createFirstSet: "Başlamak için ilk kelime setinizi oluşturun!", createSet: "Set Oluştur", featuredSets: "Öne Çıkan Setler", tryThem: "Deneyin!", demoDescription: "Başlamak için bu demo setlerle pratik yapın" },
      dashboard: { title: "Gösterge Paneli", lastPracticed: "Son Pratik", streak: "Seri" },
      mySets: { title: "Setlerim", noSets: "Henüz set yok", createFirstSet: "Başlamak için ilk kelime setinizi oluşturun!", createSet: "Set Oluştur" },
      setCard: { featured: "Öne Çıkan", complete: "{{percent}}% tamamlandı", lastPracticed: "Son pratik {{date}}", deleteSet: "Seti Sil", deleteConfirm: "\"{{setName}}\" setini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.", demoInfo: "Bu bir demo seti. Başlamak için kendi setinizi oluşturun!" }
    },
    profile: {
      title: "Profil", guest: "Misafir", guestAccount: "Misafir Hesabı", appAccount: "Uygulama Hesabı",
      stats: { sets: "Setler", words: "Kelimeler", practiced: "Pratik Yapıldı" },
      progress: "İlerleme",
      settings: { title: "Ayarlar", subtitle: "Uygulama Ayarları", description: "Tema, diller ve tercihler" },
      yourSets: "Setleriniz", noSetsYet: "Henüz set oluşturulmadı",
      deleteSet: { title: "Seti Sil", message: "\"{{setName}}\" setini silmek istediğinizden emin misiniz?", confirm: "Sil" }
    },
    create: {
      title: "Set Oluştur", editTitle: "Seti Düzenle", setName: "Set Adı", setNamePlaceholder: "ör., İş Kelime Dağarcığı", languagePair: "{{target}} öğren → {{native}}", words: "Kelimeler", addWord: "Kelime Ekle", aiSuggestions: "Yapay Zeka Önerileri", limitReached: "Limite Ulaşıldı", limitMessage: "Set başına maksimum {{max}} kelime",
      errors: { fillAllFields: "Lütfen tüm alanları doldurun", atLeastOneWord: "Lütfen en az bir kelime çifti ekleyin", createFailed: "Set oluşturulamadı. Lütfen tekrar deneyin.", networkError: "Ağ hatası. Lütfen bağlantınızı kontrol edin ve tekrar deneyin." },
      success: { created: "Set başarıyla oluşturuldu!", updated: "Set başarıyla güncellendi!" },
      ai: { modalTitle: "Yapay Zeka Kelime Önerileri", themePlaceholder: "Tema (ör., hayvanlar, yemek)", countPlaceholder: "#", countHint: "{{max}}'e kadar kelime oluşturun (varsayılan 5)", generatingWithContext: "Mevcut {{count}} {{word}}'nize dayalı öneriler oluşturuluyor...", generatingGeneric: "Yapay zeka ile öneriler oluşturuluyor...", selectPrompt: "Eklenecek kelimeleri seçin ({{count}} seçildi)", noSuggestions: "Henüz öneri yok. Yapay zeka destekli kelime önerileri almak için Oluştur'a tıklayın!", addSelected: "{{count}} {{word}} ekle" },
      bulkImport: { button: "Toplu İçe Aktarma", title: "Kelimeleri Toplu İçe Aktarma", howTo: "Nasıl İçe Aktarılır", instructions: "Kelime çiftlerinizi aşağıya, her satıra bir tane olacak şekilde yapıştırın. Her kelimeyi çevirisiyle sekme, virgül veya tire ile ayırın.", example: "Örnek:", separator: "Ayırıcı", separators: { tab: "Sekme", comma: "Virgül (,)", dash: "Tire (-)" }, pasteWords: "Kelimelerinizi Yapıştırın", placeholder: "kelime1\tçeviri1\nkelime2\tçeviri2\nkelime3\tçeviri3", preview: "Önizleme", previewTitle: "Önizleme", import: "{{count}} Kelime İçe Aktar" },
      languageOverride: { title: "Dil Ayarları", custom: "Özel", description: "Varsayılan dilleri yalnızca bu set için geçersiz kılın. Global dil ayarlarınızı kullanmak için varsayılan olarak bırakın.", usingDefaults: "Varsayılan diller kullanılıyor", selectTarget: "Hedef dili seçin", selectNative: "Ana dili seçin", targetLabel: "Öğrenme", nativeLabel: "Çeviriler", useDefaults: "Varsayılan Dilleri Kullan" }
    },
    auth: {
      appName: "Exquizite", tagline: "Yapay zeka destekli oyunlarla kelime öğrenin",
      login: { title: "Hoş Geldiniz", signIn: "Giriş Yap", email: "E-posta", emailPlaceholder: "sizin@email.com", password: "Şifre", passwordPlaceholder: "Şifre girin", noAccount: "Hesabınız yok mu? Kaydolun", continueAsGuest: "Misafir Olarak Devam Et", or: "veya", aiEnhanced: "Yapay zeka destekli öğrenme deneyimi" },
      signup: { title: "Hesap Oluştur", signUp: "Kaydol", name: "Ad", namePlaceholder: "Adınız", email: "E-posta", emailPlaceholder: "sizin@email.com", password: "Şifre", passwordPlaceholder: "Min 6 karakter", confirmPassword: "Şifreyi Onayla", confirmPasswordPlaceholder: "Şifreyi tekrar girin", hasAccount: "Zaten hesabınız var mı? Giriş Yapın" },
      languageSetup: { title: "Dil Kurulumu", heading: "Ne öğrenmek istiyorsunuz?", description: "Öğrenme dilinizi ve konuştuğunuz dili seçin", targetLanguage: "Öğrenmek istiyorum", targetPlaceholder: "Öğrenilecek dili seçin", nativeLanguage: "Ben konuşurum", nativePlaceholder: "Dilinizi seçin", info: "Uygulama arayüzü konuştuğunuz dilde olacaktır", getStarted: "Öğrenmeye Başla" },
      errors: { fillAllFields: "Lütfen tüm alanları doldurun", enterName: "Lütfen adınızı girin", passwordMismatch: "Şifreler eşleşmiyor", passwordTooShort: "Şifre en az 6 karakter olmalıdır" },
      guest: { title: "Misafir Hesabı", upgradeTitle: "Hesabınızı Yükseltin", upgradeMessage: "Verilerinizi senkronize etmek ve ilerlemenizi asla kaybetmemek için tam bir hesap oluşturun", createAccount: "Hesap Oluştur", createFullAccount: "Tam Hesap Oluşturun", syncMessage: "Verilerinizi senkronize edin ve ilerlemenizi asla kaybetmeyin", youAreGuest: "Misafir hesabı kullanıyorsunuz", savePermanently: "İlerlemenizi kalıcı olarak kaydetmek için bir hesap oluşturun", upgradeNow: "Şimdi Yükseltin" },
      signOut: { title: "Çıkış Yap", message: "Çıkış yapmak istediğinizden emin misiniz?", confirm: "Çıkış Yap" }
    }
  }
};

console.log('🌍 Generating Turkish translations...\n');
Object.keys(TRANSLATIONS.tr).forEach(namespace => {
  writeTranslation('tr', namespace, TRANSLATIONS.tr[namespace]);
});
console.log('\n✅ Turkish (tr) translations complete!');

