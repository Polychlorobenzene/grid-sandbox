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
                />
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
                />
            </a>
            <span class="page-span" id="page-span">
                <span
                    :id="'page-span-' + item.page"
                    v-for="(item, index) in visiblePages"
                    :key="item.page"
                >
                    <a
                        href
                        @click.prevent="getPageResults(item.page)"
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
                />
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
                />
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
                    <th
                        v-if="dataColumns.length > 0 && rowIdentifier"
                        :key="rowIdentifier"
                        @click="sortBy(`${rowIdentifier}`)"
                        :class="{ active: sortKey == rowIdentifier }"
                    >
                        <span
                            class="arrow"
                            :class="
                                sortOrders[rowIdentifier] > 0 ? 'asc' : 'dsc'
                            "
                        />
                        {{ rowIdentifier }}
                    </th>
                    <th
                        v-for="key in dataColumns"
                        :key="key"
                        @click="sortBy(key)"
                        :class="{ active: sortKey == key }"
                    >
                        {{ key | capitalize }}
                        <!-- TODO: make test - splitting the data from the span may make it hard for a screen reader -->
                        <span
                            class="arrow"
                            :class="sortOrders[key] > 0 ? 'asc' : 'dsc'"
                        />
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
                        <a
                            href
                            :id="'edit-' + entry[`${rowIdentifier}`]"
                            @click.stop.prevent="
                                editRecord(entry[`${rowIdentifier}`])
                            "
                            >edit</a
                        >
                        {{ entry[`${rowIdentifier}`] }}
                    </td>

                    <td v-for="key in dataColumns" :key="key">
                        {{ entry[key] }}
                    </td>
                </tr>
                <tr>
                    <td>
                        <button @click.prevent="addRecord">
                            <font-awesome-icon
                                :icon="['fas', 'plus']"
                                title="Add Record"
                                aria-hidden="true"
                                aria-label="Add Record"
                                class="icon"
                            />Add record
                        </button>
                    </td>
                    <td v-if="selectedRowIds && selectedRowIds.length > 0">
                        <button @click.prevent="deleteSelected">
                            Delete Selected ({{ selectedRowIds.length }})
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div id="details" v-if="isRowEdit === true">
            <grid-detail
                v-if="selectedRecord"
                :record="selectedRecord"
                :fieldsToBind="dataColumns"
                @persisted-record="persistDetails"
                @cancel="cancelEdit"
            />
        </div>
    </div>
</template>

