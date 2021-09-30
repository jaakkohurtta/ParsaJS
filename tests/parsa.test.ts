import Parsa from "../src/parsa";
import { ParsaItem, ParsaItemType, ParsaBlock } from "../src/types";

const parsa = new Parsa();

describe("Parser tests", () => {
//#region Parser works
  test("Simple expression parsed correctly", () => {
    const parse = parsa.parse("2+2*10");
  
    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.success).toBe(true);
    expect(parsa.getItems.length).toBe(5);
    expect(parsa.getBlocks.length).toBe(1);
  
  });
  test("Intermediate expression parsed correctly", () => {
    const parse = parsa.parse("2+2*(10-2/(-8))");

    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.success).toBe(true);
    expect(parsa.getItems.length).toBe(13);
    expect(parsa.getBlocks.length).toBe(4);
  });
  test("Complex expression parsed correctly", () => {
    const parse = parsa.parse("-200.55/20+(8.75*10)**2-10+(5*(-10+2))");
    
    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.success).toBe(true);
    expect(parsa.getItems.length).toBe(23);
    expect(parsa.getBlocks.length).toBe(6);
  });
  test("Expressiong with variables is parsed correctly", () => {
    const parse = parsa.parse('20*a+(50/44),{"a":6}');

    const items = parsa.getItems;

    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.success).toBe(true);
    expect(items[2].value).toBe("6");
    expect(parsa.getItems.length).toBe(9);
    expect(parsa.getBlocks.length).toBe(2);

  });
//#endregion

//#region Parser fails
  test("Parsing fails if expression string containains NaNs", () => {
    const parse = parsa.parse("*20+20+asdf3");

    expect(parse.success).toBe(false);
    expect(parse.msg).toBe("Parser error: Not a valid number. (asdf3)");
  });
  test("Parsing fails with if expression starts with operator", () => {
    const parse = parsa.parse("*20+20");

    expect(parse.success).toBe(false);
    expect(parse.msg).toBe("Parser error: Misplaced operator at first index.");
  });
  test("Parsing fails with if expression ends with operator", () => {
    const parse = parsa.parse("20+20-");

    expect(parse.success).toBe(false);
    expect(parse.msg).toBe("Parser error: Misplaced operator at last index.");
  });
  test("Parsing fails with if an operator is misplaced (double operator)", () => {
    const parse = parsa.parse("20+20//4");

    expect(parse.success).toBe(false);
    expect(parse.msg).toBe("Parser error: Misplaced operator.");
  });
  test("Parsing fails with odd number of parenthesis", () => {
    const parse = parsa.parse("20+20*(20+(5.5/2)))");

    expect(parse.success).toBe(false);
    expect(parse.msg).toBe("Parser error: Odd number of parenthesis.");
  });
  //#endregion
})

describe("Eval tests", () => {
  //#region Eval tests
  test("Simple expression is evaluated correctly", () => {
    const parse = parsa.parse("20*10-50");
    const evaluation = parsa.evaluateAll();

    expect(evaluation.eval).toBe(eval("20*10-50"));
    expect(evaluation.complete).toBe(true);
    expect(evaluation.items[0].value).toBe("150");
    expect(evaluation.items[0].type).toBe("number");
  });
  test("evaluateNext() works correctly", () => {
    const parse = parsa.parse("20+(10*(5+5))");

    let evaluation = parsa.evaluateNext();
    expect(evaluation.eval).toBe(eval("5+5"));
    expect(parsa.getNextBlockId).toBe(3);

    evaluation = parsa.evaluateNext();
    expect(evaluation.eval).toBe(eval("10*10"));
    expect(parsa.getNextBlockId).toBe(2);

    evaluation = parsa.evaluateNext();
    expect(evaluation.eval).toBe(eval("20+100"));
    expect(parsa.getNextBlockId).toBe(1);
  });
  test("Complex expression with variables is evaluated correctly", () => {
    const parse = parsa.parse('20+(5.5-a/4.333*(20**-2)*b)-100/20*(10**10-(5*5/0.44)),{"a":44,"b":12}');
    const evaluation = parsa.evaluateAll();

    expect(evaluation.eval).toBe(eval("20+(5.5-44/4.333*(20**-2)*12)-100/20*(10**10-(5*5/0.44))"));
    expect(evaluation.complete).toBe(true);
    expect(evaluation.items[0].value).toBe("-49999999690.71373");
    expect(evaluation.items[0].type).toBe("number");
  });
  //#endregion
});

describe("Getters", () => {
  test("getSourceString returns correct value", () => {
    const parse = parsa.parse("20+(10*(5+5))");

    expect(parsa.getSourceString).toBe("20+(10*(5+5))");
  });
  test("getItems returns correct values", () => {
    const parse = parsa.parse("20+(10*(5+5))");

    const expectedItems: ParsaItem[] = [];
    expectedItems.push({ type: ParsaItemType.NUMBER, value: "20" });
    expectedItems.push({ type: ParsaItemType.OPERATOR, value: "+" });
    expectedItems.push({ type: ParsaItemType.PARENTHESIS, value: "(" });
    expectedItems.push({ type: ParsaItemType.NUMBER, value: "10" });
    expectedItems.push({ type: ParsaItemType.OPERATOR, value: "*" });
    expectedItems.push({ type: ParsaItemType.PARENTHESIS, value: "(" });
    expectedItems.push({ type: ParsaItemType.NUMBER, value: "5" });
    expectedItems.push({ type: ParsaItemType.OPERATOR, value: "+" });
    expectedItems.push({ type: ParsaItemType.NUMBER, value: "5" });
    expectedItems.push({ type: ParsaItemType.PARENTHESIS, value: ")" });
    expectedItems.push({ type: ParsaItemType.PARENTHESIS, value: ")" });

    expect(JSON.stringify(parsa.getItems)).toBe(JSON.stringify(expectedItems));
  });
  test("getBlocks returns correct values", () => {
    const parse = parsa.parse("20+(10*5)/7");

    const expectedBlocks: ParsaBlock[] = [];
    expectedBlocks.push({ id: 1, prio: 0, startIndex: 0, endIndex: 1 });
    expectedBlocks.push({ id: 2, prio: 1, startIndex: 2, endIndex: 6 });
    expectedBlocks.push({ id: 3, prio: 0, startIndex: 7, endIndex: 8 });

    expect(JSON.stringify(parsa.getBlocks)).toBe(JSON.stringify(expectedBlocks));
  });
  test("getNextBlockId return correct value", () => {
    const parse = parsa.parse("20+(10*5)/7");

    expect(parsa.getNextBlockId).toBe(1);
  });
});
