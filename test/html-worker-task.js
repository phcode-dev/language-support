/* global*/

importScripts("dist/language-worker.js");
// importScripts("dist/language-worker-debug.js"); // uncomment to debug

function workerOK() {
    if(self.HTMLLanguageService){
        postMessage({type: 'worker.ok'});
    }
}

function getAllDocumentLinks(data) {
    const htmlMode = self.HTMLLanguageService.HTML_MODES[data.htmlMode];
    const links = self.HTMLLanguageService.getAllDocumentLinks(data.text, htmlMode, data.filePath);
    postMessage({type: "getAllDocumentLinks", links});
}

self.addEventListener('message', (event) => {
    console.log('Worker received: ', event);
    const command = event.data.command;
    switch (command) {
    case 'workerOK': workerOK(); break;
    case 'getAllDocumentLinks': getAllDocumentLinks(event.data); break;
    default: console.error('unknown worker command: ', command);
    }
}, false);
