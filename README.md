# ParsaJS
https://parsajs-demo.netlify.app/

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

let parse = myParser.parse('a*(20/8)*b,{"a":3,"b":2}')
let evaluation = myParser.evaluateAll(parse.items)

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
		  msg: string, 
		  items: [{ value, type}, ...],
      	  blocks: [{ id, prio, startIndex, endIndex }, ...]
		}
	
**evaluateAll(items)**

Evaluates the expression string

	Params: an array of expression items
	Returns an object: 
		{ 
		  blocks: [{ ... }], 
		  complete: boolean (true), 
		  eval: number, 
		  items: [{ ... }] 
		}
**evaluateNext(items)**

Evaluates the next block according to order of operations

	Params: an array of expression items
	Returns an object: 
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
