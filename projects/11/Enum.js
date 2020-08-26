Object.defineProperty(exports, "__esModule", { value: true });
var TokenType;
(function (TokenType) {
    TokenType[TokenType["KEYWORD"] = 0] = "KEYWORD";
    TokenType[TokenType["SYMBOL"] = 1] = "SYMBOL";
    TokenType[TokenType["IDENTIFIER"] = 2] = "IDENTIFIER";
    TokenType[TokenType["INT_CONST"] = 3] = "INT_CONST";
    TokenType[TokenType["STRING_CONST"] = 4] = "STRING_CONST";
})(TokenType || (TokenType = {}));
exports.TokenType = TokenType;
var VarKind;
(function (VarKind) {
    VarKind[VarKind["STATIC"] = 0] = "STATIC";
    VarKind[VarKind["FIELD"] = 1] = "FIELD";
    VarKind[VarKind["ARG"] = 2] = "ARG";
    VarKind[VarKind["VAR"] = 3] = "VAR";
    VarKind[VarKind["NONE"] = 4] = "NONE";
})(VarKind || (VarKind = {}));
exports.VarKind = VarKind;
