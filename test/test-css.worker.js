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
        expect(symbols).to.deep.equal(["theme", '.info', '.alert', '#success']);
    });

    /**
     * // todo these tests
     * - "compatibleVendorPrefixes": Unnecessary vendor prefixes checker.
     * - "vendorPrefix": Warns on missing vendor prefixes.
     * - "universalSelector": Warns against the use of the universal selector (*).
     * - "hexColorLength": Enforces consistency in hex color definitions.
     * - "argumentsInColorFunction": Validates arguments within color functions. -- this doesnt work/vscode bug likely
     * - "float": Advises on the use of `float`, recommending modern layout alternatives.
     * - "idSelector": Advises against using ID selectors for styling.
     */

    /**
     * Best defaults to use:
     * duplicateProperties: "warning"
     * zeroUnits: "warning"
     * emptyRules: "warning"
     * unknownProperties: "warning"
     * ieHack: "warning"
     * propertyIgnoredDueToDisplay: "warning"
     * fontFaceProperties: "warning"
     * unknownVendorSpecificProperties: "warning"
     * // leave default
     * importStatement: none
     * boxModel: none
     * important: none
     */

    const CSS_MODES = ["CSS", "LESS", "SCSS"];
    for(let css of CSS_MODES){
        it(`should validate ${css} unknownVendorSpecificProperties`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `div {
            -microsoft-border-radius: 5px;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    unknownVendorSpecificProperties: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["unknownVendorSpecificProperties"]);
        });

        it(`should validate ${css} fontFaceProperties`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `@font-face {
            font-family: 'MyFont';
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    fontFaceProperties: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["fontFaceProperties"]);
        });

        it(`should validate ${css} fontFaceProperties by default`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `@font-face {
            font-family: 'MyFont';
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["fontFaceProperties"]);
        });

        it(`should not validate ${css} important by default`, async function () {
            messageFromWorker = null;
            const text = `.element {
            width: 0 !important;
            height: 0 !important;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal([]);
        });

        it(`should validate ${css} propertyIgnoredDueToDisplay`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.element {
            display: inline-block;
            float: right;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    propertyIgnoredDueToDisplay: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["propertyIgnoredDueToDisplay"]);
        });

        it(`should validate ${css} propertyIgnoredDueToDisplay by default`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.element {
            display: inline-block;
            float: right;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["propertyIgnoredDueToDisplay"]);
        });

        it(`should validate ${css} ieHack`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.myClass {
            color: blue; /* For modern browsers */
            _color: red; /* This color is only for IE 6 and below */
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    ieHack: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["ieHack"]);
        });

        it(`should validate ${css} ieHack by default`, async function () {
            messageFromWorker = null;
            const text = `.myClass {
            color: blue; /* For modern browsers */
            _color: red; /* This color is only for IE 6 and below */
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal([]);
        });

        it(`should validate ${css} unknownProperties`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box {
            doesntExist: 300px;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    unknownProperties: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["unknownProperties"]);
        });

        it(`should validate ${css} unknownProperties by default`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box {
            doesntExist: 300px;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["unknownProperties"]);
        });

        it(`should validate ${css} boxModel`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box {
            width: 300px;
            padding: 50px;
            border: 5px solid black;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    boxModel: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["boxModel"]);
        });

        it(`should not validate ${css} boxModel by default`, async function () {
            messageFromWorker = null;
            const text = `.box {
            width: 300px;
            padding: 50px;
            border: 5px solid black;
        }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal([]);
        });

        it(`should validate ${css} zeroUnits`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box { width: 0px;}`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    zeroUnits: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["zeroUnits"]);
        });

        it(`should not validate ${css} zeroUnits by default`, async function () {
            messageFromWorker = null;
            const text = `.box { width: 0px;}`;
            worker.postMessage({command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal([]);
        });

        it(`should validate ${css} duplicateProperties`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box { color: red; color: blue; }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                    duplicateProperties: "warning"
                }
            });
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["duplicateProperties"]);
        });

        it(`should not validate ${css} duplicateProperties by default`, async function () {
            messageFromWorker = null;
            const text = `.box { color: red; color: blue; }`;
            worker.postMessage({
                command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal([]);
        });

        it(`should validate ${css} importStatement`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `@import "a.css"`;
            worker.postMessage({command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                importStatement: "warning"
            }});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["importStatement"]);
        });

        it(`should not validate ${css} importStatement by default`, async function () {
            messageFromWorker = null;
            const text = `@import "a.css"`;
            worker.postMessage({command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal([]);
        });

        it(`should validate ${css} emptyRules`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box {}`;
            worker.postMessage({command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`, lintSettings: {
                emptyRules: "warning"
            }});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["emptyRules"]);
        });
        it(`should validate ${css} emptyRules by default`, async function () {
            const cssValidationData = await (await fetch(`test-files/${css}ValidationData.json`)).json();
            messageFromWorker = null;
            const text = `.box {}`;
            worker.postMessage({command: `validateCSS`, text, cssMode: css, filePath: `file:///c.${css}`});
            let output = await waitForWorkerMessage(`validateCSS`, 1000);
            const symbols = output.diag;
            expect(symbols).to.deep.equal(cssValidationData["emptyRules"]);
        });

    }

    it("should validate less emptyRules by default", async function () {
        const cssValidationData = await (await fetch("test-files/CSSValidationData.json")).json();
        messageFromWorker = null;
        const text = `// less supports comments\n.box {}`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "LESS", filePath: "file:///c.less"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["emptyRulesLESS"]);
    });

    it("should validate scss emptyRules by default", async function () {
        const cssValidationData = await (await fetch("test-files/CSSValidationData.json")).json();
        messageFromWorker = null;
        const text = `// less supports comments\n.box {}`;
        worker.postMessage({command: `validateCSS`, text, cssMode: "SCSS", filePath: "file:///c.scss"});
        let output = await waitForWorkerMessage(`validateCSS`, 1000);
        const symbols = output.diag;
        expect(symbols).to.deep.equal(cssValidationData["emptyRulesSCSS"]);
    });
});
