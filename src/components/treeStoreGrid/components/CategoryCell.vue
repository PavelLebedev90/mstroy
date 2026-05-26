<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community'
import type { BuildRowDataItem } from '../types'

const props = defineProps<{ params: ICellRendererParams<BuildRowDataItem> }>()

const isGroup = props.params.data?.category === 'Группа'
const depth = props.params.node.level ?? 0

function toggle() {
  props.params.node.setExpanded(!props.params.node.expanded)
}
</script>

<template>
  <div
    :style="{
      paddingLeft: `${depth * 24}px`,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }"
  >
    <span
      v-if="isGroup"
      class="toggle-icon"
      style="font-size: 28px; cursor: pointer"
      @click.stop="toggle"
    >
      {{ params.node.expanded ? '▾' : '▸' }}
    </span>
    <span v-else class="toggle-placeholder" />
    <span
      :style="{
        fontWeight: isGroup ? '700' : '400',
      }"
    >
      {{ params.data?.category }}
    </span>
  </div>
</template>
