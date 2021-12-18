/*
На данный момент не поддерживается:
	1. Множественное выделение.
	2. Выборочное выделение в блоке-подсказке. Будет работать в будущем при зажатой клавише Ctrl
*/

/*
На данный имеются баги:
	1. При выделении иногда появляются невидимые элементы без текста, из-за чего координата X блока
	с переводом может приобретатьнеожиданные значения. Нужно как-то обеспечить игнорирование блоков,
	которые не содержат текст.
*/

const Constants = require("./constants");

function getBlockXY(rects) {
    let rect = rects[0];
    let minX = rect.left;
    let maxY = rect.bottom;
    for (let i = 1; i < rects.length; i++) {
        rect = rects[i];
        let currentX = rect.left;
        let currentY = rect.bottom;
        if (currentX < minX) {
            minX = currentX;
        }
        if (currentY > maxY) {
            maxY = currentY;
        }
    }
    if (minX < 0) minX = borderShift;
    if (maxY < 0) maxY = borderShift; // Эта строка, возможно, лишняя
    return {x: minX + pageXOffset, y: maxY + pageYOffset};
}

function getSelectionCoords() {
    let sel = document.selection, range;
    let x = 0, y = 0;
    if (sel) { // Есть ли необходимость в данном if-блоке?
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(false);
            x = range.boundingLeft;
            y = range.boundingBottom;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                let rects = range.getClientRects();
                return getBlockXY(rects);
            }
        }
    }
    return {x: x, y: y};
}

// Лучше класс, а не id, так как в будущем планируется поддержка множественного выделения
const translateBlockClassName = "translate-so-easy-dialog";
const maxQuantityOfLettersForBigFontSize = 100; // Лучше потом переделать в количество слов?
const bigFontSize = 16;
const borderShift = 10;

// Поддержка множественного удаления. Пригодится, когда будет реализовано множественное выделение
function removeAllBlocks() {
    let blocks = document.getElementsByClassName(translateBlockClassName);
    for (let i = 0; i < blocks.length; i++) {
        blocks[i].remove();
    }
}

function getTranslate(text) {
    chrome.runtime.sendMessage({
        type: Constants.GET_TRANSLATE,
        text: text
    });
}

document.onmouseup = function () {
    if (event.target.className !== translateBlockClassName) {
        let selectionString = window.getSelection().toString();
        if (selectionString.replace(/\s+/g, '') !== "") {
            getTranslate(selectionString);
        }
    }
}

document.onmousedown = function () {
    if (event.target.className !== translateBlockClassName) {
        document.getSelection().removeAllRanges(); // Очистить текущее выделение, если оно существует
        removeAllBlocks();
    }
}

function createTranslateBlock(text) {
    let div = document.createElement('div');
    let coords = getSelectionCoords();
    // console.log(coords.x + ", " + coords.y);
    let selectionStringWithTags = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    div.innerHTML = selectionStringWithTags;
    div.className = translateBlockClassName;
    if (text.length <= maxQuantityOfLettersForBigFontSize) {
        div.style.fontSize = bigFontSize + "px";
    }
    div.style.left = coords.x + "px";
    div.style.top = coords.y + "px";
    document.body.append(div);
    console.log(text);
}

chrome.runtime.onMessage.addListener(
    function (message) {
        if (message.type === Constants.PRINT_TRANSLATE) {
            createTranslateBlock(message.text);
        }
        return true;
    }
);
