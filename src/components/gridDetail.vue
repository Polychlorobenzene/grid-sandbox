<template>
    <div id="detail">
        <div v-for="field in regularFields" :key="field">
            <span>
                <label :for="field">{{ field }}</label>
                <input
                    class="record"
                    type="text"
                    :id="field"
                    v-model="recordToBind[field]"
                />
            </span>
        </div>
        <div v-for="field in currencyFields" :key="field">
            <span>
                <label :for="field">{{ field }}</label>
                <currency-input :id="field" v-model="recordToBind[field]" />
            </span>
        </div>
        <button @click.prevent="persistRecord()">Save</button>
        <button @click.prevent="cancel()">Cancel</button>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue, Emit } from "vue-property-decorator"
    import IColumnMetadata from "../models/ColumnMetadata"
    import currencyInput from "./currencyInput.vue"

    @Component({
        components: {
            currencyInput
        }
    })
    export default class GridDetail extends Vue {
        @Prop() private record!: Record<string, unknown>
        @Prop({ default: null })
        private fieldsToBind!: IColumnMetadata[] | null
        @Prop({ default: false })
        private isAdd!: boolean
        fields: string[] = []
        @Emit("persisted-record")
        persistRecord() {
            return this.recordToBind
        }
        @Emit("cancel")
        cancel() {
            const textBoxes = document.getElementsByClassName("record")
            for (let i = 0; i < textBoxes.length; i++) {
                const textbox = textBoxes[i] as HTMLInputElement
                if (textbox) {
                    const field = textbox.id
                    const value = this.record[field] as string
                    if (value) {
                        textbox.value = value
                        this.recordToBind[field] = value
                    }
                }
            }
        }
        textChanged(record: Record<string, unknown>) {
            alert("Data Changed" + JSON.stringify(record))
        }
        get recordToBind(): Record<string, unknown> {
            return Object.assign({}, this.record)
        }
        get hasCurrencyFields(): boolean {
            const hasCurrency = this.fieldsToBind?.some((obj) => obj.isCurrency)
            return hasCurrency ? hasCurrency : false
        }
        get currencyFields() {
            const fields = this.fieldsToBind
                ?.filter((obj) => {
                    if (obj.isCurrency) return obj
                })
                .map((obj) => obj.column)
            return fields ? fields : []
        }
        get regularFields() {
            const fields = this.fieldsToBind
                ?.filter((obj) => {
                    if (!obj.isCurrency) return obj
                })
                .map((obj) => obj.column)
            return fields ? fields : this.fields
        }
        mounted() {
            if (!this.fieldsToBind || this.fieldsToBind.length < 1) {
                const fields: string[] = this.fields ? this.fields : []

                Object.keys(this.record).forEach((k) => {
                    fields.push(k)
                })
                this.fields = fields
            }
        }
    }
</script>
<style scoped>
    .inline {
        display: inline;
    }
</style>
