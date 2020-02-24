//alert("Hello World!");

var translatorsURL = {
	"deepL": "https://www.deepl.com/translator",
};

var tagsClass = {
	"original": "",
	"translate": "lmt__translations_as_text__text_btn"
};

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
				range.collapse(true);
				let rect = range.getClientRects()[0];
				console.log(rect);
				x = rect.left + pageXOffset;
				y = rect.bottom + pageYOffset;
			}
		}
	}
	return { x: x, y: y };
}

var translateBlockClassName = "translate-so-easy-dialog";

function removeAllBlocks() {
	let blocks = document.getElementsByClassName(translateBlockClassName);
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].remove();
	}
}

document.onmouseup = function() {
	removeAllBlocks();
	let selectionString = window.getSelection().toString();
	if (selectionString.replace(/\s+/g,'') !== "") {
		let div = document.createElement('div');
		div.className = translateBlockClassName;
		let selectionStringWithTags = selectionString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		div.innerHTML = selectionStringWithTags;
		let coords = getSelectionCoords();
		console.log(coords.x + ", " + coords.y);
		div.style.left = coords.x + "px";
		div.style.top = coords.y + "px";
		document.body.append(div);
	}
}