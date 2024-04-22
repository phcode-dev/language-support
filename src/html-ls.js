import * as htmlLangService from 'vscode-html-languageservice';

const service = htmlLangService.getLanguageService();
export const HTML_MODES = {
    HTML: "html",
    XHTML: "xhtml",
    HTM: "htm",
    PHP: "php",
};

function getTextDocument(text, languageID, filePath = "file:///placeholder.html") {
    return htmlLangService.TextDocument.create(filePath, languageID, 1, text);
}

// Properly setup DocumentContext with resolveReference function
function getLocalLinkDocumentContext() {
    return {
        resolveReference: (ref) => { // the second argument base is unused, base is the textDocument url
            // we return the links as i, won't resolve relative to the text document base
            return ref;
        }
    };
}

/**
 * Given a text, returns all links in the file as an array of strings
 * @param {string} text
 * @param {string} htmlMode
 * @param {string} filePath - the path will be used to figure out relative urls.
 * @return {Array[string]} all file links in the file as an array of strings
 */
export function getAllDocumentLinks(text, htmlMode, filePath) {
    const textDocument = getTextDocument(text, htmlMode, filePath);
    const documentContext = getLocalLinkDocumentContext(); // textDocument.uri
    const documentLinks = service.findDocumentLinks(textDocument, documentContext);
    const linksArray = [];
    for(let link of documentLinks){
        if(link.target){
            linksArray.push(link.target);
        }
    }
    return linksArray;
}
