Object.defineProperty(exports, "__esModule", { value: true });
var CommandType;
(function (CommandType) {
    CommandType[CommandType["C_ARITHMETIC"] = 0] = "C_ARITHMETIC";
    CommandType[CommandType["C_PUSH"] = 1] = "C_PUSH";
    CommandType[CommandType["C_POP"] = 2] = "C_POP";
    CommandType[CommandType["C_LABEL"] = 3] = "C_LABEL";
    CommandType[CommandType["C_GOTO"] = 4] = "C_GOTO";
    CommandType[CommandType["C_IF"] = 5] = "C_IF";
    CommandType[CommandType["C_FUNCTION"] = 6] = "C_FUNCTION";
    CommandType[CommandType["C_RETURN"] = 7] = "C_RETURN";
    CommandType[CommandType["C_CALL"] = 8] = "C_CALL";
})(CommandType = exports.CommandType || (exports.CommandType = {}));
