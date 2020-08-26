Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("./Enum");
const fs = require('fs');
class CompilationEngine {
    constructor(tokenizer, fileName) {
        this.tokenizer = tokenizer;
        this.fileName = fileName;
    }
    compileClass() {
        this.printOpenTag('class');
        this.useKeyWord('class');
        this.useIdentifier();
        this.useSymbol('{');
        if (['static', 'field'].includes(this.tokenizer.peek(0))) {
            this.compileClassVarDec();
        }
        if (['constructor', 'function', 'method'].includes(this.tokenizer.peek(0))) {
            this.compileSubroutine();
        }
        this.useSymbol('}');
        this.printCloseTag('class');
    }
    compileClassVarDec() {
        while (['static', 'field'].includes(this.tokenizer.peek(0))) {
            this.printOpenTag('classVarDec');
            this.useKeyWord(this.tokenizer.keyWord()); // static, field
            this.compileType();
            // var name
            this.useIdentifier();
            while (this.tokenizer.peek(0) === ',') {
                this.useSymbol(',');
                this.useIdentifier();
            }
            this.useSymbol(';');
            this.printCloseTag('classVarDec');
        }
    }
    compileSubroutine() {
        while (['constructor', 'function', 'method'].includes(this.tokenizer.peek(0))) {
            this.printOpenTag('subroutineDec');
            this.useKeyWord(this.tokenizer.keyWord());
            if (this.tokenizer.tokenType() === Enum_1.TokenType.KEYWORD) {
                this.useKeyWord('void');
            }
            else {
                this.useIdentifier();
            }
            this.useIdentifier(); // subrounie name
            this.useSymbol('(');
            this.compileParameterList();
            this.useSymbol(')');
            this.printOpenTag('subroutineBody');
            this.useSymbol('{');
            while (this.tokenizer.peek(0) === 'var') {
                this.compileVarDec();
            }
            this.compileStatements();
            this.useSymbol('}');
            this.printCloseTag('subroutineBody');
            this.printCloseTag('subroutineDec');
        }
    }
    compileType() {
        if (this.tokenizer.tokenType() === Enum_1.TokenType.KEYWORD) { // int, char, boolean
            this.useKeyWord(this.tokenizer.keyWord());
        }
        else if (this.tokenizer.tokenType() === Enum_1.TokenType.IDENTIFIER) { // className
            this.useIdentifier();
        }
    }
    compileParameterList() {
        this.printOpenTag('parameterList');
        if (this.tokenizer.peek(0) === ')') {
            this.printCloseTag('parameterList');
            return;
        }
        this.compileType();
        this.useIdentifier();
        while (this.tokenizer.peek(0) !== ')') {
            this.useSymbol(',');
            this.compileType();
            this.useIdentifier();
        }
        this.printCloseTag('parameterList');
    }
    compileVarDec() {
        this.printOpenTag('varDec');
        this.useKeyWord('var');
        this.compileType();
        this.useIdentifier();
        while (this.tokenizer.peek(0) === ',') {
            this.useSymbol(',');
            this.useIdentifier();
        }
        this.useSymbol(';');
        this.printCloseTag('varDec');
    }
    compileStatements() {
        this.printOpenTag('statements');
        this.compileStatement();
        this.printCloseTag('statements');
    }
    compileStatement() {
        switch (this.tokenizer.keyWord()) {
            case 'let':
                this.compileLet();
                break;
            case 'if':
                this.compileIf();
                break;
            case 'while':
                this.compileWhile();
                break;
            case 'do':
                this.compileDo();
                break;
            case 'return':
                this.compileReturn();
                break;
            default:
                throw new Error(`Unexpected Statement ${this.tokenizer.keyWord()}`);
        }
        if (this.tokenizer.tokenType() === Enum_1.TokenType.KEYWORD) {
            this.compileStatement();
        }
    }
    compileDo() {
        this.printOpenTag('doStatement');
        this.useKeyWord('do');
        this.compileSubroutineCall();
        this.useSymbol(';');
        this.printCloseTag('doStatement');
    }
    compileSubroutineCall() {
        if (this.tokenizer.peek(1) === '.') { // xxx.fn();
            this.useIdentifier();
            this.useSymbol('.');
        }
        this.useIdentifier(); // subroutineName
        this.useSymbol('(');
        this.compileExpressionList();
        this.useSymbol(')');
    }
    compileLet() {
        this.printOpenTag('letStatement');
        this.useKeyWord('let');
        this.useIdentifier();
        // if array
        if (this.tokenizer.peek(0) === '[') {
            this.useSymbol('[');
            this.compileExpression();
            this.useSymbol(']');
        }
        this.useSymbol('=');
        this.compileExpression();
        this.useSymbol(';');
        this.printCloseTag('letStatement');
    }
    compileWhile() {
        this.printOpenTag('whileStatement');
        this.useKeyWord('while');
        this.useSymbol('(');
        this.compileExpression();
        this.useSymbol(')');
        this.useSymbol('{');
        this.compileStatements();
        this.useSymbol('}');
        this.printCloseTag('whileStatement');
    }
    compileReturn() {
        this.printOpenTag('returnStatement');
        this.useKeyWord('return');
        if (this.tokenizer.peek(0) !== ';') {
            this.compileExpression();
        }
        this.useSymbol(';');
        this.printCloseTag('returnStatement');
    }
    compileIf() {
        this.printOpenTag('ifStatement');
        this.useKeyWord('if');
        this.useSymbol('(');
        this.compileExpression();
        this.useSymbol(')');
        this.useSymbol('{');
        this.compileStatements();
        this.useSymbol('}');
        if (this.tokenizer.peek(0) === 'else') {
            this.useKeyWord('else');
            this.useSymbol('{');
            this.compileStatements();
            this.useSymbol('}');
        }
        this.printCloseTag('ifStatement');
    }
    compileExpression() {
        this.printOpenTag('expression');
        this.compileTerm();
        while (this.isOperator(this.tokenizer.peek(0))) {
            this.useSymbol(this.tokenizer.symbol());
            this.compileTerm();
        }
        this.printCloseTag('expression');
    }
    compileTerm() {
        this.printOpenTag('term');
        switch (this.tokenizer.tokenType()) {
            case Enum_1.TokenType.INT_CONST:
                this.useIntegerConstant();
                break;
            case Enum_1.TokenType.STRING_CONST:
                this.useStringConstant();
                break;
            case Enum_1.TokenType.KEYWORD:
                this.useKeyWord(this.tokenizer.keyWord());
                break;
            case Enum_1.TokenType.IDENTIFIER:
                if (this.tokenizer.peek(1) === '[') { // varName[expression]
                    this.useIdentifier();
                    this.useSymbol('[');
                    this.compileExpression();
                    this.useSymbol(']');
                }
                else if (this.tokenizer.peek(1) === '(' || this.tokenizer.peek(1) === '.') { // subroutine call
                    this.compileSubroutineCall();
                }
                else { // varName
                    this.useIdentifier();
                }
                break;
            case Enum_1.TokenType.SYMBOL:
                const symbol = this.tokenizer.symbol();
                this.useSymbol(symbol);
                if (symbol === '(') { // (expression)
                    this.compileExpression();
                    this.useSymbol(')');
                }
                else if (symbol === '-' || symbol === '~') { // unaryOp term
                    this.compileTerm();
                }
                else {
                    throw new Error(`Unexpected term at compileTerm: ${symbol}`);
                }
                break;
            default:
                throw new Error(`Unexpected tokenType at compileTerm: ${this.tokenizer.tokenType()}`);
        }
        this.printCloseTag('term');
    }
    compileExpressionList() {
        this.printOpenTag('expressionList');
        while (this.tokenizer.peek(0) !== ')') {
            this.compileExpression();
            if (this.tokenizer.peek(0) === ',') {
                this.useSymbol(',');
            }
        }
        this.printCloseTag('expressionList');
    }
    useKeyWord(keyword) {
        this.printTag('keyword', keyword);
        this.tokenizer.advance();
    }
    useSymbol(symbol) {
        if (symbol !== this.tokenizer.symbol()) {
            throw new Error(`Unexpected symbol: expected = ${symbol}, actual = ${this.tokenizer.symbol()}`);
        }
        this.printTag('symbol', symbol);
        this.tokenizer.advance();
    }
    useIdentifier() {
        const identifier = this.tokenizer.identifier();
        this.tokenizer.advance();
        this.printTag('identifier', identifier);
        return identifier;
    }
    useIntegerConstant() {
        const intVal = this.tokenizer.intVal();
        this.tokenizer.advance();
        this.printTag('integerConstant', intVal.toString());
    }
    useStringConstant() {
        const stringVal = this.tokenizer.stringVal();
        this.tokenizer.advance();
        this.printTag('stringConstant', stringVal);
    }
    printTag(tagName, val) {
        let processed = val;
        processed = processed.replace('&', '&amp;');
        processed = processed.replace('<', '&lt;');
        processed = processed.replace('>', '&gt;');
        fs.appendFileSync(this.fileName, `<${tagName}> ${processed} </${tagName}>\n`);
    }
    printOpenTag(tagName) {
        fs.appendFileSync(this.fileName, `<${tagName}>\n`);
    }
    printCloseTag(tagName) {
        this.printOpenTag(`/${tagName}`);
    }
    isOperator(str) {
        const operators = [
            '+',
            '-',
            '*',
            '/',
            '&',
            '|',
            '<',
            '>',
            '=',
        ];
        if (operators.includes(str)) {
            return true;
        }
        return false;
    }
}
exports.default = CompilationEngine;
