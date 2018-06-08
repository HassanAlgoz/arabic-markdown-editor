console.log('parser.js')

const eof = 0

// Tokens
const oneAstrisk = "*"      // italic
const twoAstrisks = "**"    // bold
// const threeAstrisks = "***" // italic+bold
const bang = "!"
const newline = "\n"
const linebreak = "\n\n"


// Item Types
const itemError = 0
const itemText = 1
const itemStartBold = 2
const itemEndBold = 3
const itemStartItalic = 4
const itemEndItalic = 5
const itemBang = 6
const itemEOF = 7
const itemNewline = 8
const itemLinebreak = 9

class Item {
    constructor(typ, val) {
        this.typ = typ
        this.val = val
    }

    String() {
        let typ = this.typ
        switch (this.typ) {
            case itemError: typ = "Error"; break
            case itemText: typ = "Text"; break
            case itemStartBold: typ = "StartBold"; break
            case itemEndBold: typ = "EndBold"; break
            case itemStartItalic: typ = "StartItalic"; break
            case itemEndItalic: typ = "EndItalic"; break
            case itemBang: typ = "Bang"; break
            case itemEOF: typ = "EOF"; break
        }
        return `${this.val} <${typ}>`
    }
}

class Lexer {
    constructor(input) {
        this.input = input
        this.state = this.lexText
        this.items = []
        this.start = 0
        this.pos = 0
    }

    run() {
        for(let state = this.state; state != null;) {
            state = state.call(this)
        }
    }

    emit(typ) {
        this.items.push(new Item(typ, this.input.substring(this.start, this.pos)))
        this.start = this.pos
    }

    error(msg) {
        this.items.push(new Item(itemError, 'Lex error: ' + msg))
        return null;
    }

    // Next returns the next rune in the input.
    next() {
        if (this.pos >= this.input.length) {
            return eof
        }
        this.pos++
        return this.input[this.pos]
    }
    
    // backup steps back one rune.
    // Can be called only once per call of next.
    backup() {
        this.pos--
    }

    // peek returns but does not consume
    // the next rune in the input.
    peek() {
        const r = this.next()
        this.backup()
        return r
    }

    // pop backtracks.
    pop() {
        if (this.items.length > 0) {
            let i = this.items.pop()
            this.start -= i.val.length
        }
    }


    lexText() {
        while(true) {
            const incomingText = this.input.substring(this.pos)
            if (incomingText.startsWith(twoAstrisks)) {
                this.emit(itemText)
                return this.lexStartBold

            } else if (incomingText.startsWith(oneAstrisk)) {
                this.emit(itemText)
                return this.lexStartItalic
            
            } else if (incomingText.startsWith(linebreak)) {
                this.emit(itemText)
                return this.lexLinebreak
            }
            
            const r = this.next()
            switch(r) {
                case '\n': {
                    this.emit(itemText)
                    return this.lexNewline;
                    break
                }

                case eof: {
                    this.emit(itemText)
                    return this.lexEOF;
                    break
                }
            }
        }
    }

    lexStartBold() {
        this.pos += twoAstrisks.length;
        this.emit(itemStartBold)
        return this.lexInsideBold
    }

    lexInsideBold() {
        while(true) {
            const incomingText = this.input.substring(this.pos)
            if (incomingText.startsWith(oneAstrisk)) {
                this.emit(itemText)
                return this.lexEndBold
            }
            
            const r = this.next()
            switch(r) {
                case '\n': {
                    this.pop()
                    this.emit(itemText)
                    return this.lexNewline;
                    break
                }
                case eof: {
                    this.pop()
                    this.emit(itemText)
                    return this.lexEOF;
                    break
                }
            }
        }
    }

    lexEndBold() {
        this.pos += twoAstrisks.length;
        this.emit(itemEndBold)
        return this.lexText
    }

    lexStartItalic() {
        this.pos += oneAstrisk.length;
        this.emit(itemStartItalic)
        return this.lexInsideItalic
    }

    lexInsideItalic() {
        while(true) {
            const incomingText = this.input.substring(this.pos)
            if (incomingText.startsWith(twoAstrisks)) {
                this.emit(itemText)
                return this.lexEndItalic

            }
            
            const r = this.next()
            switch(r) {
                case '\n': {
                    this.pop()
                    this.emit(itemText)
                    return this.lexNewline;
                    break
                }
                case eof: {
                    this.pop()
                    this.emit(itemText)
                    return this.lexEOF;
                    break
                }
            }
        }
    }

    lexEndItalic() {
        this.pos += oneAstrisk.length;
        this.emit(itemEndItalic)
        return this.lexText
    }

    lexNewline() {
        const r = this.peek()
        switch(r) {
            case '\n': {
                return this.lexLinebreak;
                break
            }
            
            case eof: {
                return this.lexEOF;
                break
            }

            default: {
                this.pos += newline.length;
                this.emit(itemNewline)
                return this.lexText
            }
        }
    }

    lexLinebreak() {
        this.pos += linebreak.length;
        this.emit(itemLinebreak)
        return this.lexText
    }

    lexEOF() {
        this.emit(itemEOF)
        return null
    }
}


let input = `

The quick **brown** fox jumped over the *lazy

* dog.`
// let input = `السلام عليكم **ورحمة الله** وبركاته`
const lexer = new Lexer(input)
lexer.run()
console.log(lexer.items)

let html = "";
lexer.items.forEach(item => {
    switch (item.typ) {
        case itemText: {
            html += item.val
            break
        }

        case itemStartBold: {
            html += "<b>"
            break
        }
        case itemEndBold: {
            html += "</b>"
            break
        }

        case itemStartItalic: {
            html += "<i>"
            break
        }
        case itemEndItalic: {
            html += "</i>"
            break
        }
    }
})
console.log(html)
// for (let i = 0; i < lexer.items.length; i++) {
// }
// for(let i = 2; i < lexer.items.length - 2; i++) {
//     let [a, b, c] = [lexer.items[i-2].typ, lexer.items[i-1].typ, lexer.items[i].typ]
//     if (b === itemText) {
//         if (a === itemStartAstrisk && c === itemStartAstrisk) {
            
//         }
//     }
// }