<template>
    <div id="detail">
        <div v-if="showEmptyMessage" class="emptyMessage">
            {{ requiredFieldsEmptyMessage }}
        </div>
        <div v-for="field in fieldsToBind" :key="field.column">
            <span>
                <label :for="field.column">{{ field.displayName }}</label>
                <currency-input
                    v-if="field.isCurrency"
                    :id="field.column"
                    v-model="recordToBind[field.column]"
                    :required="field.isRequired"
                />
                <select
                    v-else-if="field.isSelect"
                    :name="field.displayName"
                    :id="field.column"
                    v-model="recordToBind[field.column]"
                >
                    <option
                        v-for="value in field.selectValues"
                        :key="value"
                        :value="value"
                        >{{ value }}</option
                    >
                </select>
                <input
                    v-else
                    class="record"
                    type="text"
                    :id="field.column"
                    v-model="recordToBind[field.column]"
                    :required="field.isRequired"
                />
            </span>
        </div>
        <!-- <div v-for="field in regularFields" :key="field">
            <span>
                <label :for="field">{{ field }}</label>
                <input
                    class="record"
                    type="text"
                    :id="field.column"
                    v-model="recordToBind[field]"
                />
            </span>
        </div>
        <div v-for="field in currencyFields" :key="field">
            <span>
                <label :for="field">{{ field }}</label>
                <currency-input :id="field" v-model="recordToBind[field]" />
            </span>
        </div> -->
        <button @click.prevent="persistRecord">Save</button>
        <button @click.prevent="cancel">Cancel</button>
    </div>
</template>
<script lang="ts">
    import { Component, Prop, Vue, Emit } from "vue-property-decorator"
    import IColumnMetadata from "../models/ColumnMetadata"
    import CurrencyInput from "./currencyInput.vue"

    @Component({
        components: {
            CurrencyInput
        }
    })
    export default class GridDetail extends Vue {
        @Prop() private record!: Record<string, unknown>
        @Prop({ default: null })
        private fieldsToBind!: IColumnMetadata[] | null
        fields: string[] = []
        requiredFieldsEmptyMessage = ""
        showEmptyMessage = false
        //@Emit("persisted-record")
        persistRecord() {
            if (this.isReady()) {
                this.showEmptyMessage = false
                this.requiredFieldsEmptyMessage = ""
                this.$emit("persisted-record", this.recordToBind)
                //return this.recordToBind
            } else this.showEmptyMessage = true
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
        get hasCurrencyFields(): boolean {
            const hasCurrency = this.fieldsToBind
                ? this.fieldsToBind.some((obj) => obj.isCurrency)
                : false
            return hasCurrency
        }
        //Commented code here on purpose - rushed PR for dropdown
        // get currencyFields() {
        //     const fields = this.fieldsToBind
        //         ? this.fieldsToBind
        //               .filter((obj) => {
        //                   if (obj.isCurrency) return obj
        //               })
        //               .map((obj) => obj.column)
        //         : null
        //     return fields ? fields : []
        // }
        // get regularFields() {
        //     const fields = this.fieldsToBind
        //         ? this.fieldsToBind
        //               .filter((obj) => {
        //                   if (!obj.isCurrency) return obj
        //               })
        //               .map((obj) => obj.column)
        //         : null
        //     return fields ? fields : this.fields
        // }
        isReady(): boolean {
            const requiredFields = document.querySelectorAll("[required]")
            const emptyFields: string[] = []
            let isIncomplete = false
            requiredFields.forEach((element) => {
                const el = element as HTMLInputElement
                if (el && (!el.value || el.value.length <= 0)) {
                    isIncomplete = true
                    el.classList.add("empty")
                    emptyFields.push(el.id)
                } else el.classList.remove("empty")
            })
            if (emptyFields.length > 0) {
                this.requiredFieldsEmptyMessage = `Please add values for the following field(s):${emptyFields.join()}`
            }

            return !isIncomplete
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
    .empty {
        border-color: red;
        border-width: 2px;
    }
    .emptyMessage {
        font-size: 0.5em;
        color: red;
    }
</style>
