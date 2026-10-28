/**
 * English and Turkish strings. Entries are plain strings, or { one, other }
 * objects for words that change with a count ({n} is the formatted count).
 */

export const LANGUAGES = Object.freeze(['en', 'tr']);
export const DEFAULT_LANGUAGE = 'en';

const LOCALES = Object.freeze({ en: 'en-US', tr: 'tr-TR' });

const en = {
  'app.title': 'Password Generator',
  'app.tagline': 'Strong passwords and passphrases, made on your device.',
  'header.reset': 'Reset',
  'header.resetHint': 'Restore the default options and clear the history and the checker',
  'lang.button': 'TR',
  'lang.switch': 'Switch to Turkish',
  'notice.privacy':
    'Everything runs in your browser and nothing is sent. Generated values and checked passwords are never saved; only your language and options, including extra characters and the separator, are remembered on this device.',
  'footer.source': 'Source on GitHub',

  'tabs.label': 'What to generate',
  'tab.password': 'Password',
  'tab.passphrase': 'Passphrase',
  'output.password': 'Generated password',
  'output.passphrase': 'Generated passphrase',
  'action.regenerate': 'New',
  'action.regenerateHint': 'Generate a new one',
  'action.copy': 'Copy',
  'action.copied': 'Copied!',
  'action.copyFailed': 'Could not copy. Select the text and copy it by hand.',
  'status.generated': 'New value generated.',
  'demo.badge': 'Demo: example values',
  'hint.keys': 'Shortcuts:',
  'hint.new': 'new',
  'hint.copy': 'copy',
  'hint.tabs': 'switch tab',
  'hint.swipe': 'Tip: swipe the value sideways for a new one.',

  'options.title': 'Options',
  'options.length': 'Length',
  'options.sets': 'Character sets',
  'set.lower': 'Lowercase',
  'set.upper': 'Uppercase',
  'set.digits': 'Digits',
  'set.symbols': 'Symbols',
  'options.lookAlikes': 'Avoid look-alikes',
  'options.custom': 'Extra characters',
  'options.customPlaceholder': 'e.g. çğış€',
  'options.customHint':
    'Added to the pool as their own set. Repeats, spaces and characters already in a selected set are skipped.',
  'options.words': 'Words',
  'options.wordList': 'Word list',
  'wordList.en': 'English',
  'wordList.tr': 'Turkish',
  'options.separator': 'Separator',
  'options.capitalization': 'Capitals',
  'caps.lower': 'lowercase',
  'caps.capitalize': 'Capitalized',
  'caps.upper': 'UPPERCASE',
  'caps.random': 'Random',
  'options.number': 'Add a digit',

  'meter.title': 'Strength',
  'meter.bitsUnit': 'bits of entropy',
  'meter.bitsShort': '{bits} bits',
  'entropy.passwordSource': '{length} characters from a pool of {pool}',
  'entropy.passphraseSource': '{words} words from a list of {list}',
  'entropy.plusCaps': 'random capitals',
  'entropy.plusDigit': 'a random digit',
  'entropy.explain':
    'Entropy counts the possible values in bits: every extra bit doubles the number of guesses an attacker needs.',
  'crack.title': 'Time to crack',
  'crack.intro':
    'Average time for an attacker who knows exactly how the value was made, at four guessing speeds:',

  'checker.title': 'Check your own password',
  'checker.label': 'Password to check',
  'checker.placeholder': 'Type or paste a password',
  'checker.show': 'Show',
  'checker.hide': 'Hide',
  'checker.bits': 'about {bits} bits',
  'checker.private': 'Checked on this device only. It is never sent or saved.',

  'history.title': 'Recent values',
  'history.note':
    'The last 10, kept only in the memory of this tab. Reloading or closing the page forgets them.',
  'history.clear': 'Clear',
  'history.empty': 'Nothing here yet.',
  'history.copy': 'Copy value {n}',

  'strength.veryWeak': 'Very weak',
  'strength.weak': 'Weak',
  'strength.fair': 'Fair',
  'strength.strong': 'Strong',
  'strength.veryStrong': 'Very strong',

  'feedback.empty': 'Type a password to check it. It never leaves this page.',
  'feedback.common': 'This is one of the most common passwords.',
  'feedback.word': 'It contains a common word or password.',
  'feedback.keyboard': 'Keyboard runs like qwerty or asdf are among the first guesses.',
  'feedback.sequence': 'Sequences like abc or 1234 are among the first guesses.',
  'feedback.repeat': 'Repeats like aaa or abcabc add very little.',
  'feedback.date': 'Dates and years are easy to guess.',
  'feedback.leet': 'Swaps like @ for a or 0 for o do not fool attackers.',
  'feedback.reversed': 'Reversed words are not much harder to guess.',
  'feedback.capitalization': 'A capital first letter, or all capitals, helps very little.',
  'feedback.short': 'Use at least 12 characters; longer is better.',
  'feedback.oneClass': 'Mix lowercase and uppercase letters, digits and symbols.',
  'feedback.longer': 'Add a few more random characters to make it very strong.',
  'feedback.useGenerator': 'Tip: let the generator make a random one for you.',
  'feedback.strong': 'No common patterns found. Nice work!',

  'rate.online': 'Online attack, rate-limited',
  'rate.online.note': '100 guesses per hour against a login page that slows attackers down.',
  'rate.slowHash': 'Offline, slow hash',
  'rate.slowHash.note':
    '10 thousand guesses per second against a stolen database protected by bcrypt or Argon2.',
  'rate.fastHash': 'Offline, fast hash',
  'rate.fastHash.note':
    '100 billion guesses per second: one modern graphics card against MD5 or SHA-1.',
  'rate.cluster': 'Huge cracking cluster',
  'rate.cluster.note':
    '100 trillion guesses per second: about a thousand graphics cards working together.',

  'time.instant': 'instantly',
  'time.seconds': { one: '{n} second', other: '{n} seconds' },
  'time.minutes': { one: '{n} minute', other: '{n} minutes' },
  'time.hours': { one: '{n} hour', other: '{n} hours' },
  'time.days': { one: '{n} day', other: '{n} days' },
  'time.months': { one: '{n} month', other: '{n} months' },
  'time.years': { one: '{n} year', other: '{n} years' },
  'time.beyondUniverse': 'longer than the age of the universe',

  'error.noCharacters': 'Select at least one character set.',
};

