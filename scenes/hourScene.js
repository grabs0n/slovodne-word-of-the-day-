import { BaseScene } from 'telegraf/scenes';
import { getChatSnapshotById, update } from '../functions/firebase.js'; // Импорт функций из firebase.js

const hourScene = new BaseScene('hourScene');

hourScene.enter((ctx) => ctx.reply('Please reply to this message with hour at which the bot will send the message:\n'
    + '(24 hours format czech time)'
));

hourScene.on('text', async (ctx) => {
    const hour = ctx.message.text;
    if (isNaN(hour) || hour < 0 || hour > 23) {
        ctx.reply('Please enter a valid hour (from 0 to 23).');
    } else {
        let chatSnapshot = await getChatSnapshotById(ctx.chat.id);
        const chatRef = chatSnapshot.ref;
        await update(chatRef, { timeConfig: hour });
        ctx.reply(`Time is set to ${hour} o'clock.`);
        ctx.scene.leave();
    }
});

export default hourScene;