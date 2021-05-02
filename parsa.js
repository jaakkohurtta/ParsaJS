/** ParsaJS ***
 * @description : Library to parse and evaluate arithmetic expressions without eval()
 * @author      : Jaakko Hurtta
 * @version     : 1.0.2
 * @license     : MIT
 */

// regExp for valid operators
const validOperators = /^[\+\-(\*\*?)\/\%\(\)]$/;
// regExp for valid number
const validNumbers = /^\-?\d+\.?(\d+)?$/;
// regExp for variable
const validVariables = /^[a-zA-Z]$/i;

// Test character for valid operators
function helloOperator(char, prevChar, nextChar) {
  // If expression starts with - return false to for negative number
  if(prevChar === undefined && char === "-") {
    return false;
  } 
  // If char === - and previus char is an operator return false to parse negative number
  else if(validOperators.test(prevChar) && char === "-" && validNumbers.test(nextChar)) {
    if(prevChar === ")") {
      return true;
    } else {
      return false;
    }
  }
  // If valid operator
  else if(validOperators.test(char)) {
    return true;
  } else {
    return false;
  }
}
 
export default class Parsa {
  _items;
  _blocks;               // Array of block data, { id, prio, startIndex, endIndex }
  _currentBlockId;       // ID of next-in-line for evaluation
  _evaluation;           // Final result of evaluated expression
  _originalExpression;   // String of original expression

  constructor() {
    this._items = [];
    this._blocks = [];
    this._currentBlockId = 0;
    this._evaluation = 0;
    this._originalExpression = "";
  }

  //#region "Private" methods

  // Returns new expression item
  _addItem(value, type) {
    return { 
      "value": value, 
      "type": type 
    }
  }

  // Clear items
  _clearItems() {
    this._blocks = [];
    this._currentBlockId = 0;
    this._evaluation = 0;
    this._originalExpression = "";
  }

