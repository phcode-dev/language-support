import * as cssLangService from 'vscode-css-languageservice';

const service = cssLangService.getCSSLanguageService();
const CSS_MODES = {
    CSS: "css",
    LESS: "less",
    SCSS: "scss"
};

function getTextDocument(text, languageID, filePath = "file://placeholder.css") {
    return cssLangService.TextDocument.create(filePath, languageID, 1, text);
}

/**
 * Given a text, returns all the CSS selectors as an array.
 * @param {string} text
 * @param {string} cssMode
 * @param {string} filePath - the path will be used to figure out relative urls.
 * @return {Array[string]} all css selectors in the file as an array of strings
 */
function getAllSymbols(text, cssMode, filePath) {
    const textDocument = getTextDocument(text, cssMode, filePath);
    const stylesheet = service.parseStylesheet(textDocument);
    const output = [];
    for(let symbol of service.findDocumentSymbols(textDocument, stylesheet)) {
        output.push(symbol.name);
    }
    return output;
}

self.CSSLanguageService = {
    getAllSymbols,
    CSS_MODES
};
