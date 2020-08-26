Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("./Enum");
const Token_1 = require("./Token");
const fs = require('fs');
const keyWords = [
    'class',
    'constructor',
    'function',
    'method',
    'field',
    'static',
    'var',
    'int',
    'char',
    'boolean',
    'void',
    'true',
    'false',
    'null',
    'this',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return',
];
const symbols = [
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    '.',
    ',',
    ';',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '<',
    '>',
    '=',
    '~',
];
class JackTokenizer {
    constructor(fileName) {
        let fileData = fs.readFileSync(`${fileName}`).toString();
        fileData = JackTokenizer.trim(fileData);
        this.tokens = JackTokenizer.readTokens(fileData);
    }
    static trim(str) {
        // remove comment
        str = str.replace(/\/\/.*?[\n|\r|\n\r]/g, '');
        str = str.replace(/\/\*[\s\S]*?\*\//g, '');
        str = str.replace(/\s{2,}/g, ' ');
        str = str.replace(/^\s/g, '');
        str = str.replace(/\s$/g, '');
        return str;
    }
    static readTokens(text) {
        const tokens = [];
        while (text.length > 0) {
            const first = text.substring(0, 1);
            text = text.substring(1);
            if (first === '\n' || first === ' ') {
                continue;
            }
            if (JackTokenizer.isSymbol(first)) {
                tokens.push(new Token_1.default(Enum_1.TokenType.SYMBOL, first));
                continue;
            }
            if (first === '"') { // start STRING_CONST
                let chunk = '';
                let current = text.substr(0, 1);
                while (text.length > 0
                    && current !== '"') {
                    chunk += current;
                    text = text.substring(1);
                    current = text.substr(0, 1);
                }
                text = text.substring(1); // remove "
                tokens.push(new Token_1.default(Enum_1.TokenType.STRING_CONST, chunk));
                continue;
            }
            // else read more
            let chunk = first;
            let peek = text.substr(0, 1);
            while (text.length > 0
                && !JackTokenizer.isSymbol(peek)
                && peek !== '\n'
                && peek !== ' ') {
                chunk += peek;
                text = text.substring(1);
                peek = text.substr(0, 1);
            }
            if (JackTokenizer.isNumber(chunk)) {
                tokens.push(new Token_1.default(Enum_1.TokenType.INT_CONST, chunk));
            }
            else if (JackTokenizer.isKeyword(chunk)) {
                tokens.push(new Token_1.default(Enum_1.TokenType.KEYWORD, chunk));
            }
            else {
                tokens.push(new Token_1.default(Enum_1.TokenType.IDENTIFIER, chunk));
            }
            continue;
        }
        return tokens;
    }
    static isNumber(str) {
        return !Number.isNaN(Number(str));
    }
    static isKeyword(str) {
        if (keyWords.includes(str)) {
            return true;
        }
        return false;
    }
    static isSymbol(str) {
        if (symbols.includes(str)) {
            return true;
        }
        return false;
    }
    printTokens() {
        for (const token of this.tokens) {
            console.log(`${token.type}: ${token.value}`);
        }
    }
    hasMoreTokens() {
        if (this.tokens.length === 0) {
            return false;
        }
        return true;
    }
    advance() {
        this.tokens.shift();
    }
    peek(index) {
        return this.tokens[index].value;
    }
    tokenType() {
        return this.tokens[0].type;
    }
    keyWord() {
        const token = this.tokens[0];
        if (token.type !== Enum_1.TokenType.KEYWORD) {
            throw new Error(`This token is not KEYWORD: ${token.value}`);
        }
        return token.value;
    }
    symbol() {
        const token = this.tokens[0];
        if (token.type !== Enum_1.TokenType.SYMBOL) {
            throw new Error(`This token is not SYMBOL: ${token.value}`);
        }
        return token.value;
    }
    identifier() {
        const token = this.tokens[0];
        if (token.type !== Enum_1.TokenType.IDENTIFIER) {
            throw new Error(`This token is not IDENTIFIER: ${token.value}`);
        }
        return token.value;
    }
    intVal() {
        const token = this.tokens[0];
        if (token.type !== Enum_1.TokenType.INT_CONST) {
            throw new Error(`This token is not INT_CONST: ${token.value}`);
        }
        return Number(token.value);
    }
    stringVal() {
        const token = this.tokens[0];
        if (token.type !== Enum_1.TokenType.STRING_CONST) {
            throw new Error(`This token is not STRING_CONST: ${token.value}`);
        }
        return token.value;
    }
}
exports.default = JackTokenizer;
