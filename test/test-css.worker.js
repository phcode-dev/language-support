/* global expect*/

describe(`web worker CSS Language tests`, async function () {
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

    /**
     * // todo these tests
     * - "compatibleVendorPrefixes": Unnecessary vendor prefixes checker.
     * - "vendorPrefix": Warns on missing vendor prefixes.
     * - "universalSelector": Warns against the use of the universal selector (*).
     * - "fontFaceProperties": Ensures necessary properties are included in @font-face declarations.
     * - "hexColorLength": Enforces consistency in hex color definitions.
     * - "argumentsInColorFunction": Validates arguments within color functions.
     * - "ieHack": Warns about CSS hacks for older versions of Internet Explorer.
     * - "unknownVendorSpecificProperties": Flags vendor-specific properties that might not be universally recognized.
     * - "propertyIgnoredDueToDisplay": Notifies when CSS properties are ignored due to the `display` setting of an element.
     * - "important": Warns against the excessive use of `!important`.
     * - "float": Advises on the use of `float`, recommending modern layout alternatives.
     * - "idSelector": Advises against using ID selectors for styling.
     */

    /**
     * Best defaults to use:
     * duplicateProperties: "warning"
     * zeroUnits: "warning"
     * emptyRules: "warning"
     * unknownProperties: "warning"
     * // leave default
     * importStatement: none
     * boxModel: none
     */

    it("should validate css unknownProperties", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box {
            doesntExist: 300px;
        }`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css", lintSettings: {
                unknownProperties: "warning"
            }
        });
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["unknownProperties"]);
    });

    it("should validate css unknownProperties by default", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box {
            doesntExist: 300px;
        }`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["unknownProperties"]);
    });

    it("should validate css boxModel", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box {
            width: 300px;
            padding: 50px;
            border: 5px solid black;
        }`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css", lintSettings: {
                boxModel: "warning"
            }
        });
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["boxModel"]);
    });

    it("should not validate css boxModel by default", async function () {
        messageFromWorker = null;
        const text = `.box {
            width: 300px;
            padding: 50px;
            border: 5px solid black;
        }`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal([]);
    });

    it("should validate css zeroUnits", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box { width: 0px;}`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css", lintSettings: {
                zeroUnits: "warning"
            }
        });
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["zeroUnits"]);
    });

    it("should not validate css zeroUnits by default", async function () {
        messageFromWorker = null;
        const text = `.box { width: 0px;}`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal([]);
    });

    it("should validate css duplicateProperties", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box { color: red; color: blue; }`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css", lintSettings: {
                duplicateProperties: "warning"
            }
        });
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["duplicateProperties"]);
    });

    it("should not validate css duplicateProperties by default", async function () {
        messageFromWorker = null;
        const text = `.box { color: red; color: blue; }`;
        worker.postMessage({
            command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal([]);
    });

    it("should validate css importStatement", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `@import "a.css"`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css", lintSettings: {
            importStatement: "warning"
        }});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["importStatement"]);
    });

    it("should not validate css importStatement by default", async function () {
        messageFromWorker = null;
        const text = `@import "a.css"`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal([]);
    });

    it("should validate css emptyRules", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box {}`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css", lintSettings: {
            emptyRules: "warning"
        }});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["emptyRules"]);
    });
    it("should validate css emptyRules by default", async function () {
        const cssValidationData = await (await fetch("test-files/cssValidationData.json")).json();
        messageFromWorker = null;
        const text = `.box {}`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "CSS", filePath: "file:///c.css"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["emptyRules"]);
    });
});
