export class Storage {
    constructor(name) {
        window[name] = class {
            constructor() {
                this.dbName = name;
                this.dataBase = null;
                this.lastStore = null;
            }
            openDatabase(action, storeName) {
                return new Promise((resolve, reject) => {
                    try {
                        this.dataBase?.close();
                        let request;
                        const newVersion = (this.dataBase?.version || 0) + 1;
                        request = action == 'run' ? indexedDB.open(this.dbName) : indexedDB.open(this.dbName, newVersion);
                        request.addEventListener('upgradeneeded', (ev) => {
                            this.dataBase = ev.target.result;
                            switch(action) {
                                case 'create':
                                case 'update':
                                    if (!this.dataBase.objectStoreNames.contains(storeName)) {
                                        this.dataBase.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                                        console.log(`Object store ${storeName} created.`);
                                    } else console.log(`Object store ${storeName} already exists.`);
                                    break;
                                case 'delete':
                                    if (this.dataBase.objectStoreNames.contains(storeName)) {
                                        this.dataBase.deleteObjectStore(storeName);
                                        console.log(`Object store ${storeName} deleted.`);
                                    } else console.log(`Object store ${storeName} does not exist.`);
                                    break;
                            }
                            console.log(`Database ${this.dbName} is being upgraded.`);
                        });
                        request.addEventListener('success', (e) => {
                            this.dataBase = e.target.result;
                            this.dbVersion= e.newVersion;
                            resolve(this.dataBase);
                        });
                        request.addEventListener('error', (e) => {
                            console.error("Error updating database version: " + e.target.error);
                            reject(e.target.error);
                        });
                        this.lastStore = this.dataBase && this.dataBase.objectStoreNames.length > 0 ?
                            this.dataBase.objectStoreNames[this.dataBase.objectStoreNames.length -1] : null;
                    } catch (error) {
                        console.error("Error accessing database:", error);
                        reject(error);
                    }
                });
            }
            deleteDb(name) {
                return new Promise((resolve, reject) => {
                    try {
                        const _delete = indexedDB.deleteDatabase(name);
                        _delete.onsuccess = () => resolve();
                        _delete.onerror = () => reject('Error deleting ' + name + ' database');
                    } catch (error) { reject(error); }
                });
            }
            async operate(action, storeName, data = '') {
                if (!this.dataBase || !this.dataBase.objectStoreNames.contains(storeName)) {
                    await this.openDatabase(action === 'display' ? 'run' : 'update', storeName);
                }
                return new Promise((resolve, reject) => {
                    console.log('Database version', this.dataBase.version);
                    if (action === 'display' && !this.dataBase.objectStoreNames.contains(storeName)) resolve([]);
                    const transaction = this.dataBase.transaction([storeName], 'readwrite');
                    const objectStore = transaction.objectStore(storeName);
                    transaction.addEventListener('complete', () => {
                        resolve();
                    });
                    transaction.addEventListener('error', (e) => {
                        reject(e.target.error);
                    });
                    transaction.addEventListener('error', (e) => {
                        console.error("Transaction error:", e.target.error);
                        reject(e.target.error);
                    });
                    switch (action) {
                        case 'add':
                            const addRequest = objectStore.add(data);
                            addRequest.onsuccess = (e) => resolve(e.target.result);
                            break;
                        case 'update':
                            const updateRequest = objectStore.put(data);
                            updateRequest.onsuccess = (e) => resolve(e.target.result);
                            break;
                        case 'delete':
                            const deleteRequest = objectStore.delete(data);
                            deleteRequest.onsuccess = () => resolve();
                            break;
                        case 'display':
                            let datas = [];
                            const cursorRequest = objectStore.openCursor();
                            cursorRequest.onsuccess = (e) => {
                                const cursor = e.target.result;
                                if (cursor) {
                                    datas.push(cursor.value);
                                    cursor.continue();
                                } else {
                                    resolve(datas);
                                }
                            };
                            cursorRequest.onerror = (e) => reject(e.target.error);
                            break;
                        default:
                            reject(new Error('Invalid operation'));
                    }
                });
            }
        }
    }
}
export class Actions {
    constructor() {
        const script = document.createElement('script');
        script.src = "https://code.responsivevoice.org/responsivevoice.js?key=tyx4tT4l";
        document.head.appendChild(script);
        setTimeout(() => {responsiveVoice.enableWindowClickHook();}, 3000);
    }
    speak(action = 'play', text = '', lang = 'english', speaker = 'male') {
        switch (action) {
            case 'play' :
                responsiveVoice.speak(text, `${lang} ${speaker}`, { language: lang });
                break;
            case 'pause' :
                responsiveVoice.pause();
                break;
            case 'resume' :
                responsiveVoice.resume();
                break;
            case 'cancel' :
                responsiveVoice.cancel();
                break;
        }
    }
    notify(text) {
        if ('Notification' in window) {
            Notification.requestPermission().then( permission => void new Notification(text));
            return;
        }
        const alert = document.createElement('alert');
        alert.textContent = text;
        alert.style = `
            position:absolute; bottom:11vh; left:50%;
            transform:translate(-50%, 0%); z-index:7;  
            box-shadow:0 0 1.5vw 0 var(--txt),  0 0 5vw 0 black;
            width:fit-content; height:auto; text-align:center;
            background:rgba(255, 255, 255, 1); color:black;
            border-radius:2em; padding:1em;`;
        document.body.appendChild(alert);
        window.setTimeout(() => document.body.removeChild(alert), 3335);
    }
    actions(actions, data) {
        switch (actions) {
            case 'notify' : 
               this.notify(data);
               break;
            case 'copy' :
                if (navigator.clipboard != 'undefined') {
                    navigator.clipboard.writeText(data);
                    this.notify('copied');
                } else notify('Failed to copy the text');
                break;
            case 'download' :
                const link = document.createElement('a');
                link.href = data;
                link.href = URL.createObjectURL(new Blob([data], { type : 'text/plain'}));
                link.download = data.slice(0, 12);
                link.click();
                this.notify('Downloaded file ' + link.download);
                break;
            case 'share' :
                if (navigator.share != 'undefined') {
                    navigator.share({
                        title : data.slice(0, 12),
                        text : data,
                    });
                    this.notify('Shared');
                } else notify('Web Share API is not supported by this browser');
                break;
        }
    }
}
export class voiceRecord {
    async turnVoiceRecord(action) {
        switch (action) {
            case 'play' :
                try {
                    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
                        , analyser = audioContext.createAnalyser()
                        , source = audioContext.createMediaStreamSource(this.stream);
                    source.connect(analyser);
                    analyser.fftSize = 256;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    this.mediaRecorder = new MediaRecorder(this.stream);
                    this.chunks = [];
                    this.mediaRecorder.addEventListener('dataavailable', (e) => this.chunks.push(e.data));
                    this.mediaRecorder.start();
                    return {
                        'stream' : this.stream,
                        'analyser' : analyser,
                        'dataArray' : dataArray
                    };
                } catch (error) {
                    this.actions('notify', 'Error accessing microphone: ' + error);
                    return null;
                }
            case 'pause' :
                if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.pause();
                break;
            case 'stop' :
                if (this.mediaRecorder?.state) this.mediaRecorder.stop();
                if (this.stream) this.stream.getTracks().forEach(track => track.stop());
                break;
            case 'resume' :
                if (this.mediaRecorder?.state === 'paused') this.mediaRecorder.resume();
                break;
        }
    }
}