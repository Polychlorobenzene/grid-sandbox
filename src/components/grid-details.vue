<template>
    <div id="detail">
        <ul>
            <li v-for="field in fieldsToBind" :key="field">
                <span>
                    <label :for="field">{{ field }}</label>
                    <input type="text" :id="field" v-model="record[field]" />
                </span>
            </li>
        </ul>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue } from "vue-property-decorator"

    @Component
    export default class DataGridDetail extends Vue {
        @Prop() private record!: {}
        @Prop({ default: null })
        private fieldsToBind!: string[] | null
        fields: string[] = []

        mounted() {
            if (!this.fieldsToBind || this.fieldsToBind.length < 1) {
                const fields: string[] = this.fieldsToBind ? this.fields : []

                Object.keys(this.record).forEach((k) => {
                    fields.push(k)
                })
                this.fieldsToBind = fields
            }
        }
    }
</script>
<style scoped></style>