const tr = {
  'app.title': 'Parola Üretici',
  'app.tagline': 'Güçlü parolalar ve parola cümleleri, cihazınızda üretilir.',
  'header.reset': 'Sıfırla',
  'header.resetHint': 'Varsayılan seçeneklere dön, geçmişi ve denetleyiciyi temizle',
  'lang.button': 'EN',
  'lang.switch': 'İngilizceye geç',
  'notice.privacy':
    'Her şey tarayıcınızda çalışır, hiçbir şey gönderilmez. Üretilen değerler ve denetlenen parolalar asla kaydedilmez; bu cihazda yalnızca dil ve seçenekleriniz (ek karakterler ve ayraç dahil) hatırlanır.',
  'footer.source': "Kaynak kodu GitHub'da",

  'tabs.label': 'Üretilecek tür',
  'tab.password': 'Parola',
  'tab.passphrase': 'Parola cümlesi',
  'output.password': 'Üretilen parola',
  'output.passphrase': 'Üretilen parola cümlesi',
  'action.regenerate': 'Yeni',
  'action.regenerateHint': 'Yenisini üret',
  'action.copy': 'Kopyala',
  'action.copied': 'Kopyalandı!',
  'action.copyFailed': 'Kopyalanamadı. Metni seçip elle kopyalayın.',
  'status.generated': 'Yeni değer üretildi.',
  'demo.badge': 'Demo: örnek değerler',
  'hint.keys': 'Kısayollar:',
  'hint.new': 'yeni',
  'hint.copy': 'kopyala',
  'hint.tabs': 'sekme değiştir',
  'hint.swipe': 'İpucu: yenisi için değeri yana kaydırın.',

  'options.title': 'Seçenekler',
  'options.length': 'Uzunluk',
  'options.sets': 'Karakter kümeleri',
  'set.lower': 'Küçük harf',
  'set.upper': 'Büyük harf',
  'set.digits': 'Rakam',
  'set.symbols': 'Sembol',
  'options.lookAlikes': 'Benzer karakterleri çıkar',
  'options.custom': 'Ek karakterler',
  'options.customPlaceholder': 'örn. çğış€',
  'options.customHint':
    'Havuza ayrı bir küme olarak eklenir. Tekrarlar, boşluklar ve seçili bir kümede zaten olan karakterler atlanır.',
  'options.words': 'Kelime sayısı',
  'options.wordList': 'Kelime listesi',
  'wordList.en': 'İngilizce',
  'wordList.tr': 'Türkçe',
  'options.separator': 'Ayraç',
  'options.capitalization': 'Büyük harfler',
  'caps.lower': 'küçük harf',
  'caps.capitalize': 'Baş harf büyük',
  'caps.upper': 'BÜYÜK HARF',
  'caps.random': 'Rastgele',
  'options.number': 'Rakam ekle',

  'meter.title': 'Güç',
  'meter.bitsUnit': 'bit entropi',
  'meter.bitsShort': '{bits} bit',
  'entropy.passwordSource': '{pool} karakterlik havuzdan {length} karakter',
  'entropy.passphraseSource': '{list} kelimelik listeden {words} kelime',
  'entropy.plusCaps': 'rastgele büyük harfler',
  'entropy.plusDigit': 'rastgele bir rakam',
  'entropy.explain':
    'Entropi, olası değerlerin sayısını bit olarak ölçer: her ek bit, saldırganın yapması gereken tahmin sayısını ikiye katlar.',
  'crack.title': 'Kırılma süresi',
  'crack.intro':
    'Değerin nasıl üretildiğini tam olarak bilen bir saldırgan için, dört tahmin hızında ortalama süre:',

  'checker.title': 'Kendi parolanızı denetleyin',
  'checker.label': 'Denetlenecek parola',
  'checker.placeholder': 'Bir parola yazın ya da yapıştırın',
  'checker.show': 'Göster',
  'checker.hide': 'Gizle',
  'checker.bits': 'yaklaşık {bits} bit',
  'checker.private': 'Yalnızca bu cihazda denetlenir; hiçbir yere gönderilmez, kaydedilmez.',

  'history.title': 'Son değerler',
  'history.note':
    'Son 10 değer yalnızca bu sekmenin belleğinde tutulur. Sayfayı yenilemek ya da kapatmak hepsini siler.',
  'history.clear': 'Temizle',
  'history.empty': 'Henüz bir şey yok.',
  'history.copy': '{n}. değeri kopyala',

  'strength.veryWeak': 'Çok zayıf',
  'strength.weak': 'Zayıf',
  'strength.fair': 'Orta',
  'strength.strong': 'Güçlü',
  'strength.veryStrong': 'Çok güçlü',

  'feedback.empty': 'Denetlemek için bir parola yazın. Parola bu sayfadan hiç çıkmaz.',
  'feedback.common': 'Bu, en yaygın parolalardan biri.',
  'feedback.word': 'Yaygın bir kelime ya da parola içeriyor.',
  'feedback.keyboard': 'qwerty ya da asdf gibi klavye dizileri ilk denenenler arasındadır.',
  'feedback.sequence': 'abc ya da 1234 gibi sıralar ilk denenenler arasındadır.',
  'feedback.repeat': 'aaa ya da abcabc gibi tekrarlar çok az güç katar.',
  'feedback.date': 'Tarihler ve yıllar kolay tahmin edilir.',
  'feedback.leet': 'a yerine @, o yerine 0 yazmak saldırganları kandırmaz.',
  'feedback.reversed': 'Tersten yazılan kelimeleri tahmin etmek pek zor değildir.',
  'feedback.capitalization': 'İlk harfi ya da tüm harfleri büyük yazmak çok az işe yarar.',
  'feedback.short': 'En az 12 karakter kullanın; daha uzunu daha iyidir.',
  'feedback.oneClass': 'Küçük ve büyük harfleri, rakamları ve sembolleri karıştırın.',
  'feedback.longer': 'Birkaç rastgele karakter daha eklerseniz çok güçlü olur.',
  'feedback.useGenerator': 'İpucu: rastgele bir parolayı üretici sizin için oluştursun.',
  'feedback.strong': 'Yaygın bir kalıp bulunamadı. Harika!',

  'rate.online': 'Çevrim içi saldırı, sınırlı',
  'rate.online.note': 'Saldırganı yavaşlatan bir giriş sayfasına saatte 100 tahmin.',
  'rate.slowHash': 'Çevrim dışı, yavaş hash',
  'rate.slowHash.note':
    'bcrypt ya da Argon2 ile korunan çalıntı bir veritabanına saniyede 10 bin tahmin.',
  'rate.fastHash': 'Çevrim dışı, hızlı hash',
  'rate.fastHash.note':
    "Saniyede 100 milyar tahmin: MD5 ya da SHA-1'e karşı tek bir güncel ekran kartı.",
  'rate.cluster': 'Dev kırma kümesi',
  'rate.cluster.note': 'Saniyede 100 trilyon tahmin: birlikte çalışan yaklaşık bin ekran kartı.',

  'time.instant': 'anında',
  'time.seconds': '{n} saniye',
  'time.minutes': '{n} dakika',
  'time.hours': '{n} saat',
  'time.days': '{n} gün',
  'time.months': '{n} ay',
  'time.years': '{n} yıl',
  'time.beyondUniverse': 'evrenin yaşından daha uzun',

  'error.noCharacters': 'En az bir karakter kümesi seçin.',
};

