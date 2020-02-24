/*
На данный момент не поддерживается:
	1. Множественное выделение.
	2. Выборочное выделение в блоке-подсказке. Будет работать в будущем при зажатой клавише Ctrl
*/

let translatorsURL = {
	"deepL": "https://www.deepl.com/translator",
};

let tagsClass = {
	"original": "",
	"translate": "lmt__translations_as_text__text_btn"
};

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
	if (sel) {
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
	return { x: x, y: y };
}

// Лучше класс, а не id, так как в будущем планируется поддержка множественного выделения
let translateBlockClassName = "translate-so-easy-dialog";
let maxQuantityOfLettersForBigFontSize = 100; // Лучше потом переделать в количество слов?
let bigFontSize = 16;
let borderShift = 10;

// Поддержка множественного удаления. Пригодится, когда будет реализовано множественное выделение
function removeAllBlocks() {
	let blocks = document.getElementsByClassName(translateBlockClassName);
	for (let i = 0; i < blocks.length; i++) {
		blocks[i].remove();
	}
}

document.onmouseup = function() {
	if (event.target.className !== translateBlockClassName) {
		let selectionString = window.getSelection().toString();
		if (selectionString.replace(/\s+/g,'') !== "") {
			let div = document.createElement('div');
			let coords = getSelectionCoords();
			console.log(coords.x + ", " + coords.y);
			let selectionStringWithTags = selectionString.replace(/</g, "&lt;").replace(/>/g, "&gt;");

			div.innerHTML = selectionStringWithTags;
			div.className = translateBlockClassName;
			if (selectionString.length <= maxQuantityOfLettersForBigFontSize) 
				div.style.fontSize = bigFontSize + "px";
			div.style.left = coords.x + "px";
			div.style.top = coords.y + "px";
			document.body.append(div);
		}
	}
}

document.onmousedown = function() {
	if (event.target.className !== translateBlockClassName) {
		document.getSelection().removeAllRanges(); // Очистить текущее выделение, если оно существует
		removeAllBlocks();
	}
}