  // Evaluator for array of expression items
  async _evaluate(items, startIndex, endIndex) {
    let operatorCount = 0;

    // Remove parenthesis if found
    if(items[startIndex].type === "parenthesis" && items[endIndex].type === "parenthesis") {
      items.splice(startIndex, 1);
      items.splice(endIndex - 1, 1); 
      endIndex -= 2;
    }

    // Get the amount of operators for evaluation loop
    for(let i = startIndex; i <= endIndex; i++) {
      items[i].type === "operator" ? operatorCount++ : null;
    }
    
    evaluation:
    while(operatorCount > 0) {
      for(let i = startIndex; i <= endIndex; i++) {
        if(items[i].value === "**") {
          items[i - 1].value = (parseFloat(items[i - 1].value) ** parseFloat(items[i + 1].value)).toString();
          items.splice(i, 2);
          endIndex -= 2;
          operatorCount--;
          continue evaluation;
        }
      }
      for(let i = startIndex; i <= endIndex; i++) {
        if(items[i].value === "*" || items[i].value === "/" || items[i].value === "%") {
          if(items[i].value === "*") {
            items[i - 1].value = (parseFloat(items[i - 1].value) * parseFloat(items[i + 1].value)).toString();
          } else if(items[i].value === "/") {
            items[i - 1].value = (parseFloat(items[i - 1].value) / parseFloat(items[i + 1].value)).toString();
          } else {
            items[i - 1].value = (parseFloat(items[i - 1].value) % parseFloat(items[i + 1].value)).toString();
          }
          items.splice(i, 2);
          endIndex -= 2;
          operatorCount--;
          continue evaluation;
        }
      } 
      for(let i = startIndex; i <= endIndex; i++) {
        if(items[i].value === "+" || items[i].value === "-") {
          if(items[i].value === "+") {
            items[i - 1].value = (parseFloat(items[i - 1].value) + parseFloat(items[i + 1].value)).toString();
          } else {
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
  }

  // Validator for arrays of expression items
  _validate(items) {
    // Validate parsed numbers
    items.forEach(item => {
      if(item.type === "number") {
        if(!validNumbers.test(item.value)) {
          throw `Parser error: Not a valid number. (${item.value})`;
        }
      }
    });
    // Validate operator placement
    for(let i = 0; i < items.length; i++) {
      if(items[0].type === "operator") {
        throw `Parser error: Misplaced operator at first index.`;
      }
      if(items[items.length - 1].type === "operator") {
        throw `Parser error: Misplaced operator at last index.`;
      }
      if(i > 0 && i < items.length - 1) {
        if(items[i].type === "operator" && items[i - 1].type === "operator") {
          throw `Parser error: Misplaced operator.`;
        } else if(items[i].type === "operator" && items[i + 1].type === "operator") {
          throw `Parser error: Misplaced operator.`;
        }
      }
    }
    // Validate parenthesis
    let pCount = 0;
    items.forEach(item => {
      if(item.type === "parenthesis") {
        pCount++;
      }
    });
    if(pCount % 2 != 0) {
      equationIsValid = false;
      throw `Parser error: Odd number of parenthesis.`;
    }
  }

  // Get block data
  _getBlocks(items) {
    this._blocks = [];
    let block = 0,
        blockStartIndex = 0;

    items.forEach((item, index) => {
      if(item.value === "(") { 
        this._blocks.push({ "id": this._blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index - 1 });
        blockStartIndex = index;
        block++;
      } else if(item.value === ")") {
        this._blocks.push({ "id": this._blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index });   
        index != items.lenght - 1 ? blockStartIndex = index + 1 : blockStartIndex = index;
        block--;
      } else if(item.value != ")" && index === items.length - 1) {
        this._blocks.push({ "id": this._blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index });  
      } 
    });
  }
  
  // Find a block with highest prio to solve next
  _getNextBlock() {
    let highestPrio = 0;
    let id;

    this._blocks.forEach((block, index) => {
      if(block.prio >= highestPrio) {
        highestPrio = block.prio;
        id = index + 1;
      }
    });
    return id;
  }
  
  //#endregion

  //#region "Public" methods

  // Parse a string into an array
  async parse(inputString) {
    
    this._clearItems();
    inputString.trim();

    // Helpers
    let expression,               // expression string
        item,                     // current item
        items = [],               // array of parsed items
        variables, variableKeys,  // variables & keys
        firstIndex = 0,           // first index of next item in expression string
        separatorIndex = 0,       // separator index between expression and variables
        prevChar, char, nextChar, // helpers for validation
        error = false;            // flag for expression validity

    // Search for separator
    for(let i = 0; i < inputString.length; i++) {
      if(inputString[i] === ",") {
        separatorIndex = i;
        break;
      }
    }

    // Parse variables and slice expression into new string for parsing
    if(separatorIndex != 0) {
      variables = JSON.parse(inputString.slice(separatorIndex + 1, inputString.length));
      variableKeys = Object.keys(variables);
      expression = inputString.slice(0, separatorIndex);
    } else {
      expression = inputString;
      separatorIndex = expression.length;
    }

    // Loop for parsing the input string
    for(let i = 0; i < separatorIndex; i++) {
      prevChar = expression[i - 1];
      char = expression[i];
      nextChar = expression[i + 1];

      // If char at i is an operator, slice the string and the operator to items
      if(helloOperator(char, prevChar, nextChar)) {   

        // Add number to array
        if(i - firstIndex > 0) {
          item = expression.slice(firstIndex, i);
          if(validVariables.test(item)) {
            variableKeys.forEach(key => {
              item === key ? item = variables[key].toString() : null;
            });
          } 
          items.push(this._addItem(item, "number"));
        }

        // Operator
        item = expression[i];
        // Check for double * and combine them to one operator if found
        if(items.length > 1) {
          if(item === "*" && items[items.length - 1].value === "*") {
            items.pop();
            item = "**";
          }
        } 
        // Add operator to array
        expression[i] === "(" || expression[i] === ")" ? 
                        items.push(this._addItem(item, "parenthesis")) : items.push(this._addItem(item, "operator"));

        // Set first index as operator position + 1 for next item
        firstIndex = i+1;
      }

      // Check if we reach the end of expression string to parse the last item
      if(i === expression.length - 1 && i - firstIndex >= 0) {
        item = expression.slice(firstIndex, i+1);
        if(validVariables.test(item)) {
          variableKeys.forEach(key => {
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
    catch(err) {
      // Clear items and push and an error to the array
      items = [];
      this._blocks = [];
      error = true;

      items.push(this._addItem(err, "error"))
    }
    finally {
      // Store original expression string
      this._originalExpression = inputString;

      // Store items
      items.forEach(item => {
        this._items.push(this._addItem(item.value, item.type));
      })

      let message;
      error ? message = "Parser error." : message = "Parsing complete.";
      return {
        msg: message,
        items: items
      }
    }
  }
  
  async evaluateNext(items) {
    this._getBlocks(items);
    this._currentBlockId = this._getNextBlock();

    let blockResult = 0,
        startIndex, 
        endIndex;

    // Get start and end points of items[] for evaluation
    this._blocks.forEach(block => {
      if(block.id === this._currentBlockId) {
        startIndex = block.startIndex;
        endIndex = block.endIndex;
      }
    });

    blockResult = await this._evaluate(items, startIndex, endIndex);
    this._getBlocks(items);
    
    if(items.length === 1) {
      this._evaluation = parseFloat(blockResult);
      return { 
        complete: true,
        eval: parseFloat(blockResult),
        items: items,
        blocks: this._blocks
      }
    } else {
      return {
        complete: false,
        eval: parseFloat(blockResult),
        items: items,     
        blocks: this._blocks
      }
    }
  }

  async evaluateAll(items) {
    let result = {};

    do {
      await this.evaluateNext(items).then(res => {
        result = {
          complete: res.complete,
          eval: this._evaluation,
          items: res.items,
          blocks: res.blocks,
        }
      });
    } while (items.length > 1);

    return result;
  }

  getSourceString() {
    return this._originalExpression;
  }

  getSourceItems() {
    // let res = this.parse(this._originalExpression);

    return this._items;
  }

  //#endregion
}
