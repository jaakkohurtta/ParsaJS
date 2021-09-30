# ParsaJS
https://parsajs-demo.netlify.app/

Library to parse and evaluate arithmetic expressions without eval()

Supports basic operators [ ** * / % + - ( ) ] and variables.

Order of operations: BEMDAS

## Usage
```
$ npm i @jaakkohurtta/parsajs
```

```javascript
import Parsa from "@jaakkohurtta/parsajs"
const myParser = new Parsa()

let parse = myParser.parse('a*(20/8)*b,{"a":3,"b":2}')
let evaluation = myParser.evaluateAll()

console.log(evaluation)
	
// Log:
//	{
//	  complete: true,
//	  eval: 15, 
//	  items: [{ "15", "number" }]
//	  blocks: [{ id: 1, prio: 0, startIndex: 0, endIndex: 0 }],
//	}
```
### Methods
**parse(string)**

Parses an input string for evaluation

	Params: a string
	Returns an object: 
		{ 
      		  success: boolean,
		  msg: string, 
		}
	
**evaluateAll()**

Evaluates the expression string

	Returns an object: 
		{ 
		  blocks: [{ ... }], 
		  complete: boolean (true), 
		  eval: number, 
		  items: [{ ... }] 
		}

**evaluateNext()**

Evaluates the next block according to order of operations

	Returns an object: 
		{ 
		  blocks: [{ ... }], 
		  complete: boolean (false), 
		  eval: number, 
		  items: [{ ... }] 
		}

### Getters
**myParser.getSourceString**

Returns the original input string

**myParser.getItems**

Returns an array of parsed expression items

**myParser.getNextBlockId**

Returns the id of the next block to be evaluated

**myParser.getBlocks**

Returns an array of parsed items organized in blocks

### Tests
```
$ npm run test

PASS  tests/parsa.test.ts
  Parser tests
    ✓ Simple expression parsed correctly (3 ms)
    ✓ Intermediate expression parsed correctly (1 ms)
    ✓ Complex expression parsed correctly (1 ms)
    ✓ Expressiong with variables is parsed correctly (3 ms)
    ✓ Parsing fails if expression string containains NaNs
    ✓ Parsing fails with if expression starts with operator
    ✓ Parsing fails with if expression ends with operator
    ✓ Parsing fails with if an operator is misplaced (double operator)
    ✓ Parsing fails with odd number of parenthesis (1 ms)
  Eval tests
    ✓ Simple expression is evaluated correctly (1 ms)
    ✓ evaluateNext() works correctly (1 ms)
    ✓ Complex expression with variables is evaluated correctly (1 ms)
  Getters
    ✓ getSourceString returns correct value
    ✓ getItems returns correct values (1 ms)
    ✓ getBlocks returns correct values
    ✓ getNextBlockId returns correct value (1 ms)

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        1.572 s, estimated 2 s
```

*License:* MIT
