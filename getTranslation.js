import * as cheerio from 'cheerio';
const apiLanguage = {
    english: ['en_cz', 'cz_en'],
    german: ['de_cz', 'cz_de'],
    french: ['fr_cz', 'cz_fr'],
    italian: ['it_cz', 'cz_it'],
    spanish: ['es_cz', 'cz_es'],
    croatian: ['hr_cz', 'cz_hr'],
    polish: ['pl_cz', 'cz_pl'],
    russian: ['ru_cz', 'cz_ru'],
    slovakian: ['sk_cz', 'cz_sk'],
    ukrainian: ['uk_cz', 'cz_uk']
}

async function getTranslation(language, text) {
    const url = new URL('https://slovnik.seznam.cz/api/slovnik');
    url.searchParams.append('dictionary', apiLanguage[language][1]);
    url.searchParams.append('query', text);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        let trans = '';
        data.translate[0].grps[0].sens
            .forEach((element) => {
                trans += (element.trans[0]);
            });
        const $ = cheerio.load(trans);

        // Извлечение текста без HTML тегов
        const textOnly = $.text();
        return textOnly;
    } catch (error) {
        console.error('Failed to fetch translation:', error);
        throw error; // Optional: re-throw the error if you want it to be handled by the caller
    }
}

console.log(await getTranslation('english', 'půda'));