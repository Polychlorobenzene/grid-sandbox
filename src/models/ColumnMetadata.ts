export default interface ColumnMetadata {
    column: string
    isNumeric: boolean
    validation: Function | null
}
