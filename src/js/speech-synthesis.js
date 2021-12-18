function getVoice(voice) {
    for (let v of window.speechSynthesis.getVoices()) {
        if (v.name.toUpperCase() === voice.toUpperCase()) {
            return v.name;
        } else if (v.lang.toUpperCase() === voice.toUpperCase()) {
            return v.lang;
        }
    }
    return 'en-US';
}

function speech(msg, voiceType) {
    const person = new SpeechSynthesisUtterance(msg);
    person.lang = getVoice(voiceType);
    window.speechSynthesis.speak(person);
}


speech.names = window.speechSynthesis.getVoices()
    .map(function (s) {
        return s.name;
    });

speech.langs = window.speechSynthesis.getVoices()
    .map(function (s) {
        return s.lang;
    }).reduce(function (prev, cur) {
        return (prev.indexOf(cur) < 0) ? prev.concat([cur]) : prev;
    }, []);

module.exports = speech;