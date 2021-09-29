export type Item = {
    value: string,
    type: string
}

export type Block = {
    id: number,
    prio: number,
    startIndex: number,
    endIndex: number
}

export type Parse = {
    msg: string,
    items: Item[],
    blocks: Block[]
}

export type Evaluation = {
    complete: boolean,
    eval: number,
    items: Item[],
    blocks: Block[]
}