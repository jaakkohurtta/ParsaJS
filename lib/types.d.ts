export declare enum ParsaItemType {
    NUMBER = "number",
    OPERATOR = "operator",
    PARENTHESIS = "parenthesis",
    ERROR = "error"
}
export declare type ParsaItem = {
    type: ParsaItemType;
    value: string;
};
export declare type ParsaBlock = {
    id: number;
    prio: number;
    startIndex: number;
    endIndex: number;
};
export declare type Parse = {
    success: boolean;
    msg: string;
};
export declare type Evaluation = {
    complete: boolean;
    eval: number;
    items: ParsaItem[];
    blocks: ParsaBlock[];
};
//# sourceMappingURL=types.d.ts.map