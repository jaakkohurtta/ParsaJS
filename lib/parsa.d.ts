/** ParsaJS ***
 * @description : Library to parse and evaluate arithmetic expressions without eval()
 * @author      : Jaakko Hurtta
 * @version     : 1.1.0
 * @license     : MIT
 */
import { Item, Block } from "./types";
export default class Parsa {
    private _items;
    private _blocks;
    private _currentBlockId;
    private _evaluation;
    private _originalExpression;
    constructor();
    private _addItem;
    private _clearItems;
    private _evaluate;
    private _validate;
    private _getBlocks;
    private _getNextBlock;
    parse(inputString: string): {
        msg: string;
        items: Item[];
        blocks: Block[];
    };
    evaluateNext(items: Item[]): {
        complete: boolean;
        eval: number;
        items: Item[];
        blocks: Block[];
    };
    evaluateAll(items: Item[]): {};
    getSourceString(): string;
    getSourceItems(): Item[];
}
//# sourceMappingURL=parsa.d.ts.map