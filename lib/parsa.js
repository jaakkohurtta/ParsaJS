"use strict";
/** ParsaJS ***
 * @description : Library to parse and evaluate arithmetic expressions without eval()
 * @author      : Jaakko Hurtta
 * @version     : 1.1.0
 * @license     : MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
// regExp for valid operators
var validOperators = /^[\+\-(\*\*?)\/\%\(\)]$/;
// regExp for valid number
var validNumbers = /^\-?\d+\.?(\d+)?$/;
// regExp for variable
var validVariables = /^[a-zA-Z]$/i;
// Test character for valid operators
function helloOperator(char, prevChar, nextChar) {
    // If expression starts with - return false to for negative number
    if (prevChar === undefined && char === "-") {
        return false;
    }
    // If char === - and previus char is an operator return false to parse negative number
    else if (validOperators.test(prevChar) && char === "-" && validNumbers.test(nextChar)) {
        if (prevChar === ")") {
            return true;
        }
        else {
            return false;
        }
    }
    // If valid operator
    else if (validOperators.test(char)) {
        return true;
    }
    else {
        return false;
    }
}
var Parsa = /** @class */ (function () {
    function Parsa() {
        this._items = [];
        this._blocks = []; // Array of block data, { id, prio, startIndex, endIndex }
        this._currentBlockId = 0; // ID of next-in-line for evaluation
        this._evaluation = 0; // Final result of evaluated expression
        this._originalExpression = ""; // String of original expression
    }
    //#region "Private" methods
    // Returns new expression item
    Parsa.prototype._addItem = function (value, type) {
        return {
            "value": value,
            "type": type
        };
    };
    // Clear items
    Parsa.prototype._clearItems = function () {
        this._blocks = [];
        this._currentBlockId = 0;
        this._evaluation = 0;
        this._originalExpression = "";
    };
    // Evaluator for array of expression items
    Parsa.prototype._evaluate = function (items, startIndex, endIndex) {
        var operatorCount = 0;
        // Remove parenthesis if found
        if (items[startIndex].type === "parenthesis" && items[endIndex].type === "parenthesis") {
            items.splice(startIndex, 1);
            items.splice(endIndex - 1, 1);
            endIndex -= 2;
        }
        // Get the amount of operators for evaluation loop
        for (var i = startIndex; i <= endIndex; i++) {
            items[i].type === "operator" ? operatorCount++ : null;
        }
        evaluation: while (operatorCount > 0) {
            for (var i = startIndex; i <= endIndex; i++) {
                if (items[i].value === "**") {
                    items[i - 1].value = (Math.pow(parseFloat(items[i - 1].value), parseFloat(items[i + 1].value))).toString();
                    items.splice(i, 2);
                    endIndex -= 2;
                    operatorCount--;
                    continue evaluation;
                }
            }
            for (var i = startIndex; i <= endIndex; i++) {
                if (items[i].value === "*" || items[i].value === "/" || items[i].value === "%") {
                    if (items[i].value === "*") {
                        items[i - 1].value = (parseFloat(items[i - 1].value) * parseFloat(items[i + 1].value)).toString();
                    }
                    else if (items[i].value === "/") {
                        items[i - 1].value = (parseFloat(items[i - 1].value) / parseFloat(items[i + 1].value)).toString();
                    }
                    else {
                        items[i - 1].value = (parseFloat(items[i - 1].value) % parseFloat(items[i + 1].value)).toString();
                    }
                    items.splice(i, 2);
                    endIndex -= 2;
                    operatorCount--;
                    continue evaluation;
                }
            }
            for (var i = startIndex; i <= endIndex; i++) {
                if (items[i].value === "+" || items[i].value === "-") {
                    if (items[i].value === "+") {
                        items[i - 1].value = (parseFloat(items[i - 1].value) + parseFloat(items[i + 1].value)).toString();
                    }
                    else {
                        items[i - 1].value = (parseFloat(items[i - 1].value) - parseFloat(items[i + 1].value)).toString();
                    }
                    items.splice(i, 2);
                    endIndex -= 2;
                    operatorCount--;
                    continue evaluation;
                }
            }
            break;
        }
        // Return the evaluated result
        return items[startIndex].value;
    };
    // Validator for arrays of expression items
    Parsa.prototype._validate = function (items) {
        // Validate parsed numbers
        items.forEach(function (item) {
            if (item.type === "number") {
                if (!validNumbers.test(item.value)) {
                    throw "Parser error: Not a valid number. (" + item.value + ")";
                }
            }
        });
        // Validate operator placement
        for (var i = 0; i < items.length; i++) {
            if (items[0].type === "operator") {
                throw "Parser error: Misplaced operator at first index.";
            }
            if (items[items.length - 1].type === "operator") {
                throw "Parser error: Misplaced operator at last index.";
            }
            if (i > 0 && i < items.length - 1) {
                if (items[i].type === "operator" && items[i - 1].type === "operator") {
                    throw "Parser error: Misplaced operator.";
                }
                else if (items[i].type === "operator" && items[i + 1].type === "operator") {
                    throw "Parser error: Misplaced operator.";
                }
            }
        }
        // Validate parenthesis
        var pCount = 0;
        items.forEach(function (item) {
            if (item.type === "parenthesis") {
                pCount++;
            }
        });
        if (pCount % 2 != 0) {
            throw "Parser error: Odd number of parenthesis.";
        }
    };
    // Get block data
    Parsa.prototype._getBlocks = function (items) {
        var _this = this;
        this._blocks = [];
        var block = 0, blockStartIndex = 0;
        items.forEach(function (item, index) {
            if (item.value === "(") {
                _this._blocks.push({ "id": _this._blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index - 1 });
                blockStartIndex = index;
                block++;
            }
            else if (item.value === ")") {
                _this._blocks.push({ "id": _this._blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index });
                index != items.length - 1 ? blockStartIndex = index + 1 : blockStartIndex = index;
                block--;
            }
            else if (item.value != ")" && index === items.length - 1) {
                _this._blocks.push({ "id": _this._blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index });
            }
        });
    };
    // Find a block with highest prio to solve next
    Parsa.prototype._getNextBlock = function () {
        var highestPrio = 0;
        var id = 0;
        this._blocks.forEach(function (block, index) {
            if (block.prio >= highestPrio) {
                highestPrio = block.prio;
                id = index + 1;
            }
        });
        return id;
    };
    //#endregion
    //#region "Public" methods
    // Parse a string into an array
    Parsa.prototype.parse = function (inputString) {
        var _this = this;
        this._clearItems();
        inputString.trim();
        // Helpers
        var expression, // expression string
        item, // current item
        items = [], // array of parsed items
        variables, variableKeys, firstIndex = 0, // first index of next item in expression string
        separatorIndex = 0, // separator index between expression and variables
        prevChar, char, nextChar, // helpers for validation
        error = false; // flag for expression validity
        // Search for separator
        for (var i = 0; i < inputString.length; i++) {
            if (inputString[i] === ",") {
                separatorIndex = i;
                break;
            }
        }
        // Parse variables and slice expression into new string for parsing
        if (separatorIndex != 0) {
            variables = JSON.parse(inputString.slice(separatorIndex + 1, inputString.length));
            variableKeys = Object.keys(variables);
            expression = inputString.slice(0, separatorIndex);
        }
        else {
            expression = inputString;
            separatorIndex = expression.length;
        }
        // Loop for parsing the input string
        for (var i = 0; i < separatorIndex; i++) {
            prevChar = expression[i - 1];
            char = expression[i];
            nextChar = expression[i + 1];
            // If char at i is an operator, slice the string and the operator to items
            if (helloOperator(char, prevChar, nextChar)) {
                // Add number to array
                if (i - firstIndex > 0) {
                    item = expression.slice(firstIndex, i);
                    if (validVariables.test(item)) {
                        variableKeys === null || variableKeys === void 0 ? void 0 : variableKeys.forEach(function (key) {
                            item === key ? item = variables[key].toString() : null;
                        });
                    }
                    items.push(this._addItem(item, "number"));
                }
                // Operator
                item = expression[i];
                // Check for double * and combine them to one operator if found
                if (items.length > 1) {
                    if (item === "*" && items[items.length - 1].value === "*") {
                        items.pop();
                        item = "**";
                    }
                }
                // Add operator to array
                expression[i] === "(" || expression[i] === ")" ?
                    items.push(this._addItem(item, "parenthesis")) : items.push(this._addItem(item, "operator"));
                // Set first index as operator position + 1 for next item
                firstIndex = i + 1;
            }
            // Check if we reach the end of expression string to parse the last item
            if (i === expression.length - 1 && i - firstIndex >= 0) {
                item = expression.slice(firstIndex, i + 1);
                if (validVariables.test(item)) {
                    variableKeys === null || variableKeys === void 0 ? void 0 : variableKeys.forEach(function (key) {
                        item === key ? item = variables[key].toString() : null;
                    });
                }
                items.push(this._addItem(item, "number"));
            }
        }
        // Validation
        try {
            this._validate(items);
        }
        catch (err) {
            // Clear items and push and an error to the array
            items = [];
            this._blocks = [];
            error = true;
            items.push(this._addItem(err, "error"));
        }
        finally {
            // Store original expression string
            this._originalExpression = inputString;
            // Store items
            items.forEach(function (item) {
                _this._items.push(_this._addItem(item.value, item.type));
            });
            // Get blocks
            this._getBlocks(items);
            var message = void 0;
            error ? message = "Parser error." : message = "Parsing complete.";
            return {
                msg: message,
                items: items,
                blocks: this._blocks
            };
        }
    };
    Parsa.prototype.evaluateNext = function (items) {
        var _this = this;
        this._getBlocks(items);
        this._currentBlockId = this._getNextBlock();
        var blockResult, startIndex = 0, endIndex = 0;
        // Get start and end points of items[] for evaluation
        this._blocks.forEach(function (block) {
            if (block.id === _this._currentBlockId) {
                startIndex = block.startIndex;
                endIndex = block.endIndex;
            }
        });
        blockResult = this._evaluate(items, startIndex, endIndex);
        this._getBlocks(items);
        if (items.length === 1) {
            this._evaluation = parseFloat(blockResult);
            return {
                complete: true,
                eval: parseFloat(blockResult),
                items: items,
                blocks: this._blocks
            };
        }
        else {
            return {
                complete: false,
                eval: parseFloat(blockResult),
                items: items,
                blocks: this._blocks
            };
        }
    };
    Parsa.prototype.evaluateAll = function (items) {
        var result = {};
        do {
            var res = this.evaluateNext(items);
            result = {
                complete: res.complete,
                eval: this._evaluation,
                items: res.items,
                blocks: res.blocks,
            };
        } while (items.length > 1);
        return result;
    };
    Parsa.prototype.getSourceString = function () {
        return this._originalExpression;
    };
    Parsa.prototype.getSourceItems = function () {
        return this._items;
    };
    return Parsa;
}());
exports.default = Parsa;
//# sourceMappingURL=parsa.js.map