console.log('main.js')
const converter = new showdown.Converter()

const app = new Vue({
	el: '#app',

	data: {
		code: "السلام",
		capsLock: null,
	},

	created() {
	},

	methods: {
		insertLink() {
			this.wrapSelected(['[', ']()'])
		},
		insertParenthesis() {
			this.wrapSelected(['(', ')'])
		},
		insertBrackets() {
			this.wrapSelected(['[', ']'])
		},
		insertCurlyBrackets() {
			this.wrapSelected(['{', '}'])
		},
		insertImage() {
			this.wrapSelected(['![', ']()'])
		},
		insertCode() {
			this.wrapSelected(['```\n', '\n```'])
		},
		insertBold() {
			this.wrapSelected(['**', '**'])
		},
		insertItalic() {
			this.wrapSelected(['_', '_'])
		},
		wrapSelected([A, B]) {
			let [start, end] = [$code.selectionStart, $code.selectionEnd];
			let selectedText = this.code.substring(start, end);
			let text = `${A}${selectedText}${B}`
			document.execCommand('insertText', false, text)
			let offset = A.length
			$code.selectionStart = start + offset;
			$code.selectionEnd = end + offset;
			console.log("wrapSelected", text);
		},

		indent(evt) {
			console.log('indent')
			document.execCommand('insertText', false, '\t')
		},
		outdent(evt) {
			console.log('outdent')
			document.execCommand('outdent')
		},

		saveText() {
			const text = this.code;
			const fname = "saved.md"
			const blob = new Blob([text], { type: 'text/plain' });
			if (window.saveAs) {
			  window.saveAs(blob, fname);
			} else if (navigator.saveBlob) {
			  navigator.saveBlob(blob, fname);
			} else {
			  url = URL.createObjectURL(blob);
			  const link = document.createElement("a");
			  link.setAttribute("href",url);
			  link.setAttribute("download",fname);
			  const event = document.createEvent('MouseEvents');
			  event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
			  link.dispatchEvent(event);
			}
		}
	},

	computed: {
		preview() {
			return converter.makeHtml(this.code)
		},

		lineNumbers() {
			let numbers = [1];
			for(let i = 0; i < this.code.length; i++) {
				if (this.code[i] === '\n') {
					numbers.push(numbers.length + 1)
				}
			}
			// return numbers.join("<br/>")
			// return numbers.join("\n")
			return numbers.map(convertDigits2Arabic).join("<br/>")
		},

		length() {
			return this.code.length;
		},
	}
	
})


// HTML Elements
let $lineNumbers;
let $code;
function initDocumentElements() {
	$lineNumbers = document.getElementById('lineNumbers')
	$code = document.getElementById('code');
}

const KEYS = {
	RIGHT_PAREN: 40, /* ) */
	RIGHT_BRACKET: 91, /* ] */
	RIGHT_CURLY: 123, /* } */
	S: 83,
}

function keypress(evt) {
	const keyCode = evt.keyCode;
	
	switch(keyCode) {

		case KEYS.RIGHT_PAREN: {
			evt.preventDefault();
			app.insertParenthesis()
			return false;
		} break;

		case KEYS.RIGHT_BRACKET: {
			evt.preventDefault();
			app.insertBrackets()
			return false;
		} break;

		case KEYS.RIGHT_CURLY: {
			evt.preventDefault();
			app.insertCurlyBrackets()
			return false;
		} break;
	}
	
	// Print Arabic digits instead of English digits
	// if (keyCode >= 0x30 && keyCode <= 0x39) {
	// 	evt.preventDefault();
	// 	const num = String.fromCodePoint((keyCode - 0x30) + 0x0660);
	// 	console.log(num)
	// 	document.execCommand('insertText', false, num)
	// }
}

function keyup(evt) {
	// Dot Separation of characters when capsLock is on.
	// let text = app.code
	// let codePoint = evt.key.codePointAt(0);
	// let prevCodePoint = text.codePointAt(text.length - 2);
	// console.log(`${prevCodePoint}=${String.fromCodePoint(prevCodePoint)}`, `${codePoint}=${String.fromCodePoint(codePoint)}`)
	// if (app.capsLock && isAlphaArabic(codePoint) && isAlphaArabic(prevCodePoint)) {
	// 	app.code = text.substring(0, text.length - 1) + '.' + text.charAt(text.length - 1)
	// }
}

function isAlphaArabic(codePoint) {
	// From Aliph to Yaa' excluding "Tatweel" letter.
	return (codePoint >= 0x620 && codePoint <= 0x64A && codePoint !== 0x640)
}

document.addEventListener('keydown', (evt) => {
	// Update CapsLock state
	app.capsLock = evt.getModifierState('CapsLock')

	// Ctrl + S: Saves (and downloads) markdown in ".md" format
	if (evt.keyCode == KEYS.S && (evt.ctrlKey || evt.metaKey)) {
		evt.preventDefault();
		app.saveText()
		return false;
	}
})

function convertDigits2Arabic(str) {
	str = str + '' // convert to string (if number)
	return str.replace(/0/g, '\u0660')
	.replace(/1/g, '\u0661')
	.replace(/2/g, '\u0662')
	.replace(/3/g, '\u0663')
	.replace(/4/g, '\u0664')
	.replace(/5/g, '\u0665')
	.replace(/6/g, '\u0666')
	.replace(/7/g, '\u0667')
	.replace(/8/g, '\u0668')
	.replace(/9/g, '\u0669')
}

function dragAndDrop(callback) {
	// Prevent browser from viewing the file as a page upon dropping it accidentally outside the dropbox borders
	window.URL = window.URL || window.webkitURL
	window.addEventListener("dragenter", (e) => { e.preventDefault() });
	window.addEventListener("dragover", (e) => { e.preventDefault() });
	window.addEventListener("drop", (e) => { e.preventDefault() });
	// Dropping a text.md file loads it.
	document.addEventListener('drop', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		callback(evt)
	}, false);
}
// Load Text File
dragAndDrop(evt => {
	const reader = new FileReader();
	reader.onload = function(evt) {
		app.code = evt.target.result
	};
	console.log(evt.dataTransfer.files[0])
	reader.readAsText(evt.dataTransfer.files[0]);
})

window.addEventListener('load', () => {
	initDocumentElements()	
	// bind text area with num of lines column (y-scrolling)
	$code.addEventListener('scroll', (evt) => {
		$lineNumbers.scrollTop = $code.scrollTop;
	})
})