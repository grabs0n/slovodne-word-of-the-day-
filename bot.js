//TODO: time zones

import 'dotenv/config';
import { Telegraf, Scenes, session } from 'telegraf';

import hourScene from './scenes/hourScene.js';
import languageScene from './scenes/languageScene.js';

import { chatsRef, update, get, push, orderByChild, equalTo, query, onChildChanged, getChatSnapshotById } from './functions/firebase.js';

import { createSchedule, sendWord, changeHour, createPattern } from './functions/createSchedule.js';
import { Chat } from './consts/chat.js';
import { CronJob, CronTime } from 'cron';

const { Stage } = Scenes;

const bot = new Telegraf(process.env.BOT_TOKEN, { username: '@slovodnya1337_bot' });
const stage = new Stage([hourScene, languageScene]);

bot.use(session({ collectionName: 'sessions' }));
bot.use(stage.middleware());

onChildChanged(chatsRef, (snapshot) => {
    const newData = snapshot.val();
    if (schedules[newData.chatId]) {
        const changedChatSchedule = schedules[newData.chatId];

        if (newData.status !== changedChatSchedule.running) {
            if (newData.status)
                changedChatSchedule.start();
            else
                changedChatSchedule.stop();
        }


        let newTime = new CronTime(createPattern(newData.timeConfig));
        if (newTime.toString() != changedChatSchedule.cronTime.toString()) {
            changeHour(changedChatSchedule, newData.timeConfig);
        }
    }
    //added to a new chat
    else {
        createSchedule(newData.chatId)
            .then((schedule) => { schedules[newData.chatId] = schedule });
    }
    console.log(newData);
});

bot.command('set_hour', (ctx) => ctx.scene.enter('hourScene'));
bot.command('word', async (ctx) => {
    if (ctx.chat.id == process.env.ADMIN_ID) {
        sendWord(ctx.chat.id)
    }
    else {
        ctx.reply('You can not use this command');
    }
});

bot.command('set_language', (ctx) => ctx.scene.enter('languageScene'));
bot.command('on', async (ctx) => {
    const chatSnapshot = await getChatSnapshotById(ctx.chat.id)
    const chatRef = chatSnapshot.ref;
    await update(chatRef, { status: true });
    ctx.reply('Schedule was turned on, word of the day will be sent at ' + chatSnapshot.val().timeConfig +
        '\nIf you want to change it use /set_hour');
});
bot.command('off', async (ctx) => {
    turnOffInChat(ctx.chat.id);
    ctx.reply('Schedule was turned off');
});

function handleNewChat(newChatId) {
    let newChatQuery = query(chatsRef, orderByChild('chatId'), equalTo(newChatId));
    get(newChatQuery).then(async snapshot => {
        if (!snapshot.exists()) {
            let chat = new Chat(newChatId);
            await push(chatsRef, chat);
            createSchedule(newChatId)
                .then((schedule) => { schedules[newChatId] = schedule });
        }
    });
}

async function turnOffInChat(chatId) {
    const chatRef = (await getChatSnapshotById(chatId)).ref;
    await update(chatRef, { status: false });
}

let welcomeMessage = "Hi, nice to meet you. I can send a random czech word every day at the hour you want. Here is the list of commands that I can understand:\n" +
    "/on - turn on the schedule (by default it's turned off)\n" +
    "/off - turn off the schedule\n" +
    "/set_hour - set the hour when I should send you words\n" +
    "/set_language - set your primary language; I will translate words to this language for you";
// Добавление или удаление бота из группы
bot.on('my_chat_member', async (ctx) => {
    const chatMemberUpdate = ctx.update.my_chat_member;
    const chatId = chatMemberUpdate.chat.id;
    const newStatus = chatMemberUpdate.new_chat_member.status;
    const oldStatus = chatMemberUpdate.old_chat_member.status;

    if (newStatus === 'kicked') {
        console.log(`Bot was blocked by user in chat ${chatId}`);
        turnOffInChat(chatId);
    }

    if (oldStatus !== 'member' && newStatus === 'member') {
        handleNewChat(chatId);
        ctx.reply(welcomeMessage)
    }

    else {
        const chatRef = (await getChatSnapshotById(chatId)).ref;
        update(chatRef, { status: false });
    }
});

bot.start((ctx) => {
    if (ctx.message.chat.type === 'private') {
        handleNewChat(ctx.chat.id);
        ctx.reply(welcomeMessage);
        console.log('Бот запущен пользователем в личном чате');
    }
});

bot.launch().then(console.log("✅ Running..."));

//Запуск розкладів

let schedules = {};


get(chatsRef).then(snapshot => {
    let value = snapshot.val();
    for (let chat in value) {
        let object = value[chat];
        if (object.timeConfig) {
            createSchedule(object.chatId)
                .then((schedule) => { schedules[object.chatId] = schedule });
        }
    }
    console.log("Schedules running")
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot;
