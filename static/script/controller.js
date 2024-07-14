import { voiceRecord, Actions } from "https://cdn.jsdelivr.net/gh/UmarBelloKanwa/webapi@main/library.js";

export default class Controller extends voiceRecord {
    constructor(model, view) {
        super();
        this.model = new model(this);
        this.view = new view();
        this.actions = new Actions();
        this.view.handleEvents(this);
    } 
    selectedLanguage(lang) {
        this.model.setSetting({'language' : lang});
        this.toLanguage();
    }
    toLanguage() {
        this.view.toLanguage.bind({
            ...this.view, 
            ...this.model.translations
        }, Number(this.model.getLanguageKey()))();
    }
    viewMode(mode) {
        let styles = this.model.darkModeStyles;
        if (mode == 'default') mode = this.model.getSetting()['view_mode'];
        if (mode == 'Light') styles = '';
        this.model.setSetting({'view_mode': mode});
        this.view.changeViewMode(styles);
    }
    changeViewMode() {
        const view = this.model.getSetting()['view_mode']; 
        this.viewMode(( view === 'Light' ? 'Dark' : 'Light'));
    }
    displayAlertBox() {
        this.view.displayAlertBox(5000);
    }
    async startRecording() {
        if (this.mediaRecorder?.state === 'recording') return;
        if (this.mediaRecorder?.state === 'paused') {
            this.turnVoiceRecord('resume');
            this.view.turnRecording('on');
            return;
        }
        const record = await this.turnVoiceRecord('play');
        if (record?.stream) {
            this.view.onRecording(
                Date.now(),
                this.mediaRecorder,
                record.dataArray,
                record.analyser,
            );
        }
    }
    onRecording(icon) {
        if (this.mediaRecorder) {
            switch(icon.src.includes('play')) {
                case true:
                    this.turnVoiceRecord('resume');
                    this.view.turnRecording('on');
                    break;
                case false:
                    this.turnVoiceRecord('pause');
                    this.view.turnRecording('off');
                    break;
            }
        }
    }
    stopRecording() {
        return new Promise((resolve, reject) => {
            this.mediaRecorder?.addEventListener('stop', () => {
                const blob = new Blob(
                    this.chunks,
                    { type: 'audio/wav' }
                );
                resolve(blob);
                this.chunks = [];
            });
            this.mediaRecorder?.addEventListener('error', (e) => void reject(e));
            this.turnVoiceRecord('stop');
        })
    }
    cancelRecording() {
        this.turnVoiceRecord('stop');
        this.view.finishedRecording();
    }
    sendVoiceMessage() {
        if (this.mediaRecorder) {
            this.stopRecording().then(
                async(blob) => {
                    this.view.sendVoiceMessage(blob);
                    let receivedMessage =  await this.model.getMessage(blob);
                    if (!receivedMessage) {
                        receivedMessage = this.model.translations.notSentMessage[0];
                        this.actions('notify', receivedMessage);
                    }
                    this.view.receivedMessage.call(this, receivedMessage);
                }
            );
        }
    }
    async sendMessage(input) {
        const message = input.value.trim();
        if (message.length) {
            this.view.sendMessage(message);
            this.view.receivedMessage.call(this, await this.model.getMessage(message));
        }
    }
    speakText(lang, icon) {
        const text = icon.parentElement.parentElement.innerText;
        switch(icon.alt) {
            case 'pause':
                this.actions.speak('resume');
                icon.alt = 'default';
                break;
            case 'default':
                switch(lang) {
                    case 'العربية':
                        lang = 'Arabic';
                        break;
                    case 'Français':
                        lang = 'French';
                        break;
                    case 'English':
                        lang = 'US English';
                        break;
                    case 'Hausa' : 
                        lang = 'UK English';
                        break;
                }
                this.actions.speak('play', text, lang, 'Female');
                icon.alt = 'end';
                break;
            default:
                this.actions.speak('pause');
                icon.alt = 'pause';
                break;
        }
    }    
    savedMessages(messages) {
       this.view.savedMessages(this, messages);
    }
    pushChatHistory(data) {
        this.view.chatHistories.call(this, data);
    }
    toOldChat(storeName) {
        this.model.storeName = storeName;
        this.model.loadChat();
    }
    clearAllData() {
        let q = this.model.translations.clearData;
        q = q[this.model.getLanguageKey()];
        if (confirm(q)) {
            this.model.deleteDatabase(this.model.dbName);
            location.reload();
        }
    }
}
