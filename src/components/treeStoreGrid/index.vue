<script setup lang="ts">
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ModuleRegistry,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  CellStyleModule,
  type ColDef,
  type GridReadyEvent,
  type GridApi,
  type RowGroupOpenedEvent,
  type GetDataPath,
} from 'ag-grid-community'
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise'
import { TreeStore } from '@/treeStore'
import type { BuildRowDataItem, RawItem } from './types'
import CategoryCell from './components/CategoryCell.vue'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  RowGroupingModule,
  TreeDataModule,
  CellStyleModule,
])

const rawItems: RawItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

const store = new TreeStore<RawItem>(rawItems)

function buildRowData(items: RawItem[]): BuildRowDataItem[] {
  const pathMap = new Map<string | number, string[]>()

  function getPath(id: string | number): string[] {
    if (pathMap.has(id)) return pathMap.get(id)!
    const item = store.getItem(id)!
    if (item.parent === null) {
      const p = [String(id)]
      pathMap.set(id, p)
      return p
    }
    const p = [...getPath(item.parent), String(id)]
    pathMap.set(id, p)
    return p
  }

  return items.map((item) => ({
    path: getPath(item.id),
    label: item.label,
    category: store.getChildren(item.id).length > 0 ? 'Группа' : 'Элемент',
  }))
}

const rowData = computed(() => buildRowData(store.getAll()))

const gridApi = ref<GridApi<BuildRowDataItem> | null>(null)
const expandedAll = ref(true)

const columnDefs: ColDef<BuildRowDataItem>[] = [
  {
    headerName: '№ п\\п',
    valueGetter: (params) => {
      if (!params.node || params.node.rowIndex === null) return ''
      return params.node.rowIndex + 1
    },
    width: 90,
    cellStyle: { fontWeight: '700', textAlign: 'center' },
  },
  {
    headerName: 'Категория',
    minWidth: 220,
    flex: 1,
    cellRenderer: CategoryCell,
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 2,
    cellStyle: (params) => ({
      fontWeight: params.data?.category === 'Группа' ? '700' : '400',
    }),
  },
]

const getDataPath: GetDataPath<BuildRowDataItem> = (data) => data.path

function onGridReady(event: GridReadyEvent<BuildRowDataItem>) {
  gridApi.value = event.api
  event.api.expandAll()
}

function onRowGroupOpened(_event: RowGroupOpenedEvent<BuildRowDataItem>) {
  if (!gridApi.value) return
  let allExpanded = true
  gridApi.value.forEachNode((node) => {
    if (node.childrenAfterGroup?.length && !node.expanded) allExpanded = false
  })
  expandedAll.value = allExpanded
}

function toggleExpandAll() {
  if (!gridApi.value) return
  if (expandedAll.value) {
    gridApi.value.collapseAll()
    expandedAll.value = false
  } else {
    gridApi.value.expandAll()
    expandedAll.value = true
  }
}
</script>

<template>
  <div class="tree-grid-wrapper">
    <div class="toolbar">
      <span class="mode-label" @click="toggleExpandAll">
        Режим: {{ expandedAll ? 'просмотр' : 'свёрнуто' }}
      </span>
    </div>

    <AgGridVue
      class="ag-theme-alpine tree-grid"
      tree-data
      theme="legacy"
      group-display-type="custom"
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="{ resizable: true, sortable: false }"
      :get-data-path="getDataPath"
      :animate-rows="true"
      @grid-ready="onGridReady"
      @row-group-opened="onRowGroupOpened"
    />
  </div>
</template>

<style scoped>
.tree-grid-wrapper {
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fb;
  padding: 12px;
  max-width: 900px;
  margin: 24px auto;
}

.toolbar {
  margin-bottom: 10px;
}

.mode-label {
  color: #2563eb;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.mode-label:hover {
  text-decoration: underline;
}

.tree-grid {
  width: 100%;
  height: 420px;
}
</style>
