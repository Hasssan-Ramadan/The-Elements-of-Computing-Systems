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
