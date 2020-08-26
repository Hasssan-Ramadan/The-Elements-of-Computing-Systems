Object.defineProperty(exports, "__esModule", { value: true });
const JackTokenizer_1 = require("./JackTokenizer");
const CompilationEngine_1 = require("./CompilationEngine");
const fs = require('fs');
if (process.argv.length !== 3) {
    throw new Error('Unexpected args');
}
const path = process.argv[2];
if (path.endsWith('.jack')) { // only 1 jack file
    compileFile(path, path.replace('.jack', '.xml'));
}
else { // directory
    for (const fileName of fs.readdirSync(path)) {
        if (fileName.endsWith('.jack')) {
            compileFile(`${path}/${fileName}`, `${path}/${fileName.replace('jack', 'xml')}`);
        }
    }
}
function compileFile(inputPath, outputPath) {
    const tokenizer = new JackTokenizer_1.default(inputPath);
    fs.writeFileSync(outputPath, '');
    const engine = new CompilationEngine_1.default(tokenizer, outputPath);
    engine.compileClass();
}
