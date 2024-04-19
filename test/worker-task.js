/* global*/

importScripts("dist/language-worker.js");
// importScripts("dist/language-worker-debug.js"); // uncomment to debug

function workerOK() {
    if(self.CSSLanguageService){
        postMessage({type: 'worker.ok'});
    }
}

function getAllSymbols(data) {
    const cssMode = self.CSSLanguageService.CSS_MODES[data.cssMode];
    const symbols = self.CSSLanguageService.getAllSymbols(data.text, cssMode, data.filePath);
    postMessage({type: "getAllSymbols", symbols});
}

self.addEventListener('message', (event) => {
    console.log('Worker received: ', event);
    const command = event.data.command;
    switch (command) {
    case 'workerOK': workerOK(); break;
    case 'getAllSymbols': getAllSymbols(event.data); break;
    default: console.error('unknown worker command: ', command);
    }
}, false);
