<template>
    <div v-if="!isDisabled">
        <input
            v-if="isEditing"
            :id="id"
            v-model="numericValue"
            @blur="dataChanged"
        />
        <input v-else :id="id" v-model="value" @click="isEditing = true" />
    </div>
    <div v-else>
        <input :id="id" disabled :value="value" />
    </div>
</template>
<script lang="ts">
    import { Component, Emit, Prop, Vue } from "vue-property-decorator"

    @Component
    export default class CurrencyInput extends Vue {
        @Prop() amount!: number
        @Prop() currencyFilterName: string | undefined
        @Prop() id!: string
        @Prop() isDisabled: boolean | undefined
        isEditing = false
        numericValue = 0
        formattedValue = 0
        @Emit("data-changed")
        dataChanged() {
            this.formattedValue = this.numericValue
            this.isEditing = false
            return this.numericValue
        }
        //computed
        get value(): string {
            if (
                this.currencyFilterName &&
                this.$options &&
                this.$options.filters &&
                this.$options.filters[this.currencyFilterName]
            ) {
                const response = this.$options.filters[this.currencyFilterName](
                    this.amount
                )
                return response
            } else {
                const currencyFormatter = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD"
                })
                const response = currencyFormatter.format(this.amount)
                return response
            }
        }
        mounted() {
            this.numericValue = this.amount
        }
    }
</script>
