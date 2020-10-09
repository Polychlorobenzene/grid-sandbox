<template>
    <span v-if="!isDisabled" class="currency-input-class-style">
        <input
            :id="id"
            :ref="reference"
            v-model="valueBuffer"
            @blur="dataChanged"
        />
    </span>
    <span v-else>
        <input :id="id" :ref="reference" :v-model="valueBuffer" disabled />
    </span>
</template>

<script lang="ts">
    import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator"
    import Inputmask from "inputmask"

    @Component
    export default class CurrencyInput extends Vue {
        @Prop() private initialValue: string | undefined
        @Prop() id!: string
        @Prop() value!: string
        @Prop() isDisabled: boolean | undefined
        //data
        reference = this.id + "_currency"
        valueBuffer: string = this.value
        unmaskedBuffer: string | undefined
        //computed and watch
        get valueUnmasked(): string {
            if (this.unmaskedBuffer)
                return Inputmask.unmask(this.unmaskedBuffer, {
                    alias: "usCurrency"
                })
            else return this.valueBuffer
        }
        @Watch("isDisabled") onIsDisabledChanged() {
            //Forces the mask to re-evaluate when disabled state changes
            this.$nextTick(() => {
                Inputmask.extendAliases({
                    usCurrency: {
                        alias: "currency",
                        allowMinus: false,
                        prefix: "$"
                    }
                })
                Inputmask({ alias: "usCurrency" }).mask(this.id)
                Inputmask.setValue(this.id, this.valueBuffer)
            })
        }
        //events
        @Emit("input")
        dataChanged(val: Event) {
            const eventTarget = val.target as HTMLInputElement
            const targetVal = eventTarget.value
            this.unmaskedBuffer = targetVal
            console.info(
                `maskedValue = ${targetVal} and unmasked = ${this.valueUnmasked}`
            )
            return this.valueUnmasked
        }
        //lifecycle
        mounted() {
            Inputmask.extendAliases({
                usCurrency: {
                    alias: "currency",
                    allowMinus: false,
                    prefix: "$"
                }
            })
            Inputmask({ alias: "usCurrency" }).mask(this.id)
            if (this.initialValue) this.value = this.initialValue
        }
    }
</script>

<style scoped>
    .currency-input-class-style {
        color: black;
        text-align: left;
    }
</style>
