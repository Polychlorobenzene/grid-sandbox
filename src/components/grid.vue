<template>
    <div class="dataGrid">
        <div id="gridNavTop">
            <h3 v-if="pageCount && recordsPerPage > 0">
                Results Page: {{ currentPage }} out of {{ pageCount }}
            </h3>
            <h3
                v-else-if="
                    data && data.length > 0 && filterText && filterText !== ''
                "
            >
                All results filtered out
            </h3>
            <h3 v-else-if="recordsPerPage > 0">No wage records entered</h3>
            <span>
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
            </span>
            <label for="filter">Filter</label>
            <input
                type="text"
                id="filter"
                v-model="filterTextBuffer"
                @keyup="delayFilter"
            />
            <button
                type="button"
                @click.prevent="filterText = filterTextBuffer = ''"
            >
                X
            </button>
        </div>
        <table>
            <thead>
                <tr>
                    <th
                        v-if="columnList.length > 0 && rowIdentifier"
                        :key="rowIdentifier"
                        @click="sortBy(`${rowIdentifier}`)"
                        :class="{ active: sortKey == rowIdentifier }"
                    >
                        <span
                            class="arrow"
                            :class="
                                sortOrders[rowIdentifier] > 0 ? 'asc' : 'dsc'
                            "
                        >
                        </span>
                        {{ rowIdentifier }}
                    </th>
                    <th
                        v-for="key in columnList"
                        :key="key"
                        @click="sortBy(key)"
                        :class="{ active: sortKey == key }"
                    >
                        {{ key | capitalize }}
                        <!-- TODO: make test - splitting the data from the span may make it hard for a screen reader -->
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
                        <a
                            v-if="!isReadOnly"
                            href
                            :id="'edit-' + entry[`${rowIdentifier}`]"
                            @click.stop.prevent="
                                editRecord(entry[`${rowIdentifier}`])
                            "
                            >edit</a
                        >
                        {{ entry[`${rowIdentifier}`] }}
                    </td>

                    <td v-for="key in columns" :key="key.column">
                        {{ key.format(entry[key.column]) }}
                    </td>
                </tr>
                <tr v-if="!isReadOnly">
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
                <tr v-if="isRowEdit === true">
                    <td class="record-details">
                        <div id="details">
                            <grid-detail
                                v-if="selectedRecord"
                                :record="selectedRecord"
                                :fieldsToBind="columns"
                                @persisted-record="persistDetails"
                                @cancel="cancelEdit"
                            />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
    /* eslint-disable @typescript-eslint/no-explicit-any */
    import { Component, Prop, Vue, Emit } from "vue-property-decorator"

    import gridDetail from "./gridDetail.vue"
    import GridPage from "../models/GridPage"
    import IColumnMetadata from "../models/ColumnMetadata"

    @Component({
        components: {
            gridDetail
        },
        filters: {
            capitalize(str: string | undefined) {
                if (str) {
                    return str.charAt(0).toUpperCase() + str.slice(1)
                } else return str
            }
        }
    })
    export default class DataGrid extends Vue {
        @Prop() private data!: Record<string, any>[]
        @Prop() private rowIdentifier!: string
        @Prop() private columns!: IColumnMetadata[]
        @Prop() private pageSpan!: number
        @Prop({ default: 10 }) private displayRecordsPerPage!: number
        @Prop({ default: false }) private isReadOnly!: boolean
        //data
        timer: number | null = null
        selectedRowIds: number[] | null = null
        dataColumnsStaging: IColumnMetadata[] = []
        columnList: string[] = []
        selectedRecordStaging: Record<string, any> | null = null
        filterTextBuffer = ""
        private filterTextDelayed: string | null = null
        filteredData: any[] = []
        currentPage = 1
        sortOrders: any = {}
        sortKey = ""
        isRowEdit = false
        isRecordAdded = false
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
            //Set the known numeric fields to numeric values
            for (let index = 0; index < this.dataColumns.length; index++) {
                const columnMetadata = this.dataColumns[index]
                const columnName = columnMetadata.column
                if (columnMetadata.isNumeric) {
                    this.selectedRecord[columnName] = +this.selectedRecord[
                        columnName
                    ]
                }
            }
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
            this.filterText = ""
            const record: Record<string, any> | null = {}
            const maxId = Math.max(
                ...this.data.map((rec) => rec[this.rowIdentifier])
            )
            const newId = maxId && maxId !== -Infinity ? maxId + 1 : 1
            record[this.rowIdentifier] = newId
            if (this.dataColumns && this.dataColumns.length > 0) {
                for (let index = 0; index < this.dataColumns.length; index++) {
                    const columnMetadata = this.dataColumns[index]
                    const columnName = columnMetadata.column
                    //TODO: evaluate whether transforming the data here makes any sense
                    record[columnName] = null as unknown
                    if (columnMetadata.isNumeric) {
                        record[columnName] = record[columnName] as number
                    }
                }
            }
            if (this.currentPage === 1) {
                const position = this.recordsPerPage - 1
                this.data.splice(position, 0, record)
            } else {
                const position =
                    (this.currentPage - 1) * this.recordsPerPage +
                    (this.recordsPerPage - 1)
                this.data.splice(position, 0, record)
            }
            const link = document.getElementById("edit-" + this.rowIdToEdit)
            if (link) {
                link.innerText = "editing"
            }
            this.isRowEdit = true
            this.isRecordAdded = true
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
            if (!this.isReadOnly) {
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
        get dataColumns(): IColumnMetadata[] {
            if (this.columns && this.columns.length > 0) {
                this.dataColumnsStaging = this.columns
            } else if (
                this.data.length > 0 &&
                this.dataColumnsStaging.length < 1
            ) {
                const fields: IColumnMetadata[] = []
                const record = this.data[0]
                Object.keys(record).forEach((k: string, i: number) => {
                    const columnMedata: IColumnMetadata = {
                        column: k,
                        isNumeric: record[k].isNumeric(),
                        format: (value: string) => {
                            return value
                        },
                        order: i
                    }
                    fields.push(columnMedata)
                })
                this.dataColumnsStaging = fields
            }
            return this.dataColumnsStaging
        }
        get displayData(): any[] {
            const filterKey = this.filterText && this.filterText.toLowerCase()
            const textKey: string = filterKey ? filterKey : ""
            const startIndex: number =
                (this.currentPage - 1) * this.recordsPerPage
            this.filteredData = this.data
            let displayData = []
            let sortedData: any[] = []
            const key = this.sortKey
            const order = this.sortOrders[key] || 1
            if (filterKey) {
                this.filteredData = this.filteredData.filter((o) => {
                    return Object.keys(o)
                        .filter((k) => {
                            return this.dataColumns
                                .map((x) => x.column)
                                .includes(k)
                        })
                        .some((k) => {
                            return (
                                String(o[k])
                                    .toLowerCase()
                                    .indexOf(textKey) > -1
                            )
                        })
                })
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
                displayData = sortedData.slice(0, this.recordsPerPage)
            } else {
                displayData = sortedData.slice(
                    startIndex,
                    startIndex + this.recordsPerPage
                )
            }
            if (this.currentPage > this.pageCount) {
                this.currentPage = 1
            }
            return displayData
        }
        get pageCount(): number {
            const displayCount =
                this.filteredData.length < this.recordsPerPage
                    ? this.filteredData.length
                    : this.recordsPerPage
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
        get recordsPerPage() {
            if (this.displayRecordsPerPage === 0) {
                this.currentPage = 1
                return this.data.length
            } else return this.displayRecordsPerPage
        }

        //lifecycle
        mounted() {
            this.dataColumns.forEach((key) => {
                this.sortOrders[key.column] = -1
            })
            //Add sorting for the key row if present
            if (this.rowIdentifier && this.rowIdentifier.length > 0)
                this.sortOrders[this.rowIdentifier] = -1
            this.columnList = this.dataColumns.map((x) => x.column)
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
    .record-details {
        text-align: right;
    }

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
