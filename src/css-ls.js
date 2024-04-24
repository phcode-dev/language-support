import * as cssLangService from 'vscode-css-languageservice';

const cssService = cssLangService.getCSSLanguageService();
const lessService = cssLangService.getLESSLanguageService();
const scssService = cssLangService.getSCSSLanguageService();
export const CSS_MODES = {
    CSS: "css",
    LESS: "less",
    SCSS: "scss"
};

export const DiagnosticSeverity = {
    error: 1,
    warning: 2,
    information: 3,
    hint: 4
};

function _getLanguageServiceToUse(cssMode) {
    switch (cssMode) {
    case "less": return lessService;
    case "scss": return scssService;
    case "css": return cssService;
    default:
        console.error("Unknown language mode: ", cssMode, "passed to css language service");
        return cssService;
    }
}

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
export function getAllSymbols(text, cssMode, filePath) {
    const textDocument = getTextDocument(text, cssMode, filePath);
    const service = _getLanguageServiceToUse(cssMode);
    const stylesheet = service.parseStylesheet(textDocument);
    const output = [];
    for(let symbol of service.findDocumentSymbols(textDocument, stylesheet)) {
        output.push(symbol.name);
    }
    return output;
}

/**
 * Validates CSS code using specified settings and returns array of diagnostic messages.
 *
 * @param {string} text - The CSS code to be validated.
 * @param {string} cssMode - The CSS mode used for parsing the code.
 * @param {string} filePath - The path of the CSS file being validated.
 * @param {Object} lintSettings - The lint settings to be used for validation. Keys may include:
 * - "compatibleVendorPrefixes": Unnecessary vendor prefixes checker.
 * - "vendorPrefix": Warns on missing vendor prefixes.
 * - "duplicateProperties": Flags duplicated CSS properties.
 * - "emptyRules": Detects CSS rules that have no properties.
 * - "importStatement": Flags the use of @import within CSS files.
 * - "boxModel": Warns if CSS box model is potentially misused.
 * - "universalSelector": Warns against the use of the universal selector (*).
 * - "zeroUnits": Warns when units specification for zero values is unnecessary.
 * - "fontFaceProperties": Ensures necessary properties are included in @font-face declarations.
 * - "hexColorLength": Enforces consistency in hex color definitions.
 * - "argumentsInColorFunction": Validates arguments within color functions.
 * - "unknownProperties": Warns on unrecognized or mistyped CSS properties.
 * - "ieHack": Warns about CSS hacks for older versions of Internet Explorer.
 * - "unknownVendorSpecificProperties": Flags vendor-specific properties that might not be universally recognized.
 * - "propertyIgnoredDueToDisplay": Notifies when CSS properties are ignored due to the `display` setting of an element.
 * - "important": Warns against the excessive use of `!important`.
 * - "float": Advises on the use of `float`, recommending modern layout alternatives.
 * - "idSelector": Advises against using ID selectors for styling.
 * Each key's value can be "warning" or "error".
 *
 * @returns {Array.<{
 *     code: string,
 *     source: string,
 *     message: string,
 *     severity: number,
 *     range: {
 *         start: {
 *             line: number,
 *             character: number
 *         },
 *         end: {
 *             line: number,
 *             character: number
 *         }
 *     }
 * }>} diagnosticMessages An array of diagnostic messages produced during validation.
 */
export function validateCSS(text, cssMode, filePath, lintSettings) {
    const textDocument = getTextDocument(text, cssMode, filePath);
    const service = _getLanguageServiceToUse(cssMode);
    const stylesheet = service.parseStylesheet(textDocument);
    return  service.doValidation(textDocument, stylesheet, {
        validate: true,
        lint: lintSettings
    });
}
