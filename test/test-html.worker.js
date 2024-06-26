/* global expect*/

describe(`web worker HTML Language tests`, function () {
    let worker;
    let messageFromWorker = null;

    before(async function () {
        worker = new Worker(`html-worker-task.js`);
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

    it(`Should load HTML Language Service in worker`, async function () {
        messageFromWorker = null;
        worker.postMessage({command: `workerOK`});
        let output = await waitForWorkerMessage(`worker.ok`, 1000);
        expect(output).to.be.not.null;
    });

    it(`Should validateHTML in for file with no errors`, async function () {
        messageFromWorker = null;
        const text = await (await fetch(`test-files/html-tests/a.html`)).text();
        worker.postMessage({command: `validateHTML`, undefined, text, fileName: "a.html"});
        let output = await waitForWorkerMessage(`validateHTML`, 1000);
        expect(output.result.errorCount).to.eql(5);
        expect(output.result.results[0].filePath).to.eql("a.html");
        expect(output.result.results[0].messages.length).to.eql(5);
        expect(output.result.results[0].messages[0].message).to.eql(
            "Expected omitted end tag <link> instead of self-closing element <link/>"
        );
    });

    const files = ["a.html", "b.htm", "c.xhtml", "php.php"];
    const fileModes = ["html", "htm", "xhtml", "php"];
    for(let i=0;i<files.length; i++){
        const file = files[i];
        const fileMode = fileModes[i];
        it(`Should getAllDocumentLinks in ${file} file`, async function () {
            messageFromWorker = null;
            const text = await (await fetch(`test-files/html-tests/${file}`)).text();
            worker.postMessage({command: `getAllDocumentLinks`, text, htmlMode: fileMode, filePath: "/a.html"});
            let output = await waitForWorkerMessage(`getAllDocumentLinks`, 1000);
            const links = output.links;
            expect(links).to.deep.equal(["mystyle.css","http://domain:port/style.css",
                "file:///path/to/style.css","sub/dir/styles.less","https://domain:port/styles.less"]);
        });

        it(`Should validateHTML in ${file} file`, async function () {
            messageFromWorker = null;
            const text = await (await fetch(`test-files/html-tests/${file}`)).text();
            worker.postMessage({command: `validateHTML`, undefined, text, fileName: file});
            let output = await waitForWorkerMessage(`validateHTML`, 1000);
            expect(output.result.results[0].filePath).to.eql(file);
            let errorFound = false;
            for(let i=0;i<output.result.results[0].messages.length;i++){
                if(output.result.results[0].messages[i].message ===
                    "Expected omitted end tag <link> instead of self-closing element <link/>"){
                    errorFound = true;
                }
            }
            expect(errorFound).to.eql(true);
        });
    }
});
