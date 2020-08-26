Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("./Enum");
const VarAttr_1 = require("./VarAttr");
class SymbolTable {
    constructor() {
        this.classTable = {};
        this.subroutineTable = {};
        this.staticIndex = 0;
        this.fieldIndex = 0;
        this.argIndex = 0;
        this.varIndex = 0;
    }
    ;
    ;
    startSubroutine() {
        this.subroutineTable = {};
        this.argIndex = 0;
        this.varIndex = 0;
    }
    define(name, type, kind) {
        if (kind === Enum_1.VarKind.STATIC) {
            this.classTable[name] = new VarAttr_1.default(type, kind, this.staticIndex++);
        }
        else if (kind === Enum_1.VarKind.FIELD) {
            this.classTable[name] = new VarAttr_1.default(type, kind, this.fieldIndex++);
        }
        else if (kind === Enum_1.VarKind.ARG) {
            this.subroutineTable[name] = new VarAttr_1.default(type, kind, this.argIndex++);
        }
        else if (kind === Enum_1.VarKind.VAR) {
            this.subroutineTable[name] = new VarAttr_1.default(type, kind, this.varIndex++);
        }
        else {
            throw new Error(`Unexpected kind: ${kind}`);
        }
    }
    varCount(kind) {
        if (kind === Enum_1.VarKind.STATIC) {
            return this.staticIndex;
        }
        else if (kind === Enum_1.VarKind.FIELD) {
            return this.fieldIndex;
        }
        else if (kind === Enum_1.VarKind.ARG) {
            return this.argIndex;
        }
        else if (kind === Enum_1.VarKind.VAR) {
            return this.varIndex;
        }
        else {
            throw new Error(`Unexpected kind: ${kind}`);
        }
    }
    kindOf(name) {
        if (this.subroutineTable[name]) {
            return this.subroutineTable[name].kind;
        }
        if (this.classTable[name]) {
            return this.classTable[name].kind;
        }
        return Enum_1.VarKind.NONE;
    }
    typeOf(name) {
        if (this.subroutineTable[name]) {
            return this.subroutineTable[name].type;
        }
        if (this.classTable[name]) {
            return this.classTable[name].type;
        }
        throw new Error(`Undefined var: ${name}`);
    }
    indexOf(name) {
        if (this.subroutineTable[name]) {
            return this.subroutineTable[name].index;
        }
        if (this.classTable[name]) {
            return this.classTable[name].index;
        }
        throw new Error(`Undefined var: ${name}`);
    }
}
exports.default = SymbolTable;
