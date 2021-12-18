const Constants = require("./js/constants");

async function translate(text, opts = {}) {
    // default languages
    const source = 'en' || opts.source;
    const target = 'ru' || opts.target;

    // Use the free google translate API (no API key required)
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl='
        + source + "&tl=" + target + "&dt=t&q=" + encodeURI(text);

    // Parse google's sparse array json, by inserting null values
    const parseJSON = txt => JSON.parse(txt.split(',').map(x => x || 'null').join(','));

    // Join the snippets from google translate
    const joinSnippets = json => json[0].map(x => x[0]).join('');

    // fetch the translation from google and extract it
    return fetch(url)
        .then(res => res.text())
        .then(text => joinSnippets(parseJSON(text)))
        .catch(reason => console.log('Google Translate: ' + reason))

}

chrome.runtime.onMessage.addListener(
    async function (message) {
        if (message.type === Constants.GET_TRANSLATE) {
            const text = await translate(message.text);
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: Constants.PRINT_TRANSLATE,
                    text: text
                });
            });
        }
        return true;
    }
);
