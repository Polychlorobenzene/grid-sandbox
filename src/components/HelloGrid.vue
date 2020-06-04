<template>
    <div class="hello">
        <h1>Grid Sandbox</h1>
        <button @click.prevent="getData">Get Data</button>
        <grid
            :data="gridData"
            :columns="gridColumns"
            :pageSpan="gridPageRange"
        />
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from "vue-property-decorator"

    import grid from "./grid.vue"

    @Component({
        components: {
            grid
        }
    })
    export default class HelloGrid extends Vue {
        gridData: any[] = []
        gridColumns: string[] = []
        gridPageRange = 3

        //functions
        GetData() {
            this.gridData = []
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
