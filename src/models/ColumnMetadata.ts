export default interface ColumnMetadata {
    column: string
    isNumeric: boolean
    isCurrency?: boolean | undefined
    format: Function | null
}