/** All strings by language. */
export const STRINGS = Object.freeze({ en: Object.freeze(en), tr: Object.freeze(tr) });

const pluralRules = new Map();

/**
 * Returns a supported language code, falling back to English.
 * @param {unknown} value
 * @returns {'en'|'tr'}
 */
export function normalizeLanguage(value) {
  return LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
}

/**
 * Looks up a string and fills {name} placeholders from `vars`. A `count`
 * var picks the plural form. Unknown keys fall back to English, then to
 * the key itself.
 * @param {string} lang
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function translate(lang, key, vars = {}) {
  const language = normalizeLanguage(lang);
  const entry = STRINGS[language][key] ?? STRINGS.en[key];
  if (entry === undefined) return key;
  const text = typeof entry === 'string' ? entry : entry[pluralForm(language, vars.count)] ?? entry.other;
  return text.replace(/\{(\w+)\}/g, (placeholder, name) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : placeholder,
  );
}

/**
 * Formats a number the way the language writes it: 1901 is "1,901" in
 * English and "1.901" in Turkish; 104.87 with one digit is "104.9" or "104,9".
 * @param {string} lang
 * @param {number} value
 * @param {number} [fractionDigits] Digits after the decimal mark (default 0).
 * @returns {string}
 */
export function formatNumber(lang, value, fractionDigits = 0) {
  return new Intl.NumberFormat(LOCALES[normalizeLanguage(lang)], {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Formats a duration from humanizeSeconds, e.g. "3 hours", "510 billion
 * years", "2 saat".
 * @param {string} lang
 * @param {{ unit: string, count: number }} duration
 * @returns {string}
 */
export function formatDuration(lang, { unit, count }) {
  const language = normalizeLanguage(lang);
  const compact = count >= 1e6;
  const formatter = new Intl.NumberFormat(LOCALES[language], {
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'long',
    maximumFractionDigits: compact ? 1 : 0,
  });
  return translate(language, `time.${unit}`, { count, n: formatter.format(count) });
}

function pluralForm(language, count) {
  if (!pluralRules.has(language)) pluralRules.set(language, new Intl.PluralRules(LOCALES[language]));
  return pluralRules.get(language).select(Number(count ?? 0));
}
