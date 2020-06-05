<template>
    <div class="dataGrid">
        <div v-if="pageCount" id="gridNavTop">
            <h3>Results Page: {{ currentPage }} out of {{ pageCount }}</h3>
            <a
                :disabled="isFirstPage"
                class="btn"
                href
                id="firstPage"
                @click.prevent="getPageResults(1)"
            >
                <font-awesome-icon
                    :icon="['fas', 'angle-double-left']"
                    title="First Page"
                    aria-hidden="true"
                    aria-label="First Page"
                    class="icon"
                ></font-awesome-icon>
            </a>
            <a
                :disabled="isFirstPage"
                class="btn"
                id="previousPage"
                @click.prevent="getPageResults(currentPage - 1)"
            >
                <font-awesome-icon
                    :icon="['fas', 'angle-left']"
                    title="First Page"
                    aria-hidden="true"
                    aria-label="Previous Page"
                    class="icon"
                ></font-awesome-icon>
            </a>
            <span class="page-span" id="page-span">
                <span
                    :id="'page-span-' + item.page"
                    v-for="(item, index) in visiblePages"
                    :key="item.page"
                >
                    <a
                        href
                        @click.prevent="currentPage = item.page"
                        :class="item.isCurrentPage ? 'make-bold' : ''"
                        >{{ item.page }}</a
                    >
                    <span v-if="index + 1 < visiblePages.length">,</span>
                </span>
            </span>
            <a
                :disabled="isLastPage"
                class="btn"
                href
                id="nextPage"
                @click.prevent="getPageResults(currentPage + 1)"
            >
                <font-awesome-icon
                    :icon="['fas', 'angle-right']"
                    title="First Page"
                    aria-hidden="true"
                    aria-label="Next Page"
                    class="icon"
                ></font-awesome-icon>
            </a>
            <a
                :disabled="isLastPage"
                class="btn"
                href
                id="lastPage"
                @click.prevent="getPageResults(pageCount)"
            >
                <font-awesome-icon
                    :icon="['fas', 'angle-double-right']"
                    title="First Page"
                    aria-hidden="true"
                    aria-label="Last Page"
                    class="icon"
                ></font-awesome-icon>
            </a>
            <input
                type="text"
                id="filter"
                v-model="filterTextBuffer"
                @keyup="delayFilter"
            />
            <label for="filter">Filter</label>
        </div>
        <table>
            <thead>
                <tr>
                    <th v-if="dataColumns.length > 0 && rowIdentifier">
                        {{ rowIdentifier }}
                    </th>
                    <th
                        v-for="key in dataColumns"
                        :key="key"
                        @click="sortBy(key)"
                        :class="{ active: sortKey == key }"
                    >
                        {{ key | capitalize }}
                        <span
                            class="arrow"
                            :class="sortOrders[key] > 0 ? 'asc' : 'dsc'"
                        ></span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="entry in displayData"
                    :key="entry[`${rowIdentifier}`]"
                    :id="'row' + entry[`${rowIdentifier}`]"
                    @click="selectRow(entry[`${rowIdentifier}`])"
                >
                    <td v-if="rowIdentifier">
                        <input
                            type="checkbox"
                            :id="entry[`${rowIdentifier}`]"
                            @click="selectRow(entry[`${rowIdentifier}`])"
                        />
                    </td>

                    <td v-for="key in dataColumns" :key="key">
                        {{ entry[key] }}
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="delete" v-if="isRowSelected">
            <button>Delete Selected Rows</button>
        </div>
    </div>
</template>

