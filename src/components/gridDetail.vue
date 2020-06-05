<template>
    <div id="detail">
        <div v-for="field in fieldsToBind" :key="field">
            <span>
                <label :for="field">{{ field }}</label>
                <input type="text" :id="field" v-model="recordToBind[field]" />
            </span>
        </div>
        <button @click.prevent="persistRecord()">Save</button>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue, Emit } from "vue-property-decorator"

    @Component
    export default class GridDetail extends Vue {
        @Prop() private record!: Record<string, unknown>
        @Prop({ default: null })
        private fieldsToBind!: string[] | null
        //private deepRecord: Record<string, unknown> | null = null
        // private shallowRecord: Record<string, unknown> = Object.assign(
        //     {},
        //     this.record
        // )
        fields: string[] = []
        @Emit("persisted-record")
        persistRecord() {
            return this.recordToBind
        }
        get recordToBind(): Record<string, unknown> {
            return Object.assign({}, this.record)
        }
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
