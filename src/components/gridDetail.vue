<template>
    <div id="detail">
        <div v-for="field in fieldsToBind" :key="field">
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
        <button @click.prevent="persistRecord()">Save</button>
        <button @click.prevent="cancel()">Cancel</button>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue, Emit } from "vue-property-decorator"

    @Component
    export default class GridDetail extends Vue {
        @Prop() private record!: Record<string, unknown>
        @Prop({ default: null })
        private fieldsToBind!: string[] | null
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
