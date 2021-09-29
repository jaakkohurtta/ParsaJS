/** ParsaJS ***
 * @description : Library to parse and evaluate arithmetic expressions without eval()
 * @author      : Jaakko Hurtta
 * @version     : 1.1.0
 * @license     : MIT
 */
import { Item, Parse, Evaluation } from "./types";
export default class Parsa {
    private items;
    private blocks;
    private currentBlockId;
    private evaluation;
    private originalExpression;
    constructor();
    private addItem;
    private clearItems;
    private evaluate;
    private validate;
    private getBlocks;
    parse(inputString: string): Parse;
    getNextBlock(): number;
    evaluateNext(items: Item[]): Evaluation;
    evaluateAll(items: Item[]): Evaluation;
    getSourceString(): string;
    getSourceItems(): Item[];
}
//# sourceMappingURL=parsa.d.ts.map