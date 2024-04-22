import {getAllSymbols, CSS_MODES} from "./css-ls";
import {HTML_MODES, getAllDocumentLinks} from "./html-ls";

self.CSSLanguageService = {
    getAllSymbols,
    CSS_MODES
};

self.HTMLLanguageService = {
    getAllDocumentLinks,
    HTML_MODES
};