import Parsa from "./parsa"

const parsa = new Parsa();

describe("Parser tests", () => {
//#region Parser works
  test("Simple expression parsed correctly", () => {
    const parse = parsa.parse("2+2*10");
  
    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.items.length).toBe(5);
    expect(parse.blocks.length).toBe(1);
  });
  test("Intermediate expression parsed correctly", () => {
    const parse = parsa.parse("2+2*(10-2/(-8))");

    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.items.length).toBe(13);
    expect(parse.blocks.length).toBe(4);
  });
  test("Complex expression parsed correctly", () => {
    const parse = parsa.parse("-200.55/20+(8.75*10)**2-10+(5*(-10+2))");
    
    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.items.length).toBe(23);
    expect(parse.blocks.length).toBe(6);
  });
  test("Expressiong with variables is parsed correctly", () => {
    const parse = parsa.parse('20*a+(50/44),{"a":6}');

    expect(parse.msg).toBe("Parsing complete.");
    expect(parse.items[2].value).toBe("6");
    expect(parse.items.length).toBe(9);
    expect(parse.blocks.length).toBe(2);

  });
//#endregion

//#region Parser fails
  test("Parsing fails if expression string containains NaNs", () => {
    const parse = parsa.parse("*20+20+asdf3");

    expect(parse.msg).toBe("Parser error.");
    expect(parse.items[0].value).toBe("Parser error: Not a valid number. (asdf3)");
    expect(parse.items[0].type).toBe("error");
  });
  test("Parsing fails with if expression starts with operator", () => {
    const parse = parsa.parse("*20+20");

    expect(parse.msg).toBe("Parser error.");
    expect(parse.items[0].value).toBe("Parser error: Misplaced operator at first index.");
    expect(parse.items[0].type).toBe("error");
  });
  test("Parsing fails with if expression ends with operator", () => {
    const parse = parsa.parse("20+20-");

    expect(parse.msg).toBe("Parser error.");
    expect(parse.items[0].value).toBe("Parser error: Misplaced operator at last index.");
    expect(parse.items[0].type).toBe("error");
  });
  test("Parsing fails with if an operator is misplaced (double operator)", () => {
    const parse = parsa.parse("20+20//4");

    expect(parse.msg).toBe("Parser error.");
    expect(parse.items[0].value).toBe("Parser error: Misplaced operator.");
    expect(parse.items[0].type).toBe("error");
  });
  test("Parsing fails with odd number of parenthesis", () => {
    const parse = parsa.parse("20+20*(20+(5.5/2)))");

    expect(parse.msg).toBe("Parser error.");
    expect(parse.items[0].value).toBe("Parser error: Odd number of parenthesis.");
    expect(parse.items[0].type).toBe("error");
  });
  //#endregion
})

describe("Eval tests", () => {
  //#region Eval tests
  test("Simple expression is evaluated correctly", () => {
    const parse = parsa.parse("20*10-50");
    const evaluation = parsa.evaluateAll(parse.items);

    expect(evaluation.eval).toBe(eval("20*10-50"));
    expect(evaluation.complete).toBe(true);
    expect(evaluation.items[0].value).toBe("150");
    expect(evaluation.items[0].type).toBe("number");
  });
  test("Complex expression with variables is evaluated correctly", () => {
    const parse = parsa.parse('20+(5.5-a/4.333*(20**-2)*b)-100/20*(10**10-(5*5/0.44)),{"a":44,"b":12}');
    const evaluation = parsa.evaluateAll(parse.items);

    expect(evaluation.eval).toBe(eval("20+(5.5-44/4.333*(20**-2)*12)-100/20*(10**10-(5*5/0.44))"));
    expect(evaluation.complete).toBe(true);
    expect(evaluation.items[0].value).toBe("-49999999690.71373");
    expect(evaluation.items[0].type).toBe("number");
  });
  //#endregion
});