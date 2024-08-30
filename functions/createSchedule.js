import * as deepl from 'deepl-node';
import languages from "../consts/languages.js";
import { getRandomWord } from "./getRandomWord.js";
import { getWikipediaSummary } from "./getWikipediaSummary.js"
import { getChatSnapshotById } from "./firebase.js";
import { createImage } from "./createImage.js";
import bot from '../bot.js';
import { CronJob, CronTime } from 'cron';
import fs from 'fs/promises';
import { sum } from 'firebase/firestore/lite';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

const escapeMarkdownV2 = (text) => {
    const escapeChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '!', '.'];
    escapeChars.forEach((char) => {
        text = text.split(char).join(`\\${char}`);
    });
    return text;
};

export async function sendWord(chatId) {
    let summaryData = null;
    let word = '';
    while (!summaryData) {
        word = await getRandomWord(1);
        summaryData = await getWikipediaSummary(word);
    }

    let title = 'SlovoDne:\n';
    let summary = summaryData.extract.trim();
    // summary = summary.replace(/\n$/, "");
    console.log(summary);

    let language = languages[(await getChatSnapshotById(chatId)).val().primaryLanguage];
    let filename = chatId + Date.now().toString();
    const filePath = (await createImage(word, filename)).filePath;

    let translation = (await translator.translateText(word, 'cs', language.deeplCode)).text;
    let escapedTranslation = escapeMarkdownV2(translation).toLowerCase();
    let spoilerTranslation = '||' + escapedTranslation + '||' + '\n';

    let seznamLink = `https://slovnik.seznam.cz/preklad/${language.seznamCode}/${word}`;
    let formatedLink = '[Seznam slovnik](' + escapeMarkdownV2(seznamLink) + ')';
    let continueReading = '[\\.\\.\\.\nWikipedia](' + escapeMarkdownV2(summaryData.content_urls.desktop.page) + ')\n';

    let totalLength = title.length + (summary.length + 1) + (language.translationWord.length + 2)
        + spoilerTranslation.length + formatedLink.length + continueReading.length;

    if (totalLength > 1024) {
        let difference = totalLength - 1024;
        summary = summary.slice(0, -difference);
    }
    summary = escapeMarkdownV2(summary);

    let caption = title;
    caption += summary;
    caption += continueReading;
    caption += language.translationWord + ': ';
    caption += spoilerTranslation;
    caption += formatedLink;
    try {
        await bot.telegram.sendPhoto(chatId, { source: filePath }, { caption, parse_mode: 'MarkdownV2' });
    }
    catch (error) {
        console.log(error);
        bot.telegram.sendMessage(process.env.ADMIN_ID, error + '\nWord: ' + word + '\nChat ID: ' + chatId);
    }
    await fs.unlink(filePath);
}

export function createPattern(hour) {
    const pattern = `0 0 ${hour} * * *`;
    // test pattern
    // const pattern = `*/${hour} * * * * *`;
    return pattern;
}

export async function createSchedule(chatId) {
    const chat = (await getChatSnapshotById(chatId)).val()
    const hour = chat.timeConfig;
    const status = chat.status;
    const pattern = createPattern(hour);
    return new CronJob(pattern, function () {
        sendWord(chatId);
    }, null, status);
}

export async function changeHour(schedule, newHour) {
    const pattern = createPattern(newHour);
    schedule.setTime(new CronTime(pattern));
}