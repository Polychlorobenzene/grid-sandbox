<template>
    <div id="app">
        <HelloGrid />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from "vue-property-decorator"
    import { library } from "@fortawesome/fontawesome-svg-core"
    import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
    import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons"
    import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons"
    import { faAngleLeft } from "@fortawesome/free-solid-svg-icons"
    import { faAngleRight } from "@fortawesome/free-solid-svg-icons"
    import HelloGrid from "./components/HelloGrid.vue"

    //font-awesome setup
    //add fonts to library then register the component
    library.add(faAngleDoubleLeft)
    library.add(faAngleDoubleRight)
    library.add(faAngleLeft)
    library.add(faAngleRight)
    Vue.component("font-awesome-icon", FontAwesomeIcon)
    @Component({
        components: {
            HelloGrid
        }
    })
    export default class App extends Vue {}
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
