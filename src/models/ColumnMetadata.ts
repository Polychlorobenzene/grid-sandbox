export default interface ColumnMetadata {
    column: string
    order: number
    isNumeric: boolean
    isCurrency?: boolean | undefined
    isSelect?: boolean | undefined
    selectValues?: string[] | undefined
    format: Function
}
