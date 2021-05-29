import Parsa from "./parsa.js";

const myParser = new Parsa();

let parse = myParser.parse('a*(20/8)*b,{"a":3,"b":2}');
let evaluation = myParser.evaluateAll(parse.items);

console.log("Sup", evaluation);
