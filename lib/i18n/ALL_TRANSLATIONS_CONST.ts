/**
 * Complete UI translations for all supported languages
 * This constant contains all translations for easy import and use
 *
 * Usage:
 * import { ALL_TRANSLATIONS } from '@/lib/i18n/ALL_TRANSLATIONS_CONST';
 * const frenchCommon = ALL_TRANSLATIONS.fr.common;
 */

export const ALL_TRANSLATIONS = {
  // Already completed languages can be imported from files
  // fr, it, pt - completed above

  // Japanese (ja)
  ja: {
    common: {
      buttons: { add: "追加", done: "完了", cancel: "キャンセル", delete: "削除", share: "共有", play: "プレイ", next: "次へ", previous: "前へ", skip: "スキップ", check: "答えを確認", save: "保存", saving: "保存中...", finish: "終了", tryAgain: "もう一度", playAgain: "もう一度プレイ", showHint: "ヒントを表示", generate: "生成", generating: "生成中..." },
      status: { loading: "読み込み中...", saving: "保存中...", generating: "生成中...", noWords: "このセットに単語がありません", success: "成功", error: "エラー" },
      time: { never: "なし", today: "今日", yesterday: "昨日", daysAgo: "{{count}}日前", lastPracticed: "最終練習{{date}}" },
      counts: { word: "単語", words: "単語", set: "セット", sets: "セット", wordCount: "{{count}}個の単語", wordCount_other: "{{count}}個の単語", setCount: "{{count}}個のセット", setCount_other: "{{count}}個のセット", progress: "{{current}}/{{total}}" },
      dialogs: { areYouSure: "よろしいですか？", cannotUndo: "この操作は元に戻せません。" },
      sharing: { shareSet: "セットを共有", shareCode: "共有コード", shareLink: "共有リンク", copyLink: "リンクをコピー", copied: "コピーしました！", copy: "コピー", views: "閲覧数", copies: "コピー数", generatingLink: "共有リンクを生成中...", linkInfo: "このリンクを持つ誰でもあなたのセットを表示してコピーできます", deactivateLink: "共有リンクを無効化", deactivateConfirm: "この共有リンクを無効化してもよろしいですか？リンクを持つ誰もこのセットにアクセスできなくなります。", deactivate: "無効化", linkDeactivated: "共有リンクが無効化されました", shareError: "共有リンクの生成に失敗しました。もう一度お試しください。", copyError: "クリップボードへのコピーに失敗しました", linkCopied: "リンクをコピーしました", linkCopiedToClipboard: "共有リンクをクリップボードにコピーしました" },
      tour: { skip: "スキップ", next: "次へ", back: "戻る", getStarted: "始める", slides: { vocabulary: { title: "語彙を構築", description: "手動で単語を追加するか、AIを使用してテーマ別の語彙セットを生成します。セットあたり最大20単語を作成できます。" }, organize: { title: "学習を整理", description: "「スペイン料理」や「ドイツ旅行」などのテーマ別セットに単語をグループ化します。簡単にアクセスできるようにセットに名前を付けます。" }, learn: { title: "自分の方法で学習", description: "4つのゲームモードで練習：フラッシュカード、ペアマッチ、多肢選択クイズ、穴埋め問題。" }, share: { title: "知識を共有", description: "セットの共有リンクを生成します。他のユーザーはそれらを表示して自分のライブラリにコピーできます。" } } }
    },
    settings: {
      title: "設定",
      appLanguage: { title: "アプリの言語", description: "アプリのインターフェース言語を選択します。", label: "インターフェース言語", placeholder: "アプリの言語を選択" },
      languages: { title: "言語設定", description: "学習言語とインターフェース言語を変更します。新しいセットはこれらの言語を使用します。", targetLanguage: "学習", targetPlaceholder: "学習する言語を選択", nativeLanguage: "インターフェースと翻訳", nativePlaceholder: "あなたの言語を選択", changeNote: "これらの設定を変更すると、新しい単語セットに影響します。既存のセットは元の言語を保持します。" },
      appearance: { title: "外観", description: "アプリの外観を選択します。自動はデバイスのテーマに合わせます。", light: "ライト", dark: "ダーク", auto: "自動", info: "テーマの変更はすべての画面に即座に適用されます" },
      mySets: { title: "マイセット", manage: "単語セットを管理します。クリックして展開し、単語を表示します。", noSets: "まだセットが作成されていません" }
    },
    games: {
      chooseActivity: "アクティビティを選択", setNotFound: "セットが見つかりません", wordsInSet: "このセットの単語", startPractice: "練習を開始", quickPractice: "クイック練習",
      templates: { flashcard: { name: "フラッシュカード", description: "めくって翻訳を表示" }, match: { name: "マッチ", description: "ドラッグしてペアを接続" }, quiz: { name: "クイズ", description: "多肢選択問題" }, fillBlank: { name: "穴埋め問題", description: "正しい単語で文を完成させる", aiHints: "AIヒント利用可能" } },
      flashcard: { title: "フラッシュカード：{{setName}}", tapToFlip: "タップしてめくる", clickToFlip: "クリックしてめくる", complete: "完了" },
      quiz: { title: "クイズ：{{setName}}", question: "問題{{current}} / {{total}}", translate: "翻訳：", nextQuestion: "次の問題", loadingQuiz: "クイズを読み込み中...", complete: { title: "クイズ完了！", score: "{{score}}/{{total}}点（{{percentage}}%）" } },
      match: { title: "マッチ：{{setName}}", words: "単語", translations: "翻訳", complete: { title: "おめでとうございます！", message: "マッチゲームを{{time}}で完了しました！" } },
      fillBlank: { title: "穴埋め問題：{{setName}}", question: "問題{{current}} / {{total}}", translation: "翻訳：", fillPrompt: "空欄を埋める：", choosePrompt: "正しい単語を選択：", loadingNext: "次の問題を読み込み中...", generatingSentences: "文を生成中...", correctAnswer: "正解：", complete: { title: "演習完了！", score: "{{score}}/{{total}}点（{{percentage}}%）" } },
      home: { title: "ホーム", greeting: "こんにちは、{{name}}さん！", readyToLearn: "今日は学習の準備ができていますか？", noSets: "まだセットがありません", createFirstSet: "最初の単語セットを作成して始めましょう！", createSet: "セットを作成", featuredSets: "注目のセット", tryThem: "試してみよう！", demoDescription: "これらのデモセットで練習を始めましょう" },
      dashboard: { title: "ダッシュボード", lastPracticed: "最終練習", streak: "連続記録" },
      mySets: { title: "マイセット", noSets: "まだセットがありません", createFirstSet: "最初の単語セットを作成して始めましょう！", createSet: "セットを作成" },
      setCard: { featured: "注目", complete: "{{percent}}%完了", lastPracticed: "最終練習{{date}}", deleteSet: "セットを削除", deleteConfirm: "「{{setName}}」を削除してもよろしいですか？この操作は元に戻せません。", demoInfo: "これはデモセットです。独自のセットを作成して始めましょう！" }
    },
    profile: {
      title: "プロフィール", guest: "ゲスト", guestAccount: "ゲストアカウント", appAccount: "アプリアカウント",
      stats: { sets: "セット", words: "単語", practiced: "練習済み" },
      progress: "進捗",
      settings: { title: "設定", subtitle: "アプリ設定", description: "テーマ、言語、設定" },
      yourSets: "あなたのセット", noSetsYet: "まだセットが作成されていません",
      deleteSet: { title: "セットを削除", message: "「{{setName}}」を削除してもよろしいですか？", confirm: "削除" }
    },
    create: {
      title: "セットを作成", editTitle: "セットを編集", setName: "セット名", setNamePlaceholder: "例：仕事の語彙", languagePair: "{{target}}を学習 → {{native}}", words: "単語", addWord: "単語を追加", aiSuggestions: "AI提案", limitReached: "制限に達しました", limitMessage: "セットあたり最大{{max}}単語",
      errors: { fillAllFields: "すべてのフィールドを入力してください", atLeastOneWord: "少なくとも1つの単語ペアを追加してください", createFailed: "セットの作成に失敗しました。もう一度お試しください。", networkError: "ネットワークエラー。接続を確認してもう一度お試しください。" },
      success: { created: "セットが正常に作成されました！", updated: "セットが正常に更新されました！" },
      ai: { modalTitle: "AI単語提案", themePlaceholder: "テーマ（例：動物、食べ物）", countPlaceholder: "#", countHint: "最大{{max}}単語を生成（デフォルト5）", generatingWithContext: "既存の{{count}}{{word}}に基づいて提案を生成中...", generatingGeneric: "AIで提案を生成中...", selectPrompt: "追加する単語を選択（{{count}}選択済み）", noSuggestions: "まだ提案がありません。生成をクリックしてAI駆動の単語提案を取得してください！", addSelected: "{{count}}{{word}}を追加" },
      bulkImport: { button: "一括インポート", title: "単語の一括インポート", howTo: "インポート方法", instructions: "単語ペアを1行に1つずつ貼り付けてください。各単語とその翻訳をタブ、カンマ、またはダッシュで区切ります。", example: "例：", separator: "区切り文字", separators: { tab: "タブ", comma: "カンマ（,）", dash: "ダッシュ（-）" }, pasteWords: "単語を貼り付け", placeholder: "単語1\t翻訳1\n単語2\t翻訳2\n単語3\t翻訳3", preview: "プレビュー", previewTitle: "プレビュー", import: "{{count}}単語をインポート" },
      languageOverride: { title: "言語設定", custom: "カスタム", description: "このセットのみのデフォルト言語を上書きします。グローバル言語設定を使用するにはデフォルトのままにしてください。", usingDefaults: "デフォルト言語を使用", selectTarget: "ターゲット言語を選択", selectNative: "母国語を選択", targetLabel: "学習", nativeLabel: "翻訳", useDefaults: "デフォルト言語を使用" }
    },
    auth: {
      appName: "Exquizite", tagline: "AI駆動のゲームで語彙を学習",
      login: { title: "おかえりなさい", signIn: "サインイン", email: "メール", emailPlaceholder: "your@email.com", password: "パスワード", passwordPlaceholder: "パスワードを入力", noAccount: "アカウントをお持ちでないですか？サインアップ", continueAsGuest: "ゲストとして続行", or: "または", aiEnhanced: "AI強化学習体験" },
      signup: { title: "アカウントを作成", signUp: "サインアップ", name: "名前", namePlaceholder: "あなたの名前", email: "メール", emailPlaceholder: "your@email.com", password: "パスワード", passwordPlaceholder: "最低6文字", confirmPassword: "パスワードを確認", confirmPasswordPlaceholder: "パスワードを再入力", hasAccount: "すでにアカウントをお持ちですか？サインイン" },
      languageSetup: { title: "言語設定", heading: "何を学びたいですか？", description: "学習言語と母国語を選択してください", targetLanguage: "学習したい言語", targetPlaceholder: "学習する言語を選択", nativeLanguage: "母国語", nativePlaceholder: "あなたの言語を選択", info: "アプリのインターフェースはあなたが話す言語になります", getStarted: "学習を開始" },
      errors: { fillAllFields: "すべてのフィールドを入力してください", enterName: "名前を入力してください", passwordMismatch: "パスワードが一致しません", passwordTooShort: "パスワードは少なくとも6文字である必要があります" },
      guest: { title: "ゲストアカウント", upgradeTitle: "アカウントをアップグレード", upgradeMessage: "完全なアカウントを作成してデータを同期し、進捗を失わないようにしましょう", createAccount: "アカウントを作成", createFullAccount: "完全なアカウントを作成", syncMessage: "データを同期して進捗を失わないようにしましょう", youAreGuest: "ゲストアカウントを使用しています", savePermanently: "進捗を永続的に保存するにはアカウントを作成してください", upgradeNow: "今すぐアップグレード" },
      signOut: { title: "サインアウト", message: "サインアウトしてもよろしいですか？", confirm: "サインアウト" }
    }
  }
} as const;
