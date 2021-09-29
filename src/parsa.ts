/** ParsaJS ***
 * @description : Library to parse and evaluate arithmetic expressions without eval()
 * @author      : Jaakko Hurtta
 * @version     : 1.1.0
 * @license     : MIT
 */

import { Item, Block, Parse, Evaluation } from "./types"

// regExp for valid operators
const validOperators = /^[\+\-(\*\*?)\/\%\(\)]$/;
// regExp for valid number
const validNumbers = /^\-?\d+\.?(\d+)?$/;
// regExp for variable
const validVariables = /^[a-zA-Z]$/i;

// Test character for valid operators
function helloOperator(char: string, prevChar: string, nextChar: string) {
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
  private items: Item[];
  private blocks: Block[];
  private currentBlockId: number;
  private evaluation: number;
  private originalExpression: string;

  constructor() {
    this.items = [];
    this.blocks = [];              // Array of block data, { id, prio, startIndex, endIndex }
    this.currentBlockId = 0;       // ID of next-in-line for evaluation
    this.evaluation = 0;           // Final result of evaluated expression
    this.originalExpression = "";  // String of original expression
  }

  //#region "Private" methods

  // Returns new expression item
  private addItem(value: string, type: string): Item {
    return {
      "value": value,
      "type": type
    }
  }

  // Clear items
  private clearItems() {
    this.blocks = [];
    this.currentBlockId = 0;
    this.evaluation = 0;
    this.originalExpression = "";
  }

  // Evaluator for array of expression items
  private evaluate(items: Item[], startIndex: number, endIndex: number): string {
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
  private validate(items: Item[]) {
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
      throw `Parser error: Odd number of parenthesis.`;
    }
  }

  // Get block data
  private getBlocks(items: Item[]) {
    this.blocks = [];
    let block = 0,
        blockStartIndex = 0;

    items.forEach((item, index) => {
      if(item.value === "(") {
        this.blocks.push({ "id": this.blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index - 1 });
        blockStartIndex = index;
        block++;
      } else if(item.value === ")") {
        this.blocks.push({ "id": this.blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index });
        index != items.length - 1 ? blockStartIndex = index + 1 : blockStartIndex = index;
        block--;
      } else if(item.value != ")" && index === items.length - 1) {
        this.blocks.push({ "id": this.blocks.length + 1, "prio": block, "startIndex": blockStartIndex, "endIndex": index });
      }
    });
  }

  // Find a block with highest prio to solve next
  private getNextBlock(): number {
    let highestPrio = 0;
    let id = 0;

    this.blocks.forEach((block, index) => {
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
  parse(inputString: string): Parse {

    this.clearItems();
    inputString.trim();

    // Helpers
    let expression,               // expression string
        item: string,             // current item
        items: Item[] = [],       // array of parsed items
        variables: Record<string, number>, 
        variableKeys: string[] | undefined, 
        firstIndex = 0,           // first index of next item in expression string
        separatorIndex = 0,       // separator index between expression and variables
        prevChar: string, 
        char: string, 
        nextChar: string,         // helpers for validation
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
            variableKeys?.forEach(key => {
              item === key ? item = variables[key].toString() : null;
            });
          }
          items.push(this.addItem(item, "number"));
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
                        items.push(this.addItem(item, "parenthesis")) : items.push(this.addItem(item, "operator"));

        // Set first index as operator position + 1 for next item
        firstIndex = i+1;
      }

      // Check if we reach the end of expression string to parse the last item
      if(i === expression.length - 1 && i - firstIndex >= 0) {
        item = expression.slice(firstIndex, i+1);
        if(validVariables.test(item)) {
          variableKeys?.forEach(key => {
            item === key ? item = variables[key].toString() : null;
          });
        }
        items.push(this.addItem(item, "number"));
      }
    }


    // Validation
    try {
      this.validate(items);
    }
    catch(err: unknown) {
      // Clear items and push and an error to the array
      items = [];
      this.blocks = [];
      error = true;

      items.push(this.addItem(err as string, "error"))
    }
    finally {
      // Store original expression string
      this.originalExpression = inputString;

      // Store items
      items.forEach(item => {
        this.items.push(this.addItem(item.value, item.type));
      });
      // Get blocks
      this.getBlocks(items);

      let message;
      error ? message = "Parser error." : message = "Parsing complete.";
      return {
        msg: message,
        items: items,
        blocks: this.blocks,
      }
    }
  }

  evaluateNext(items: Item[]): Evaluation {
    this.getBlocks(items);
    this.currentBlockId = this.getNextBlock();

    let blockResult: string,
        startIndex = 0,
        endIndex = 0;

    // Get start and end points of items[] for evaluation
    this.blocks.forEach(block => {
      if(block.id === this.currentBlockId) {
        startIndex = block.startIndex;
        endIndex = block.endIndex;
      }
    });

    blockResult = this.evaluate(items, startIndex, endIndex);
    this.getBlocks(items);

    if(items.length === 1) {
      this.evaluation = parseFloat(blockResult);
      return {
        complete: true,
        eval: parseFloat(blockResult),
        items: items,
        blocks: this.blocks
      }
    } else {
      return {
        complete: false,
        eval: parseFloat(blockResult),
        items: items,
        blocks: this.blocks
      }
    }
  }

  evaluateAll(items: Item[]): Evaluation {
    let result: Evaluation;

    do {
      let res = this.evaluateNext(items)
      result = {
        complete: res.complete,
        eval: this.evaluation,
        items: res.items,
        blocks: res.blocks,
      }
    } while (items.length > 1);

    return result;
  }

  getSourceString() {
    return this.originalExpression;
  }

  getSourceItems() {
    return this.items;
  }

  //#endregion
}
