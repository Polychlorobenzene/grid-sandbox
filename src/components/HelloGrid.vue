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
        <grid
            v-if="gridData && gridColumns && gridColumns.length > 0"
            :data="gridData"
            :columns="gridColumns"
            :pageSpan="gridPageRange"
            :rowIdentifier="rowIdentifier"
            :displayRecordsPerPage="recordsPerPage"
            @record-added="addRecord"
            @records-deleted="deleteRecords"
        />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator"

    import grid from "./grid.vue"
    import periodicTable from "../assets/periodicTable.json"
    import ColumnMetadata from "../models/ColumnMetadata"

    @Component({
        components: {
            grid
        }
    })
    export default class HelloGrid extends Vue {
        // Not specifying any causes compilation error
        // eslint-disable-next-line
        gridData: any[] = []
        gridColumns: ColumnMetadata[] = []
        gridPageRange = 3
        rowIdentifier = "Atomic_Number"
        recordsPerPage = 10

        //functions
        getData() {
            this.gridColumns
            this.gridData = periodicTable
            const columns: Array<ColumnMetadata> = [
                {
                    column: "Symbol",
                    isNumeric: false,
                    format: (value: string) => {
                        return value
                    },
                    order: 1
                },
                {
                    column: "Name",
                    isNumeric: false,
                    format: (value: string) => {
                        return value
                    },
                    order: 2
                },
                {
                    column: "Melting_Point",
                    isNumeric: true,
                    format: (value: string) => {
                        return value
                    },
                    order: 3
                },
                {
                    column: "Boiling_Point",
                    isNumeric: true,
                    format: (value: string) => {
                        return value
                    },
                    order: 4
                },
                {
                    column: "Lattice",
                    isNumeric: false,
                    isSelect: true,
                    selectValues: [
                        "HEX",
                        "BCC",
                        "TET",
                        "CUB",
                        "MCL",
                        "DIA",
                        "RHL"
                    ],
                    format: (value: string) => {
                        return value
                    },
                    order: 5
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
                        format: (value: string) => {
                            return value
                        },
                        order: 1
                    },
                    {
                        column: "column 2",
                        isNumeric: false,
                        format: (value: string) => {
                            return value
                        },
                        order: 2
                    },
                    {
                        column: "column 3",
                        isNumeric: false,
                        format: (value: string) => {
                            return value
                        },
                        order: 3
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
