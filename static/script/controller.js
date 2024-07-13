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
        let key = this.model.getSetting();
        key = key['language'];
        if (key == 'العربية') key = 0;
        if (key == 'Français') key = 1;
        if (key == 'English') key = 2;
        this.view.toLanguage.bind({
            ...this.view, 
            ...this.model.translations
        }, key)();
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
    speakText(text) {
        switch(this.view.speech) {
            case 'pause':
                this.speak('resume');
                this.view.speech = 'default';
                break;
            case 'default':
                let lang = this.model.getSetting()['language'];
                switch(lang) {
                    case 'العربية':
                        lang = 'Arabic';
                        break;
                    case 'Français':
                        lang = 'French';
                        break;
                    case 'English':
                        lang = 'English';
                        break;
                }
                this.speak('play', text, lang, 'Female');
                this.view.speech = 'end';
                break;
            default:
                this.speak('pause');
                this.view.speech = 'pause';
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
        if (confirm('Are you sure you want to clear your data ?')) {
            this.model.deleteDatabase(this.model.dbName);
            location.reload();
        }
    }
}
