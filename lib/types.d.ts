export declare type Item = {
    value: string;
    type: string;
};
export declare type Block = {
    id: number;
    prio: number;
    startIndex: number;
    endIndex: number;
};
export declare type Parse = {
    msg: string;
    items: Item[];
    blocks: Block[];
};
export declare type Evaluation = {
    complete: boolean;
    eval: number;
    items: Item[];
    blocks: Block[];
};
//# sourceMappingURL=types.d.ts.map