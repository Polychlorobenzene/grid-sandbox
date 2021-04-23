export default interface ColumnMetadata {
    column: string
    displayName?: string | undefined
    order: number
    maxLength?: number | undefined
    isNumeric: boolean
    isCurrency?: boolean | undefined
    isSelect?: boolean | undefined
    isRequired?: boolean | undefined
    selectValues?: string[] | undefined
    format: Function
}
