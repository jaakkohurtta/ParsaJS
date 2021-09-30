/** ParsaJS ***
 * @description : Library to parse and evaluate arithmetic expressions without eval()
 * @author      : Jaakko Hurtta
 * @version     : 1.1.0
 * @license     : MIT
 */
import { ParsaItem, ParsaBlock, Parse, Evaluation } from "./types";
export default class Parsa {
    private items;
    private blocks;
    private currentBlockId;
    private nextBlockId;
    private evaluation;
    private originalExpression;
    private parserMessage;
    constructor();
    private addItem;
    private clearItems;
    private evaluate;
    private validate;
    private parseBlocks;
    private getNextBlock;
    parse(inputString: string): Parse;
    evaluateNext(): Evaluation;
    evaluateAll(): Evaluation;
    get getSourceString(): string;
    get getNextBlockId(): number;
    get getItems(): ParsaItem[];
    get getBlocks(): ParsaBlock[];
}
//# sourceMappingURL=parsa.d.ts.map