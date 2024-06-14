import {getAllSymbols, CSS_MODES, validateCSS, DiagnosticSeverity} from "./css-ls";
import {HTML_MODES, getAllDocumentLinks} from "./html-ls";
import {createHTMLValidator} from "./html-validate";

self.CSSLanguageService = {
    getAllSymbols,
    validateCSS,
    CSS_MODES,
    DiagnosticSeverity
};

self.HTMLLanguageService = {
    createHTMLValidator,
    getAllDocumentLinks,
    HTML_MODES
};