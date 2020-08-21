<template>
    <span v-if="!isDisabled">
        <input
            v-if="isEditing"
            :id="id"
            :ref="reference"
            v-model="numericValue"
            @blur="dataChanged"
        />
        <input
            v-else
            :id="id"
            :ref="reference"
            v-model="formattedValue"
            @click="isEditing = true"
        />
    </span>
    <span v-else>
        <input :id="id" disabled :value="formattedValue" :ref="reference" />
    </span>
</template>
<script lang="ts">
    import { Component, Emit, Prop, Vue } from "vue-property-decorator"

    @Component
    export default class CurrencyInput extends Vue {
        @Prop() value!: number
        @Prop() currencyFilterName: string | undefined
        @Prop() id!: string
        @Prop() isDisabled: boolean | undefined
        reference = this.id + "_currency"
        isEditing = false
        numericValue = 0
        @Emit("input")
        dataChanged() {
            this.isEditing = false
            return this.numericValue
        }
        //computed
        get formattedValue(): string {
            if (
                this.currencyFilterName &&
                this.$options &&
                this.$options.filters &&
                this.$options.filters[this.currencyFilterName]
            ) {
                const response = this.$options.filters[this.currencyFilterName](
                    this.numericValue
                )
                return response
            } else {
                const currencyFormatter = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD"
                })
                const response = currencyFormatter.format(this.numericValue)
                return response
            }
        }
        mounted() {
            this.numericValue = this.value
        }
    }
</script>
