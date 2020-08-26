Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("./Enum");
const SymbolTable_1 = require("./SymbolTable");
const VMWriter_1 = require("./VMWriter");
class CompilationEngine {
    constructor(tokenizer, fileName) {
        this.labelIndex = 0;
        this.tokenizer = tokenizer;
        this.symbolTable = new SymbolTable_1.default();
        this.vmWriter = new VMWriter_1.default(fileName);
    }
    compileClass() {
        this.useKeyWord('class');
        this.className = this.useIdentifier();
        this.useSymbol('{');
        if (['static', 'field'].includes(this.tokenizer.peek(0))) {
            this.compileClassVarDec();
        }
        if (['constructor', 'function', 'method'].includes(this.tokenizer.peek(0))) {
            this.compileSubroutine();
        }
        this.useSymbol('}');
    }
    compileClassVarDec() {
        while (['static', 'field'].includes(this.tokenizer.peek(0))) {
            const kind = this.str2kind(this.useKeyWord()); // static, field
            const type = this.compileType();
            // var name
            let varName = this.useIdentifier();
            this.symbolTable.define(varName, type, kind);
            while (this.tokenizer.peek(0) === ',') {
                this.useSymbol(',');
                varName = this.useIdentifier();
                this.symbolTable.define(varName, type, kind);
            }
            this.useSymbol(';');
        }
    }
    compileSubroutine() {
        while (['constructor', 'function', 'method'].includes(this.tokenizer.peek(0))) {
            this.useKeyWord(this.tokenizer.keyWord());
            if (this.tokenizer.tokenType() === Enum_1.TokenType.KEYWORD) {
                this.useKeyWord();
            }
            else {
                this.useIdentifier();
            }
            const subroutineName = this.useIdentifier();
            this.symbolTable.startSubroutine();
            this.useSymbol('(');
            this.compileParameterList();
            this.useSymbol(')');
            let numVar = 0;
            this.useSymbol('{');
            while (this.tokenizer.peek(0) === 'var') {
                numVar += this.compileVarDec();
            }
            this.vmWriter.writeFunction(`${this.className}.${subroutineName}`, numVar);
            this.compileStatements();
            this.useSymbol('}');
        }
    }
    compileType() {
        if (this.tokenizer.tokenType() === Enum_1.TokenType.KEYWORD) { // int, char, boolean
            return this.useKeyWord(this.tokenizer.keyWord());
        }
        else if (this.tokenizer.tokenType() === Enum_1.TokenType.IDENTIFIER) { // className
            return this.useIdentifier();
        }
        throw new Error(`Unexpected tokenType: ${this.tokenizer.tokenType()}`);
    }
    compileParameterList() {
        let numParams = 0;
        if (this.tokenizer.peek(0) === ')') {
            return numParams;
        }
        let type = this.compileType();
        let paramName = this.useIdentifier();
        this.symbolTable.define(paramName, type, Enum_1.VarKind.ARG);
        numParams++;
        while (this.tokenizer.peek(0) !== ')') {
            this.useSymbol(',');
            type = this.compileType();
            paramName = this.useIdentifier();
            this.symbolTable.define(paramName, type, Enum_1.VarKind.ARG);
            numParams++;
        }
        return numParams;
    }
    compileVarDec() {
        let numVar = 1;
        this.useKeyWord('var');
        const type = this.compileType();
        let varName = this.useIdentifier();
        this.symbolTable.define(varName, type, Enum_1.VarKind.VAR);
        while (this.tokenizer.peek(0) === ',') {
            numVar++;
            this.useSymbol(',');
            varName = this.useIdentifier();
            this.symbolTable.define(varName, type, Enum_1.VarKind.VAR);
        }
        this.useSymbol(';');
        return numVar;
    }
    compileStatements() {
        this.compileStatement();
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
        this.useKeyWord('do');
        this.compileSubroutineCall();
        this.useSymbol(';');
        this.vmWriter.writePop('temp', 0);
    }
    compileSubroutineCall() {
        let prefix = '';
        let isInstance = false;
        if (this.tokenizer.peek(1) === '.') { // xxx.fn();
            let predot = this.useIdentifier();
            try { // if instance
                predot = this.symbolTable.typeOf(predot);
                isInstance = true;
            }
            catch (e) {
                // none
            }
            this.useSymbol('.');
            prefix = `${predot}.`;
        }
        const subroutineName = this.useIdentifier();
        this.useSymbol('(');
        let numArgs = this.compileExpressionList();
        if (isInstance) {
            numArgs++;
        }
        this.useSymbol(')');
        this.vmWriter.writeCall(`${prefix}${subroutineName}`, numArgs);
    }
    compileLet() {
        this.useKeyWord('let');
        const varName = this.useIdentifier();
        const kind = this.symbolTable.kindOf(varName);
        const segment = this.kind2Segment(kind);
        const index = this.symbolTable.indexOf(varName);
        if (this.tokenizer.peek(0) === '[') { // if array
            this.vmWriter.writePush(segment, index);
            this.useSymbol('[');
            this.compileExpression();
            this.useSymbol(']');
            this.vmWriter.writeArithmetic('add'); // calculate addr
            this.useSymbol('=');
            this.compileExpression();
            this.useSymbol(';');
            this.vmWriter.writePop('temp', 0); // temp 0 <- expression
            this.vmWriter.writePop('pointer', 1); // that <- addr
            this.vmWriter.writePush('temp', 0);
            this.vmWriter.writePop('that', 0); // that <- temp
        }
        else {
            this.useSymbol('=');
            this.compileExpression();
            this.useSymbol(';');
            this.vmWriter.writePop(segment, index);
        }
    }
    compileWhile() {
        const index = this.labelIndex++;
        this.useKeyWord('while');
        this.useSymbol('(');
        this.vmWriter.writeLabel(`WHILE_EXP${index}`);
        this.compileExpression();
        this.useSymbol(')');
        this.vmWriter.writeArithmetic('not');
        this.vmWriter.writeIf(`WHILE_END${index}`);
        this.useSymbol('{');
        this.compileStatements();
        this.useSymbol('}');
        this.vmWriter.writeGoTo(`WHILE_EXP${index}`);
        this.vmWriter.writeLabel(`WHILE_END${index}`);
    }
    compileReturn() {
        this.useKeyWord('return');
        if (this.tokenizer.peek(0) !== ';') {
            this.compileExpression();
        }
        else { // return void
            this.vmWriter.writePush('constant', 0);
        }
        this.vmWriter.writeReturn();
        this.useSymbol(';');
    }
    compileIf() {
        const index = this.labelIndex++;
        this.useKeyWord('if');
        this.useSymbol('(');
        this.compileExpression();
        this.useSymbol(')');
        this.vmWriter.writeArithmetic('not');
        this.vmWriter.writeIf(`IF_ELSE${index}`);
        this.useSymbol('{');
        this.compileStatements();
        this.useSymbol('}');
        this.vmWriter.writeGoTo(`IF_END${index}`);
        this.vmWriter.writeLabel(`IF_ELSE${index}`);
        if (this.tokenizer.peek(0) === 'else') {
            this.useKeyWord('else');
            this.useSymbol('{');
            this.compileStatements();
            this.useSymbol('}');
        }
        this.vmWriter.writeLabel(`IF_END${index}`);
    }
    compileExpression() {
        this.compileTerm();
        while (this.isOperator(this.tokenizer.peek(0))) {
            const op = this.useSymbol(this.tokenizer.symbol());
            this.compileTerm();
            switch (op) {
                case '*':
                    this.vmWriter.writeCall('Math.multiply', 2);
                    break;
                case '/':
                    this.vmWriter.writeCall('Math.divide', 2);
                    break;
                default:
                    this.vmWriter.writeArithmetic(this.str2Command(op));
                    break;
            }
        }
    }
    compileTerm() {
        switch (this.tokenizer.tokenType()) {
            case Enum_1.TokenType.INT_CONST:
                this.vmWriter.writePush('constant', this.useIntegerConstant());
                break;
            case Enum_1.TokenType.STRING_CONST:
                let str = this.useStringConstant();
                this.vmWriter.writePush('constant', str.length);
                this.vmWriter.writeCall('String.new', 1);
                while (str.length > 0) {
                    this.vmWriter.writePush('constant', str.charCodeAt(0));
                    this.vmWriter.writeCall('String.appendChar', 2);
                    str = str.substring(1);
                }
                break;
            case Enum_1.TokenType.KEYWORD:
                const keyword = this.useKeyWord();
                switch (keyword) {
                    case 'true':
                        this.vmWriter.writePush('constant', 0);
                        this.vmWriter.writeArithmetic('not');
                        break;
                    case 'false':
                        this.vmWriter.writePush('constant', 0);
                        break;
                    case 'null':
                        this.vmWriter.writePush('constant', 0);
                        break;
                    case 'this':
                        break;
                    default:
                        throw new Error(`Unexpected keyword: ${keyword}`);
                }
                break;
            case Enum_1.TokenType.IDENTIFIER:
                if (this.tokenizer.peek(1) === '[') { // varName[expression]
                    const varName = this.useIdentifier();
                    const kind = this.symbolTable.kindOf(varName);
                    const index = this.symbolTable.indexOf(varName);
                    const segment = this.kind2Segment(kind);
                    this.vmWriter.writePush(segment, index);
                    this.useSymbol('[');
                    this.compileExpression();
                    this.useSymbol(']');
                    this.vmWriter.writeArithmetic('add'); // calculate addr
                    this.vmWriter.writePop('pointer', 1);
                    this.vmWriter.writePush('that', 0);
                }
                else if (this.tokenizer.peek(1) === '(' || this.tokenizer.peek(1) === '.') { // subroutine call
                    this.compileSubroutineCall();
                }
                else { // varName
                    const varName = this.useIdentifier();
                    const kind = this.symbolTable.kindOf(varName);
                    const index = this.symbolTable.indexOf(varName);
                    const segment = this.kind2Segment(kind);
                    this.vmWriter.writePush(segment, index);
                }
                break;
            case Enum_1.TokenType.SYMBOL:
                const symbol = this.tokenizer.symbol();
                this.useSymbol(symbol);
                if (symbol === '(') { // (expression)
                    this.compileExpression();
                    this.useSymbol(')');
                }
                else if (symbol === '-') { // unaryOp term
                    this.compileTerm();
                    this.vmWriter.writeArithmetic('neg');
                }
                else if (symbol === '~') { // unaryOp term
                    this.compileTerm();
                    this.vmWriter.writeArithmetic('not');
                }
                else {
                    throw new Error(`Unexpected term at compileTerm: ${symbol}`);
                }
                break;
            default:
                throw new Error(`Unexpected tokenType at compileTerm: ${this.tokenizer.tokenType()}`);
        }
    }
    compileExpressionList() {
        let numArgs = 0;
        while (this.tokenizer.peek(0) !== ')') {
            numArgs++;
            this.compileExpression();
            if (this.tokenizer.peek(0) === ',') {
                this.useSymbol(',');
            }
        }
        return numArgs;
    }
    str2kind(str) {
        if (str === 'static') {
            return Enum_1.VarKind.STATIC;
        }
        if (str === 'field') {
            return Enum_1.VarKind.FIELD;
        }
        throw new Error(`Unexpected str: ${str}`);
    }
    kind2Segment(kind) {
        switch (kind) {
            case Enum_1.VarKind.STATIC:
                return 'static';
            case Enum_1.VarKind.FIELD:
                return 'this';
            case Enum_1.VarKind.VAR:
                return 'local';
            case Enum_1.VarKind.ARG:
                return 'argument';
            default:
                throw new Error(`Unexpected kind: ${kind}`);
        }
    }
    str2Command(str) {
        switch (str) {
            case '+':
                return 'add';
            case '-':
                return 'sub';
            case '~':
                return 'neg';
            case '=':
                return 'eq';
            case '>':
                return 'gt';
            case '<':
                return 'lt';
            case '&':
                return 'and';
            case '|':
                return 'or';
            case '!':
                return 'not';
            default:
                throw new Error(`Unexpected str: ${str}`);
        }
    }
    useKeyWord(keyword = '') {
        if (keyword && keyword !== this.tokenizer.keyWord()) {
            throw new Error(`Unexpected keyword: expected = ${keyword}, actual = ${this.tokenizer.keyWord()}`);
        }
        keyword = this.tokenizer.keyWord();
        this.tokenizer.advance();
        return keyword;
    }
    useSymbol(symbol = '') {
        if (symbol && symbol !== this.tokenizer.symbol()) {
            throw new Error(`Unexpected symbol: expected = ${symbol}, actual = ${this.tokenizer.symbol()}`);
        }
        symbol = this.tokenizer.symbol();
        this.tokenizer.advance();
        return symbol;
    }
    useIdentifier() {
        const identifier = this.tokenizer.identifier();
        this.tokenizer.advance();
        return identifier;
    }
    useIntegerConstant() {
        const intVal = this.tokenizer.intVal();
        this.tokenizer.advance();
        return intVal;
    }
    useStringConstant() {
        const stringVal = this.tokenizer.stringVal();
        this.tokenizer.advance();
        return stringVal;
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
