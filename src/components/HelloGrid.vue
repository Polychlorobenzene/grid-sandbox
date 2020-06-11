<template>
    <div class="hello">
        <h1>Grid Sandbox</h1>
        <button
            v-if="!gridData || gridData.length === 0"
            @click.prevent="getData"
        >
            Get Data
        </button>
        <grid
            v-if="gridData && gridData.length > 0"
            :data="gridData"
            :columns="gridColumns"
            :pageSpan="gridPageRange"
            :rowIdentifier="rowIdentifier"
            @records-deleted="deleteRecords"
        />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator"

    import grid from "./grid.vue"
    import periodicTable from "../assets/periodicTable.json"

    @Component({
        components: {
            grid
        }
    })
    export default class HelloGrid extends Vue {
        // Not specifying any causes compilation error
        // eslint-disable-next-line
        gridData: any[] = []
        gridColumns: string[] = []
        gridPageRange = 3
        rowIdentifier = "Atomic_Number"

        //functions
        getData() {
            this.gridData = periodicTable
            const columns = ["Symbol", "Name", "Melting_Point", "Boiling_Point"]
            this.gridColumns = columns
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
        addRecord(record: Record<string, any>) {
            this.gridData.push(record)
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
