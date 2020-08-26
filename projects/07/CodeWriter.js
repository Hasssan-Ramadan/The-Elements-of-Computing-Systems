Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("./Enum");
const fs = require('fs');
const segmentMap = {
    argument: 'ARG',
    local: 'LCL',
    this: 'THIS',
    that: 'THAT',
};
class CodeWriter {
    constructor() {
        this.labelIndex = 0;
    }
    setFileName(fileName) {
        this.fileName = fileName;
        fs.writeFileSync(fileName, '');
    }
    writeArithmetic(command) {
        //console.log(`writeArithmetic(${command})`);
        if (command === 'add') {
            this.writeBinaryOp('+');
        }
        else if (command === 'sub') {
            this.writeBinaryOp('-');
        }
        else if (command === 'and') {
            this.writeBinaryOp('&');
        }
        else if (command === 'or') {
            this.writeBinaryOp('|');
        }
        else if (command === 'not') {
            this.writeUnaryOp('!');
        }
        else if (command === 'neg') {
            this.writeUnaryOp('-');
        }
        else if (command === 'eq') {
            this.writeJump('JEQ');
        }
        else if (command === 'lt') {
            this.writeJump('JLT');
        }
        else if (command === 'gt') {
            this.writeJump('JGT');
        }
    }
    writePushD() {
        let output = '';
        // SP = D
        output += '@SP' + '\n';
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';
        // increment SP
        output += '@SP' + '\n';
        output += 'M=M+1' + '\n';
        this.write(output);
    }
    writeBinaryOp(op) {
        this.writePop('temp', 1);
        this.writePop('temp', 0);
        let output = '';
        output += '@5' + '\n'; // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n'; // temp 1
        output += `D=D${op}M` + '\n';
        this.write(output);
        this.writePushD();
    }
    writeUnaryOp(op) {
        this.writePop('temp', 0);
        let output = '';
        output += '@5' + '\n'; // temp 0
        output += `D=${op}M` + '\n';
        this.write(output);
        this.writePushD();
    }
    writeJump(jumpOp) {
        const index = this.labelIndex++;
        this.writePop('temp', 1);
        this.writePop('temp', 0);
        let output = '';
        output += '@5' + '\n'; // temp 0
        output += 'D=M' + '\n';
        output += '@6' + '\n'; // temp 1
        output += 'D=D-M' + '\n';
        output += `@Jumptrue${index}` + '\n';
        output += `D;${jumpOp}` + '\n'; // jump to label
        // prediction is false
        output += 'D=0' + '\n';
        output += `@Jumpend${index}` + '\n';
        output += '0;JMP' + '\n';
        // prediction is true
        output += `(Jumptrue${index})` + '\n';
        output += 'D=-1' + '\n';
        output += `(Jumpend${index})` + '\n';
        this.write(output);
        this.writePushD();
    }
    writePushPop(type, segment, index) {
        if (type === Enum_1.CommandType.C_PUSH) {
            this.writePush(segment, index);
        }
        else if (type === Enum_1.CommandType.C_POP) {
            this.writePop(segment, index);
        }
        else {
            throw new Error();
        }
    }
    writePush(segment, index) {
        //console.log(`writePush(${segment}, ${index})`);
        let output = '';
        if (segment === 'constant') {
            output += `@${index}` + '\n';
            output += 'D=A' + '\n';
        }
        else if (segment === 'pointer') {
            output += `@${3 + index}` + '\n';
            output += 'D=M' + '\n';
        }
        else if (segment === 'temp') {
            output += `@${5 + index}` + '\n';
            output += 'D=M' + '\n';
        }
        else {
            output += `@${segmentMap[segment]}` + '\n';
            output += 'D=M' + '\n';
            output += `@${index}` + '\n';
            output += 'D=D+A' + '\n';
            output += 'A=D' + '\n';
            output += 'D=M' + '\n';
        }
        this.write(output);
        this.writePushD();
    }
    writePop(segment, index) {
        //console.log(`writePop(${segment}, ${index})`);
        let output = '';
        // R13 = segment Addr
        if (segment === 'pointer') {
            output += `@${3 + index}` + '\n';
            output += 'D=A' + '\n';
        }
        else if (segment === 'temp') {
            output += `@${5 + index}` + '\n';
            output += 'D=A' + '\n';
        }
        else {
            output += `@${segmentMap[segment]}` + '\n';
            output += 'D=M' + '\n';
            output += `@${index}` + '\n';
            output += 'D=D+A' + '\n';
        }
        output += '@R13' + '\n';
        output += 'M=D' + '\n';
        // D = SP--
        output += '@SP' + '\n';
        output += 'M=M-1' + '\n';
        output += 'A=M' + '\n';
        output += 'D=M' + '\n';
        output += '@R13' + '\n';
        output += 'A=M' + '\n';
        output += 'M=D' + '\n';
        this.write(output);
    }
    write(text) {
        fs.appendFileSync(this.fileName, text);
    }
    close() {
    }
}
exports.default = CodeWriter;
