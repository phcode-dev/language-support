import { StaticConfigLoader, HtmlValidate } from "html-validate/browser";

/**
 * Creates a custom HTML validator instance for the provided configuration.
 *
 * @param {object} config - The configuration object for the custom HTML validator.
 * @returns {{validateString: function}} An instance of HtmlValidate configured with the provided settings. use
 *     returnVal.validateString(text,fileName) api to validate
 */
export function createHTMLValidator(config) {
    const customConfigLoader = new StaticConfigLoader(config);
    return new HtmlValidate(customConfigLoader);
}
