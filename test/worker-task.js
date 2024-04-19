/* global*/

importScripts("dist/language-worker.js");
// importScripts("dist/language-worker-debug.js"); // uncomment to debug

function workerOK() {
    if(self.CSSLanguageService){
        postMessage('worker.ok');
    }
}

self.addEventListener('message', (event) => {
    console.log('Worker received: ', event);
    const command = event.data.command;
    switch (command) {
    case 'workerOK': workerOK(); break;
    default: console.error('unknown worker command: ', command);
    }
}, false);
