/* global expect*/

describe(`web worker CSS Language tests`, function () {
    let worker;
    let messageFromWorker = null;

    before(async function () {
        worker = new Worker(`css-worker-task.js`);
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
                if(messageFromWorker && messageFromWorker.type === message){
                    resolve(messageFromWorker);
                    clearInterval(interVal);
                }
                let elapsedTime = Date.now() - startTime;
                if(elapsedTime > timeoutMs){
                    resolve(null);
                    clearInterval(interVal);
                }
            }
            interVal = setInterval(checkMessage, 10);
        });
    }

    it(`Should load CSS Language Service in worker`, async function () {
        messageFromWorker = null;
        worker.postMessage({command: `workerOK`});
        let output = await waitForWorkerMessage(`worker.ok`, 1000);
        expect(output).to.be.not.null;
    });

    it(`Should getAllSymbols get all css selectors`, async function () {
        messageFromWorker = null;
        const text = await (await fetch("test-files/css-tests/a.css")).text();
        worker.postMessage({command: `getAllSymbols`, text, cssMode: "CSS", filePath: "file:///a.css"});
        let output = await waitForWorkerMessage(`getAllSymbols`, 1000);
        const symbols = output.symbols;
        expect(symbols.length).to.eql(29);
        expect(symbols.includes(".testClass")).to.be.true;
        expect(symbols.includes("@keyframes shooting")).to.be.true;
    });

    it(`Should getAllSymbols get all less selectors`, async function () {
        messageFromWorker = null;
        const text = await (await fetch("test-files/css-tests/b.less")).text();
        worker.postMessage({command: `getAllSymbols`, text, cssMode: "LESS", filePath: "file:///b.less"});
        let output = await waitForWorkerMessage(`getAllSymbols`, 1000);
        const symbols = output.symbols;
        expect(symbols).to.deep.equal(["#header",".navigation",".logo","& .phcode"]);
    });

    it(`Should getAllSymbols get all scss selectors`, async function () {
        messageFromWorker = null;
        const text = await (await fetch("test-files/css-tests/c.scss")).text();
        worker.postMessage({command: `getAllSymbols`, text, cssMode: "SCSS", filePath: "file:///c.scss"});
        let output = await waitForWorkerMessage(`getAllSymbols`, 1000);
        const symbols = output.symbols;
        expect(symbols).to.deep.equal(['.info', '.alert', '#success']);
    });
});
