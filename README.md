# ParsaJS
Library to parse and evaluate arithmetic expressions without eval()

Supports basic operators [ ** * / % + - ( ) ] and variables.

Order of operations: BEMDAS

## Usage
```
npm i @jaakkohurtta/parsajs
```

```javascript
import Parsa from "@jaakkohurtta/parsajs"
const myParser = new Parsa()

let parse = await myParser.parse('a*(20/8)*b,{"a":3,"b":2}')
let evaluation = await myParser.evaluateAll(parse.items)

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

	Params: string
	Returns a promise: 
		{ 
		  msg: string, 
		  items: [{ value, type}, ...] 
		}
	
**evaluateAll(items)**

Evaluates the expression string

	Params: array of expression items
	Returns a promise: 
		{ 
		  blocks: [{ ... }], 
		  complete: boolean (true), 
		  eval: number, 
		  items: [{ ... }] 
		}
**evaluateNext(items)**

Evaluates the next block according to order of operations

	Params: array of expression items
	Returns a promise: 
		{ 
		  blocks: [{ ... }], 
		  complete: boolean (false), 
		  eval: number, 
		  items: [{ ... }] 
		}
**getSourceString()**

Returns the original input string

**getSourceItems()**

Returns an array of parsed expression items

*License:* MIT
