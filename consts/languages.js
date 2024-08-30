class Language {
    constructor(seznamCode, deeplCode, translationWord) {
        this.seznamCode = seznamCode;
        this.deeplCode = deeplCode;
        this.translationWord = translationWord;
    }
}

const languages = {
    "english": new Language('cesky_anglicky', 'EN-US', 'Translation'),
    "german": new Language('cesky_nemecky', 'DE', 'Übersetzung'),
    "french": new Language('cesky_francouzsky', 'FR', 'Traduction'),
    "italian": new Language('cesky_italsky', 'IT', 'Traduzione'),
    "spanish": new Language('cesky_spanelsky', 'ES', 'Traducción'),
    "polish": new Language('cesky_polsky', 'PL', 'Tłumaczenie'),
    "russian": new Language('cesky_rusky', 'RU', 'Перевод'),
    "slovak": new Language('cesky_slovensky', 'SK', 'Preklad'),
    "ukrainian": new Language('cesky_ukrajinsky', 'UK', 'Переклад'),
}
export default languages;