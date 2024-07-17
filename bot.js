import 'dotenv/config'

import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, set, get, push, orderByChild, equalTo, query, child } from "firebase/database";

import fetch from 'node-fetch';

import { Telegraf, Scenes, session } from 'telegraf';
const { BaseScene, Stage } = Scenes;
import { CronJob } from 'cron';

import { message } from 'telegraf/filters';
import Jimp from 'jimp';
import * as deepl from 'deepl-node';

import * as fs from "fs";
const firebaseConfig = {

    apiKey: "AIzaSyCpZylCpnTq2BmABMJE_fY2fyLsvUVRzac",
    authDomain: "slovodnya-c444d.firebaseapp.com",
    databaseURL: "https://slovodnya-c444d-default-rtdb.firebaseio.com",
    projectId: "slovodnya-c444d",
    storageBucket: "slovodnya-c444d.appspot.com",
    messagingSenderId: "190691442752",
    appId: "1:190691442752:web:ad6b14721e47afb1e29fa5",
    measurementId: "G-BD2WWL8Q1E"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chats = ref(db, 'chats');

const bot = new Telegraf(process.env.BOT_TOKEN, { username: '@slovodnya1337_bot' })

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

async function getRandomWord(number = 1) {
    let response = await fetch('http://slova.cetba.eu/generate.php?number=' + number)
        .then(response => response.text());
    return response;
}

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
        return data;
    } catch (error) {
        console.error('Failed to fetch translation:', error);
        throw error; // Optional: re-throw the error if you want it to be handled by the caller
    }
}

class Chat {
    constructor(chatId) {
        this.chatId = chatId;
    }
}

// Налаштування години
const hourScene = new BaseScene('hourScene');
const stage = new Stage([hourScene]);
hourScene.enter((ctx) => ctx.reply('Введіть о котрій годині бот буде надсилати повідомлення:'));
hourScene.on('text', async (ctx) => {

    const hour = ctx.message.text;
    if (isNaN(hour) || hour < 0 || hour > 23) {
        ctx.reply('Будь ласка, введіть коректну годину (від 0 до 23).');
    } else {
        let chatQuery = query(chats, orderByChild('chatId'), equalTo(ctx.chat.id));

        await get(chatQuery).then(async (snapshot) => {


            console.log(snapshot.val());

            snapshot.forEach(async (childSnapshot) => {
                // Get the reference to the specific chat
                const chatRef = childSnapshot.ref;

                // Update the reference
                await update(chatRef, { timeConfig: hour });
            });


            ctx.session.hour = hour;
            ctx.reply(`Час встановлено на ${hour} годину.`);
            ctx.scene.leave();
        });
    }
});


// Додавання middlewares
bot.use(session({ collectionName: 'sessions' }));
bot.use(stage.middleware());

// const timeSettingScene = new BaseScene('timeSettingScene');


bot.command('set_hour', (ctx) => ctx.scene.enter('hourScene'));


function addSchedule(chatId, pattern = '*/5 * * * * *') {
    new CronJob(pattern, async function () {
        let generatedMessage = await getRandomWord();
        bot.telegram.sendMessage(chatId, generatedMessage)
    },
        null,
        true
    )
    // console.log('new cron job for ' + chatId)
}


//test command
bot.command('word', async (ctx) => {
    const word = await getRandomWord(1);
    const translation = await translator.translateText(word, null, 'en-US');
    const image = new Jimp(800, 600, '#ffffff');
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, 10, 10, word);
    image.print(font, 60, 60, translation);


    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    fs.writeFileSync('image.png', buffer);
    await ctx.replyWithPhoto({ source: 'image.png' });
});

//Додавання чи кік з групи
bot.on('my_chat_member', (ctx) => {
    const chatMemberUpdate = ctx.update.my_chat_member;
    const newStatus = chatMemberUpdate.new_chat_member.status;
    const oldStatus = chatMemberUpdate.old_chat_member.status;


    // Check if the bot's status has changed to "member"
    if (oldStatus !== 'member' && newStatus === 'member') {
        const newChatId = chatMemberUpdate.chat.id;
        let newChatQuery = query(chats, orderByChild('chatId'), equalTo(newChatId));
        get(newChatQuery).then(async snapshot => {
            if (snapshot.exists()) {
            }
            else {
                let chat = new Chat(newChatId);
                await push(chats, chat);
                addSchedule(newChatId);
            }
        })

        console.log('Bot was added to a new chat with ID:', newChatId);


        // Send a welcome message to the new chat
        ctx.telegram.sendMessage(newChatId, 'Hello! Thank you for adding me to the chat.');
    }
});


bot.launch().then(console.log("✅ Running..."));

//Запуск розкладів

// get(chats).then(snapshot => {
//     let value = snapshot.val();
//     console.log(value)
//     for (let chat in value) {
//         let object = value[chat];

//         if (object.chatId) {
//             if (object.timeConfig) {
//                 addSchedule(object.chatId, `*/${object.timeConfig} * * * * *`)
//             }
//             // console.log('added schedule for ' + value[chat].chatId)
//         }
//     }
// })

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
