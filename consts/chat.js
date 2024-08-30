export class Chat {
    constructor(chatId, primaryLanguage = 'english', status = false, timeConfig = 9) {
        this.chatId = chatId;
        this.primaryLanguage = primaryLanguage;
        this.status = status;
        this.timeConfig = timeConfig;
    }
}