<script lang="ts">
    /* eslint-disable @typescript-eslint/no-explicit-any */
    import { Component, Prop, Vue } from "vue-property-decorator"

    //import DataGridTable from "./DataGridTable.vue"
    import GridPage from "../models/GridPage"

    @Component({
        components: {
            // DataGridTable
        },
        filters: {
            capitalize(str: string) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            }
        }
    })
    export default class DataGrid extends Vue {
        @Prop() private data!: [{}]
        @Prop() private rowIdentifier!: number
        @Prop() private columns!: string[]
        @Prop() private pageSpan!: number
        //data
        timer: number | null = null
        selectedRowId: number | null = null
        dataColumnsStaging: string[] = []
        filterTextBuffer = ""
        private filterTextDelayed: string | null = null
        filteredData: any[] = []
        displayRecordCount = 10
        currentPage = 1
        sortOrders: any = {}
        sortKey = ""
        sort(key: string) {
            this.sortOrders[key] = 1
        }
        isRowSelected = false
        //functions
        sortBy(key: string) {
            //Changing sortKey to empty string before assigning the value
            // forces the displayData getter to always be computed
            this.sortKey = ""
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
            //write function to store the whole filter text then set it when the len > 3
        }
        getPageResults(page: number) {
            if (page >= 1 && page <= this.pageCount) {
                this.currentPage = page
            }
        }
        setFilterText() {
            alert(this.filterTextBuffer)
            this.filterText = this.filterTextBuffer
        }
        delayFilter() {
            if (this.timer) {
                clearTimeout(this.timer)
                this.timer = null
            }
            this.timer = setTimeout(() => {
                this.filterText = this.filterTextBuffer
            }, 300)
        }
        selectRow(id: number) {
            //debugger
            const row = document.getElementById("row" + id)
            const checkbox: HTMLInputElement = document.getElementById(
                String(id)
            ) as HTMLInputElement
            if (checkbox && row) {
                if (!checkbox.checked) {
                    row.setAttribute("class", "highlight")
                    this.selectedRowId = id
                    this.isRowSelected = true
                    checkbox.checked = true
                } else {
                    row.removeAttribute("class")
                    this.selectedRowId = null
                    checkbox.checked = false
                }
            }
        }
        //getters and setters
        get filterText(): string | null {
            return this.filterTextDelayed
        }
        set filterText(value: string | null) {
            this.filterTextDelayed = value
        }
        get dataColumns(): string[] {
            if (this.columns && this.columns.length > 0) {
                this.dataColumnsStaging = this.columns
            } else if (
                this.data.length > 0 &&
                this.dataColumnsStaging.length < 1
            ) {
                const fields: string[] = []
                const record = this.data[0]
                Object.keys(record).forEach((k: string) => {
                    fields.push(k)
                })
                this.dataColumnsStaging = fields
            }
            return this.dataColumnsStaging
        }
        get displayData(): any[] {
            const filterKey = this.filterText && this.filterText.toLowerCase()
            const textKey: string = filterKey ? filterKey : ""
            const startIndex: number =
                this.currentPage * this.displayRecordCount
            this.filteredData = this.data
            let displayData = []
            let sortedData: any[] = []
            const key = this.sortKey
            const order = this.sortOrders[key] || 1
            if (filterKey) {
                this.filteredData = this.filteredData.filter((o) => {
                    return Object.keys(o)
                        .filter((k) => {
                            return this.dataColumns.includes(k)
                        })
                        .some((k) => {
                            return (
                                String(o[k])
                                    .toLowerCase()
                                    .indexOf(textKey) > -1
                            )
                        })
                })
                if (this.currentPage > this.pageCount) {
                    this.currentPage = 1
                }
            }
            if (this.sortKey.length > 0) {
                if (this.browserSupportsLocaleCompare) {
                    const collator = new Intl.Collator("en", {
                        numeric: true,
                        sensitivity: "base"
                    })
                    sortedData = this.filteredData
                        .slice()
                        .sort((a, b) => collator.compare(a[key], b[key]))
                } else {
                    sortedData = this.filteredData.slice().sort(function(a, b) {
                        a = a[key]
                        b = b[key]
                        return (a === b ? 0 : a > b ? 1 : -1) * order
                    })
                }
                if (order < 0) {
                    sortedData = sortedData.reverse()
                }
            } else {
                sortedData = this.filteredData
            }
            if (this.currentPage === 1) {
                displayData = sortedData.slice(0, this.displayRecordCount)
            } else {
                displayData = sortedData.slice(
                    startIndex,
                    startIndex + this.displayRecordCount
                )
            }
            return displayData
        }
        get pageCount(): number {
            const displayCount =
                this.filteredData.length < this.displayRecordCount
                    ? this.filteredData.length
                    : this.displayRecordCount
            return Math.floor(this.filteredData.length / displayCount)
        }
        // range is the number before and after the current page to display
        get visiblePages(): GridPage[] {
            if (this.pageCount) {
                let range = this.pageSpan
                const visiblePages: GridPage[] = []
                let begin = this.currentPage - range
                let end = this.currentPage + range
                if (!range) range = 2
                if (this.currentPage <= range) {
                    begin = 1
                } else {
                    begin = this.currentPage - range
                }
                if (this.currentPage + range >= this.pageCount) {
                    end = this.pageCount
                } else {
                    end = this.currentPage + range
                }
                for (let i = begin; i <= end; i++) {
                    const page: GridPage = {
                        page: i,
                        isCurrentPage: this.currentPage === i
                    }
                    visiblePages.push(page)
                }
                return visiblePages
            } else return []
        }
        get isFirstPage() {
            return this.currentPage === 1
        }
        get isLastPage() {
            return this.currentPage === this.pageCount
        }
        get browserSupportsLocaleCompare() {
            try {
                "browser".localeCompare("does-not-like", "i")
            } catch (e) {
                return e.name === "RangeError"
            }
            return false
        }

        //lifecycle
        mounted() {
            this.dataColumns.forEach((key) => {
                this.sortOrders[key] = -1
            })
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .highlight {
        background-color: yellow;
    }

    tr.highlight td {
        background-color: yellow;
    }
    .page-span {
        display: inline-block;
        min-width: 7em;
        min-height: 1rem;
        text-align: center;
    }

    .make-bold {
        font-weight: bold;
        font-size: larger;
    }
    .icon {
        margin-left: 0.2rem;
        margin-right: 0.2rem;
    }
    
    body {
        font-family: inherit;
        font-size: 1.4rem;
        color: #444;
    }

    table {
        margin-left: auto;
        margin-right: auto;
        border: 2px solid rgb(51, 102, 153);
        border-radius: 3px;
        background-color: #fff;
    }

    th {
        background-color: rgb(51, 102, 153);
        color: rgba(255, 255, 255, 0.66);
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    td {
        background-color: #f9f9f9;
    }

    th,
    td {
        min-width: 120px;
        padding: 10px 20px;
    }

    th.active {
        color: #fff;
    }

    th.active .arrow {
        opacity: 1;
    }

    .arrow {
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 0;
        margin-left: 5px;
        opacity: 0.66;
    }

    .arrow.asc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 4px solid #fff;
    }

    .arrow.dsc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #fff;
    }
</style>
