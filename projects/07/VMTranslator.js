Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("./Parser");
const CodeWriter_1 = require("./CodeWriter");
const Enum_1 = require("./Enum");
if (process.argv.length !== 3) {
    throw new Error();
}
const fileName = process.argv[2]; // fileName.vm
const parser = new Parser_1.default(`${fileName}`);
const codeWriter = new CodeWriter_1.default();
codeWriter.setFileName(`${fileName.replace('.vm', '')}.asm`);
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
    }
}