<script lang="ts">
    /* eslint-disable @typescript-eslint/no-explicit-any */
    import { Component, Prop, Vue, Emit } from "vue-property-decorator"

    import gridDetail from "./gridDetail.vue"
    import GridPage from "../models/GridPage"

    @Component({
        components: {
            gridDetail
        },
        filters: {
            capitalize(str: string) {
                return str.charAt(0).toUpperCase() + str.slice(1)
            }
        }
    })
    export default class DataGrid extends Vue {
        @Prop() private data!: Record<string, any>[]
        @Prop() private rowIdentifier!: string
        @Prop() private columns!: string[]
        @Prop() private pageSpan!: number
        //data
        timer: number | null = null
        selectedRowIds: number[] | null = null
        dataColumnsStaging: string[] = []
        selectedRecordStaging: Record<string, any> | null = null
        filterTextBuffer = ""
        private filterTextDelayed: string | null = null
        filteredData: any[] = []
        displayRecordCount = 10
        currentPage = 1
        sortOrders: any = {}
        sortKey = ""
        isRowEdit = false
        rowIdToEdit: number | null = null
        //functions

        //add and edit record
        editRecord(id: number) {
            if (this.isRowEdit && this.rowIdToEdit !== id) {
                if (
                    !confirm(
                        "You are currently editing a record. Do you wish to continue?"
                    )
                ) {
                    return
                } else {
                    const oldLink = document.getElementById(
                        "edit-" + this.rowIdToEdit
                    )
                    if (oldLink) {
                        oldLink.innerText = "edit"
                        this.isRowEdit = false
                        this.rowIdToEdit = null
                        this.selectedRecord = null
                        this.selectedRecordStaging = null
                    }
                }
            }
            const link = document.getElementById("edit-" + id)
            if (link) {
                if (link.innerHTML === "edit") {
                    link.innerText = "editing"
                    this.isRowEdit = true
                    this.rowIdToEdit = id
                } else {
                    link.innerText = "edit"
                    this.isRowEdit = false
                    this.rowIdToEdit = null
                    this.selectedRecord = null
                    this.selectedRecordStaging = null
                }
            }
        }
        @Emit("record-saved")
        persistDetails(value: Record<string, any>) {
            this.selectedRecord = value
            const oldLink = document.getElementById("edit-" + this.rowIdToEdit)
            if (oldLink) {
                oldLink.innerText = "edit"
                this.isRowEdit = false
                this.rowIdToEdit = null
                this.selectedRecord = null
                this.selectedRecordStaging = null
            }
            return value
        }
        @Emit("record-added")
        addRecord() {
            const record: Record<string, any> | null = {}
            const maxId = Math.max(
                ...this.data.map((rec) => rec[this.rowIdentifier])
            )
            const newId = maxId ? maxId + 1 : 1
            record[this.rowIdentifier] = newId
            if (this.dataColumns && this.dataColumns.length > 0) {
                for (let col = 0; col < this.dataColumns.length; col++) {
                    record[this.dataColumns[col]] = ""
                }
            }
            this.data.splice(this.displayRecordCount, 0, record)
            this.displayData.splice(this.displayRecordCount, 0, record)
            this.isRowEdit = true
            this.rowIdToEdit = newId
            this.selectedRecordStaging = record
            return record
        }
        @Emit("records-deleted")
        deleteSelected() {
            if (this.selectedRowIds) {
                const rowsToDelete = this.selectedRowIds.slice()
                this.selectedRowIds = []
                return rowsToDelete
            } else return []
        }
        cancelEdit() {
            if (this.selectedRecord) {
                const id = this.selectedRecord[this.rowIdentifier]
                this.editRecord(id)
            }
        }

        //sort and filter
        sort(key: string) {
            this.sortOrders[key] = 1
        }
        sortBy(key: string) {
            //Changing sortKey to empty string before assigning the value
            // forces the displayData getter to always be computed
            this.sortKey = ""
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
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
        getPageResults(page: number) {
            if (page >= 1 && page <= this.pageCount) {
                this.currentPage = page
            }
        }
        selectRow(id: number) {
            const row = document.getElementById("row" + id)
            if (!this.selectedRowIds) this.selectedRowIds = []
            if (row) {
                if (!row.hasAttribute("class")) {
                    row.setAttribute("class", "highlight")
                    this.selectedRowIds.push(id)
                } else {
                    row.removeAttribute("class")
                    this.selectedRowIds = this.selectedRowIds.filter(
                        (v) => v !== id
                    )
                }
            }
        }
        //getters and setters
        get selectedRecord(): Record<string, any> | null {
            if (!this.selectedRecordStaging) {
                const data = this.data.find(
                    (r) => r[this.rowIdentifier] == this.rowIdToEdit
                )
                if (data) {
                    this.selectedRecordStaging = data
                    return data
                } else this.selectedRecordStaging = null
            }
            return this.selectedRecordStaging
        }
        set selectedRecord(value: Record<string, any> | null) {
            const indexData = this.data.findIndex(
                (r: Record<string, any>) =>
                    r[this.rowIdentifier] == this.rowIdToEdit
            )
            const indexDisplay = this.displayData.findIndex(
                (r: Record<string, any>) =>
                    r[this.rowIdentifier] == this.rowIdToEdit
            )
            if (this.data[indexData] && this.displayData[indexDisplay]) {
                this.selectedRecordStaging = value
                if (value) {
                    this.displayData[indexDisplay] = value
                    this.data[indexData] = value
                }
            }
        }
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
                (this.currentPage - 1) * this.displayRecordCount
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
            return Math.ceil(this.filteredData.length / displayCount)
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
        get selectedDisplayRowIds() {
            if (!this.selectedRowIds) return []
            const displayedIds = new Set(
                this.displayData.map((r) => r[this.rowIdentifier])
            )
            const intersection = new Set(
                this.selectedRowIds.filter((r) => displayedIds.has(r))
            )
            return [...intersection]
        }

        //lifecycle
        mounted() {
            this.dataColumns.forEach((key) => {
                this.sortOrders[key] = -1
            })
            //Add sorting for the key row if present
            if (this.rowIdentifier && this.rowIdentifier.length > 0)
                this.sortOrders[this.rowIdentifier] = -1
        }
        updated() {
            for (let i = 0; i < this.selectedDisplayRowIds.length; i++) {
                const id = this.selectedDisplayRowIds[i]
                const row = document.getElementById("row" + id)
                if (row) {
                    if (!row.hasAttribute("class")) {
                        row.setAttribute("class", "highlight")
                    }
                }
            }
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
