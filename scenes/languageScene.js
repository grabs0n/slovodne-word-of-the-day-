import { Markup } from 'telegraf';
import { BaseScene } from 'telegraf/scenes';
import { getChatSnapshotById, update } from '../functions/firebase.js';
import languages from '../consts/languages.js';

const languageScene = new BaseScene('languageScene');

languageScene.enter((ctx) => {
    const buttons = [];
    for (let language in languages) {
        buttons.push([Markup.button.callback(language.charAt(0).toUpperCase() + language.slice(1), 'lang_' + language)]);
    }
    ctx.reply('Select your primary language:', Markup.inlineKeyboard(buttons));
});

languageScene.action(/lang_(.+)/, async (ctx) => {
    const lang = ctx.match[1];
    let chatSnapshot = await getChatSnapshotById(ctx.chat.id);
    const chatRef = chatSnapshot.ref;
    await update(chatRef, { primaryLanguage: lang });
    ctx.answerCbQuery('Your primary language was set');
    ctx.scene.leave();
});

export default languageScene;