import {getAllSymbols, CSS_MODES, validateCSS, DiagnosticSeverity} from "./css-ls";
import {HTML_MODES, getAllDocumentLinks} from "./html-ls";

self.CSSLanguageService = {
    getAllSymbols,
    validateCSS,
    CSS_MODES,
    DiagnosticSeverity
};

self.HTMLLanguageService = {
    getAllDocumentLinks,
    HTML_MODES,
};