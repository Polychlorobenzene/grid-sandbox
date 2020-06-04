<template>
    <div class="hello">
        <h1>Grid Sandbox</h1>
        <button @click.prevent="getData">Get Data</button>
        <grid
            v-if="gridData && gridData.length > 0"
            :data="gridData"
            :columns="gridColumns"
            :pageSpan="gridPageRange"
            rowIdentifier="Atomic_Number"
        />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator"

    import grid from "./grid.vue"
    import periodic from "../assets/periodicTable.json"

    @Component({
        components: {
            grid
        }
    })
    export default class HelloGrid extends Vue {
        gridData: Array<any> = []
        gridColumns: string[] = []
        gridPageRange = 3

        //functions
        getData() {
            const data = periodic
            this.gridData = data

            const columns = [
                "Symbol",
                "Name",
                "Atomic_Number",
                "Melting_Point",
                "Boiling_Point"
            ]
            this.gridColumns = columns
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
//Cannot find module '../assets/periodicTable.json'. Consider using '--//' to
import module with '.json' extension
