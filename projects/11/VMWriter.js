Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
class VMWriter {
    constructor(fileName) {
        this.fileName = fileName;
    }
    writePush(segment, index) {
        this.write(`push ${segment} ${index}`);
    }
    writePop(segment, index) {
        this.write(`pop ${segment} ${index}`);
    }
    writeArithmetic(command) {
        this.write(`${command}`);
    }
    writeLabel(label) {
        this.write(`label ${label}`);
    }
    writeGoTo(label) {
        this.write(`goto ${label}`);
    }
    writeIf(label) {
        this.write(`if-goto ${label}`);
    }
    writeCall(name, nArgs) {
        this.write(`call ${name} ${nArgs}`);
    }
    writeFunction(name, nLocal) {
        this.write(`function ${name} ${nLocal}`);
    }
    writeReturn() {
        this.write('return');
    }
    write(str) {
        fs.appendFileSync(this.fileName, str + '\n');
    }
}
exports.default = VMWriter;
