/* global expect*/

describe(`web worker CSS Language tests`, function () {
    let worker;
    let messageFromWorker = null;

    before(async function () {
        worker = new Worker(`worker-task.js?debug=true`);
        console.log(worker);
        worker.onmessage= function (event) {
            console.log(`From Worker:`, event);
            messageFromWorker = event.data;
        };
    });

    after(async function () {
    });

    beforeEach(async function () {
    });

    async function waitForWorkerMessage(message, timeoutMs) {
        let startTime = Date.now();
        return new Promise((resolve)=>{
            let interVal;
            function checkMessage() {
                if(messageFromWorker === message){
                    resolve(true);
                    clearInterval(interVal);
                }
                let elapsedTime = Date.now() - startTime;
                if(elapsedTime > timeoutMs){
                    resolve(false);
                    clearInterval(interVal);
                }
            }
            interVal = setInterval(checkMessage, 10);
        });
    }

    it(`Should load CSS Language Service in worker`, async function () {
        messageFromWorker = null;
        worker.postMessage({command: `workerOK`});
        let status = await waitForWorkerMessage(`worker.ok`, 1000);
        expect(status).to.be.true;
    });
});
