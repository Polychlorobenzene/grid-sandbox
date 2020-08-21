<template>
    <div class="hello">
        <h1>Grid Sandbox</h1>
        <button
            v-if="!gridData || gridData.length === 0"
            @click.prevent="getData"
        >
            Get Data
        </button>
        <button @click.prevent="clearData">Empty Grid</button>
        <input id="readOnly" type="checkbox" v-model="isReadOnly" />
        <label for="readOnly">is Read Only</label>
        <select v-model="recordsPerPage" name="recordsPerPage">
            <option value="0">No Paging</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
        </select>
        <grid
            v-if="gridData && gridColumns && gridColumns.length > 0"
            :data="gridData"
            :columns="gridColumns"
            :pageSpan="gridPageRange"
            :rowIdentifier="rowIdentifier"
            :displayRecordsPerPage="recordsPerPage"
            :isReadOnly="isReadOnly"
            @record-added="addRecord"
            @records-deleted="deleteRecords"
        />
        <currency-input
            v-model="amount"
            id="textCurrency"
            :isDisabled="isReadOnly"
        />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator"

    import grid from "./grid.vue"
    import currencyInput from "./currencyInput.vue"
    //import periodicTable from "../assets/periodicTable.json"
    import itemList from "../assets/itemList.json"
    import ColumnMetadata from "../models/ColumnMetadata"

    @Component({
        components: {
            grid,
            currencyInput
        }
    })
    export default class HelloGrid extends Vue {
        // Not specifying any causes compilation error
        // eslint-disable-next-line
        gridData: any[] = []
        gridColumns: ColumnMetadata[] = []
        gridPageRange = 3
        rowIdentifier = "Id" //"Atomic_Number"
        recordsPerPage = 10
        isReadOnly = false
        amount = 300

        //functions
        getData() {
            this.gridColumns
            this.gridData = itemList //periodicTable
            const columns: Array<ColumnMetadata> = [
                {
                    column: "Name",
                    isNumeric: false,
                    format: (value: string) => {
                        return value
                    }
                },
                {
                    column: "Price",
                    isNumeric: true,
                    isCurrency: true,
                    format: (value: number) => {
                        const formatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD"
                        })
                        return formatter.format(value)
                    }
                },
                {
                    column: "Markup",
                    isNumeric: true,
                    isCurrency: true,
                    format: (value: number) => {
                        const formatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD"
                        })
                        return formatter.format(value)
                    }
                }
            ]
            this.gridColumns = columns
        }
        clearData() {
            this.gridData = []
            if (!this.gridColumns || this.gridColumns.length < 1) {
                const columns = [
                    {
                        column: "column 1",
                        isNumeric: false,
                        format: (value: any) => {
                            value
                        }
                    },
                    {
                        column: "column 2",
                        isNumeric: false,
                        format: (value: any) => {
                            value
                        }
                    },
                    {
                        column: "column 3",
                        isNumeric: false,
                        format: (value: any) => {
                            value
                        }
                    }
                ]
                this.gridColumns = columns
                this.rowIdentifier = "id"
            }
        }
        deleteRecords(ids: number[]) {
            const identifier = this.rowIdentifier
            if (this.gridData) {
                this.gridData = this.gridData.filter((r) => {
                    const obj = r
                    if (!ids.includes(obj[identifier])) return obj
                })
            }
        }
        addRecord(record: Record<string, unknown>) {
            //alert("Record Added:" + JSON.stringify(record))
            //this.gridData.splice(0, 0, record)
        }
        textChanged(value: number) {
            this.amount = value
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin: 40px 0 0;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: inline-block;
        margin: 0 10px;
    }
    a {
        color: #42b983;
    }
</style>
