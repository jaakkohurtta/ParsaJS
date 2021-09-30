export enum ParsaItemType {
  NUMBER = "number",
  OPERATOR = "operator",
  PARENTHESIS = "parenthesis",
  ERROR = "error"
}

export type ParsaItem = {
  type: ParsaItemType,
  value: string
}

export type ParsaBlock = {
    id: number,
    prio: number,
    startIndex: number,
    endIndex: number
}

export type Parse = {
    success: boolean,
    msg: string,
}

export type Evaluation = {
    complete: boolean,
    eval: number,
    items: ParsaItem[],
    blocks: ParsaBlock[]
}