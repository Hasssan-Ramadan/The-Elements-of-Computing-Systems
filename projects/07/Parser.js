Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("./Enum");
const fs = require('fs');
class Parser {
    constructor(fileName) {
        const fileData = fs.readFileSync(`${fileName}`).toString();
        const tmpLines = fileData.split('\n');
        this.line = '';
        this.lines = [];
        let index = 0;
        for (const tmpLine of tmpLines) {
            const shapedLine = Parser.shape(tmpLine);
            if (shapedLine === '') { // object == string
                continue;
            }
            this.lines[index++] = shapedLine;
        }
    }
    static shape(str) {
        str = str.replace(/^\s+/, '');
        str = str.replace(/\s+$/, '');
        str = str.replace(/\s{2,}/g, ' ');
        if (str.startsWith('//')) {
            return '';
        }
        return str;
    }
    hasMoreCommands() {
        if (this.lines && this.lines.length > 0) {
            return true;
        }
        return false;
    }
    advance() {
        const first = this.lines.shift();
        this.line = (first) ? first : '';
    }
    commandType() {
        if (this.line.startsWith('pop')) {
            return Enum_1.CommandType.C_POP;
        }
        if (this.line.startsWith('push')) {
            return Enum_1.CommandType.C_PUSH;
        }
        return Enum_1.CommandType.C_ARITHMETIC;
    }
    arg1() {
        if (this.commandType() === Enum_1.CommandType.C_ARITHMETIC) {
            return this.line;
        }
        return this.line.split(' ')[1];
    }
    arg2() {
        return Number(this.line.split(' ')[2]);
    }
}
exports.default = Parser;
