Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("./Parser");
const CodeWriter_1 = require("./CodeWriter");
const Enum_1 = require("./Enum");
const fs = require('fs');
if (process.argv.length !== 3) {
    throw new Error();
}
const path = process.argv[2]; // fileName.vm or directory
const vmFiles = [];
let asmFileName;
let codeWriter;
if (path.endsWith('.vm')) { // only 1 vm file
    vmFiles.push(path);
    asmFileName = path.replace('.vm', '') + '.asm';
    codeWriter = new CodeWriter_1.default(asmFileName);
}
else { // all .vm files in directory
    const dirName = path.replace(/.*\//, '');
    asmFileName = `${path}/${dirName}.asm`;
    codeWriter = new CodeWriter_1.default(asmFileName);
    codeWriter.writeInit();
    for (const fileName of fs.readdirSync(path)) {
        if (fileName.endsWith('.vm')) {
            vmFiles.push(`${path}/${fileName}`);
        }
    }
}
for (let vmFile of vmFiles) {
    codeWriter.setFileName(vmFile);
    const parser = new Parser_1.default(`${vmFile}`);
    translateVM(parser, codeWriter);
}
function translateVM(parser, codeWriter) {
    while (parser.hasMoreCommands()) {
        parser.advance();
        switch (parser.commandType()) {
            case Enum_1.CommandType.C_ARITHMETIC:
                codeWriter.writeArithmetic(parser.arg1());
                break;
            case Enum_1.CommandType.C_PUSH:
                codeWriter.writePushPop(Enum_1.CommandType.C_PUSH, parser.arg1(), parser.arg2());
                break;
            case Enum_1.CommandType.C_POP:
                codeWriter.writePushPop(Enum_1.CommandType.C_POP, parser.arg1(), parser.arg2());
                break;
            case Enum_1.CommandType.C_LABEL:
                codeWriter.writeLabel(parser.arg1());
                break;
            case Enum_1.CommandType.C_GOTO:
                codeWriter.writeGoto(parser.arg1());
                break;
            case Enum_1.CommandType.C_IF:
                codeWriter.writeIf(parser.arg1());
                break;
            case Enum_1.CommandType.C_CALL:
                codeWriter.writeCall(parser.arg1(), parser.arg2());
                break;
            case Enum_1.CommandType.C_RETURN:
                codeWriter.writeReturn();
                break;
            case Enum_1.CommandType.C_FUNCTION:
                codeWriter.writeFunction(parser.arg1(), parser.arg2());
                break;
            default:
                throw new Error('unknown CommandType');
        }
    }
}
