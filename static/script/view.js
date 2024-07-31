export default class View {
    constructor() {
        this.heads = document.querySelectorAll('header h1, article h1');
        this.nav = document.querySelector('nav').children[1];
        this.selectLanguage = this.nav.children[0].firstElementChild;
        this.form = document.forms[0];
        const style = document.createElement('style');
        style.id = 'dark-mode-style';
        document.querySelector('head').appendChild(style);
        this.alertBox = document.querySelector('[title=alert-box]');
        this.messagesContainer = document.querySelector('section');
        this.voiceRecordPrensenter = document.querySelector('[title=voice-record]');
        this.canvas = this.voiceRecordPrensenter.querySelector('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.chatHistoriesContainer = document.getElementsByTagName('aside')[0];
        this.searchInput = this.chatHistoriesContainer.children[1];
    }
    toLanguage(key) {
        [ 
            this.alertBox.children[0],
            ...this.heads,
        ].forEach(name => name.textContent = this.bouchra[key]);
        this.searchInput.placeholder = this.searchHistory[key];
        document.querySelector('[title=alert-box]').children[1].textContent = this.about[key];
        this.form.firstElementChild.placeholder = this.writeQuestion[key];
        this.form.lastElementChild.textContent = this.introText[key];
        const currentLanguge = this.chatLanguages[key];
        const languages = this.chatLanguages.filter(l => l !== currentLanguge);
        [
           ...this.nav.children[0].firstElementChild.children,
           ...this.nav.children,
        ].forEach(
            (child, index) => {
                child.firstChild.textContent = [
                    currentLanguge,
                    languages[0],
                    languages[1],
                    languages[2],
                    this.chooseLanguage[key],
                    this.darkMode[key],
                    this.chatHistory[key],
                    this.clearMyData[key],
                    this.seeAbout[key]
                ][index];
            }
            child.selected = index == 0 ? true : false;
        );
        switch (key) {
            case Number(0):
                this.form.firstElementChild.style.cssText += 'text-align:right; padding: 5px 20px 5px 5px;';
                this.heads.forEach(el => el.style.fontSize = 'x-large');
                this.nav.style.fontSize = '20px';
                this.form.lastElementChild.style.fontWeight = 'bold';
                break;
            case Number(1):
            case Number(2):
            case Number(3):
                this.form.firstElementChild.style.cssText += 'text-align:left; padding: 5px 5px 5px 20px;';
                this.heads.forEach(el => el.style.fontSize = '23px');
                this.nav.style.fontSize = '15px';
                this.form.lastElementChild.style.fontWeight = '500';
                break;
        }
    }
    changeViewMode(styles) {
        const icon = document.querySelector('[alt=view_mode]');
        if (icon.src.includes('dark.png')) {
            icon.src = '/static/img/light.png';
            document.getElementById('dark-mode-style').textContent = styles;
        } else {
            icon.src = '/static/img/dark.png';
            document.getElementById('dark-mode-style').textContent = styles;
        }
    }
    blur(_switch, tag) {
        if (_switch === 'on') {
            tag.style.display = 'block';
            [...document.querySelector('body').children].forEach(element => {
                if (element != tag) element.style.filter = 'blur(.7em)';
            });
        } else {
            tag.style.display = 'none';
            [...document.querySelector('body').children].forEach(element => {
                if (element != tag) element.style.filter = 'blur(0)';
            });
        }
    }
    displayAlertBox(time) {
        this.blur('on', this.alertBox);
        window.setTimeout(() => {
           this.blur('off', this.alertBox);
        }, time);
    }
    displayChatHistoryBox() {
        this.blur('on', this.searchInput.parentElement);
        this.searchInput.parentElement.firstElementChild.addEventListener('click', 
            () => {
                if (this.searchInput.parentElement.style.display != 'none') {
                    this.blur('off', this.searchInput.parentElement);
                }
            }
        );
    }
    chatHistories(data) {
        this.view.chatHistoriesContainer.children[2].innerHTML = '';
        for (const title of data) {
            const div = document.createElement('div')
                , p = document.createElement('p')
                , span = document.createElement('span')
                , img = document.createElement('img');
            p.textContent = 'Your Chat on:';
            span.textContent = title;
            img.src = '/static/img/delete.png';
            div.append(p, span, img);
            this.view.chatHistoriesContainer.children[2].appendChild(div);
            div.addEventListener('click', (e) => {
                if (e.target != img) {
                    this.view.blur('off', this.view.chatHistoriesContainer);
                    this.toOldChat(title);
                } else {
                    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                    this.model.deleteStore(title);
                }
            });
        }
    }
    sendMessage(message, lang) {
        const div = document.createElement('div');
        div.textContent = message;
        div.style.textAlign = lang == 'العربية' ? 'right' : 'left';
        this.messagesContainer.appendChild(div);
        this.form.firstElementChild.value = '';
        this.form.firstElementChild.style.height = '25px';
    }
    receivedMessage(msg, lang) {
        const pos = lang == 'العربية' ? 'right' : 'left';
        const md = window.markdownit();
        const p = document.createElement('p')
            , span = document.createElement('span')
            , icons = ["copy.png", "download.png", "share.png", "listen.jpg"].map(
                (src, index) => {
                    const icon = document.createElement('img'); icon.src = '/static/img/' + src; 
                    const actions = ['copy', 'download', 'share', 'speech'][index];
                    if (actions == 'speech') {
                        icon.alt = 'default';
                        icon.addEventListener('click', (e) => this.speakText(lang, icon));
                        return icon;
                    }
                    icon.addEventListener('click', () => {
                        this.actions.actions(
                            actions,
                            icon.parentElement.parentElement.innerText
                        )
                    });
                    return icon;
                }
        );
        span.append(...icons), p.innerHTML = md.render(msg);
        p.appendChild(span); p.style.textAlign = pos;
        this.view.messagesContainer.appendChild(p);
    }
    searchChatHistory(input) {
        let names = document.querySelectorAll('aside div span');
        input = input.value.toLowerCase();
        for (let name of names) {
            let letters = name.innerText.toLowerCase().search(input);
            if (letters > -1) name.parentElement.style.display = 'block';
            else name.parentElement.style.display = 'none';
        }
    }
    onRecording(startTime, mediaRecorder, dataArray, analyser) {
        this.data = Object.values(arguments);
        this.voiceRecordPrensenter.style.display = 'grid';
        this.voiceRecordPrensenter.firstElementChild.disabled = false;
        const updateStatus = () => {
            let elapsedPausedTime = 0;
            if (this.pauseTime) {
                elapsedPausedTime = this.isRecordingPaused ? Date.now() - this.pauseTime : 0;
            }
            const durationInSeconds = ((Date.now() - startTime) + elapsedPausedTime) / 1000;
            const hours = Math.floor(durationInSeconds / 3600);
            const minutes = Math.floor((durationInSeconds % 3600) / 60);
            const seconds = Math.floor(durationInSeconds % 60);
            const formattedDuration = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            document.querySelector('#duration').textContent = formattedDuration;
            if (this.isRecording === 'end')  {
                document.querySelector('#duration').textContent = '0:00';
                this.isRecording = null;
            }
            if (mediaRecorder.state === 'recording') { 
                setTimeout(updateStatus, 70);
            }
        };
        updateStatus(); 
        this.draw(dataArray, analyser);
    }       
    draw(dataArray, analyser) {
        const [WIDTH,  HEIGHT] = [this.canvas.width, this.canvas.height];
        this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (WIDTH / dataArray.length) * 2.5;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i];
            this.canvasCtx.fillStyle = `rgb(50, 50, ${barHeight + 100})`;
             this.canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
        this.animationFrameId = window.requestAnimationFrame(() => this.draw(dataArray, analyser));
    }
    turnRecording(_switch) {
        switch (_switch) {
            case 'on':
                if (this.data) {
                    this.isRecording = true;
                    this.isRecordingPaused = false;
                    this.onRecording(...this.data);
                }
                this.voiceRecordPrensenter.children[3].src = '/static/img/pause.png';
                break;
            case 'off':
                cancelAnimationFrame(this.animationFrameId);
                this.isRecording = false;
                this.isRecordingPaused = true;
                this.pauseTime = Date.now(); 
                this.voiceRecordPrensenter.children[3].src = '/static/img/play.png';
                break;
        }
    }
    finishedRecording() {
        cancelAnimationFrame(this.animationFrameId);
        this.isRecording = 'end';
        this.isRecordingPaused = true;
        this.voiceRecordPrensenter.children[3].src = '/static/img/pause.png';
        this.pauseTime = null;
        document.querySelector('#duration').textContent = '0:00';
        this.voiceRecordPrensenter.style.display = 'none';
    }
    sendVoiceMessage(blob) {
        this.finishedRecording();
        const audio = new Audio(window.URL.createObjectURL(blob))
            , div = document.createElement('div')
            , range = document.createElement('input')
            , img = document.createElement('img')
            , duration = document.createElement('span')
            , endTime = duration.cloneNode(true);
        div.setAttribute('title', 'audio');
        range.type = 'range'; range.min = 0; range.max = 100; range.step = 1; range.value = 0;
        img.src = "/static/img/play.png";
        let isPlaying = false;
        audio.onplaying = () => { isPlaying = true; }
        audio.onpause = () => { isPlaying = false; }
        div.append(img, duration, range, endTime);
        this.messagesContainer.appendChild(div);
        audio.addEventListener('canplaythrough', () => {
            range.addEventListener('input', (e) => {
                audio.currentTime = (audio.duration == 'Infinity' ? 1: audio.duration) * (range.value / 100);
            });
            img.addEventListener('click', async() => {
                if (audio.paused && !isPlaying) {
                    await audio.play()
                    img.src = '/static/img/pause.png';
                    return;
                } 
                if (!audio.paused && isPlaying){
                    audio.pause();
                    img.src = '/static/img/play.png';
                    return;
                }
            });
        });
        audio.addEventListener('loadeddata', () => {
            const updateDuration = () => {
                return new Promise((resolve, reject) => {
                    const audioDuration = audio.duration
                    if (audioDuration != 'Infinity') {
                        const hours = Math.floor(audioDuration / 3600)
                            , minutes = Math.floor((audioDuration % 3600) / 60)
                            , seconds = Math.floor(audioDuration % 60)
                            , formattedDuration = hours > 0 ? `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}` 
                                : `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                        resolve(formattedDuration);
                    } else reject('...');
                });
            }
            updateDuration().then( (result) => {
                duration.textContent = result;
            }).catch(em => {
                duration.textContent = em;
            });
        });
        audio.addEventListener('timeupdate', () => {
            const currentTime = audio.currentTime;
            const audioDuration = audio.duration;
            if (audioDuration != 'Infinity') {
                range.value = (currentTime / audioDuration) * 100;
                const minutes = Math.floor(currentTime / 60)
                    , seconds = Math.floor(currentTime % 60);
                endTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
        });
        audio.addEventListener('ended', () => {
            img.src = '/static/img/play.png';
            range.value = 0;
            duration.textContent = endTime.textContent;
            endTime.textContent = '0:00';
        });
    }
    savedMessages(ctrl, messages) {
        this.messagesContainer.innerHTML = '';
        messages.forEach(message => {
            typeof message['user'] ==  'string' ? this.sendMessage(message['user'], message.language) : this.sendVoiceMessage(message['user']);
            this.receivedMessage.call(ctrl, message['bouchra'], message.language);
        });
    }
    handleEvents(ctrl) {
        (() => { ctrl.toLanguage(); ctrl.viewMode('default'); })();
        this.selectLanguage.addEventListener('change', () => ctrl.selectedLanguage(this.selectLanguage.value.trim()));
        this.nav.children[1].firstElementChild.addEventListener('click', () => ctrl.changeViewMode());
        this.nav.children[2].addEventListener('click', () => this.displayChatHistoryBox());
        this.nav.children[3].addEventListener('click', () => ctrl.clearAllData());
        this.nav.lastElementChild.addEventListener('mouseover', () => ctrl.displayAlertBox());
        this.searchInput.addEventListener('input', (ev) => this.searchChatHistory(ev.target));
        this.form.firstElementChild.addEventListener('input', (e) => {
            const area = e.target;
            if (!area.value.trim().length) area.value = '';
            if (area.scrollHeight < 150) area.style.height = area.scrollHeight + 'px';
        });
        this.form.children[2].addEventListener('click', () => ctrl.sendMessage(this.form.firstElementChild));
        this.form.children[1].addEventListener('click', () => ctrl.startRecording());
        this.voiceRecordPrensenter.children[3].addEventListener('click', (e) => ctrl.onRecording(e.target));
        this.voiceRecordPrensenter.firstElementChild.addEventListener('click', () => ctrl.cancelRecording())
        this.voiceRecordPrensenter.lastElementChild.addEventListener('click', () => ctrl.sendVoiceMessage());
    }
}
