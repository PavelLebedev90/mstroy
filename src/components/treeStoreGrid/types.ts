import type { TreeItem } from '@/treeStore'

export interface RawItem extends TreeItem {
  label: string
}

export interface BuildRowDataItem {
  path: string[]
  label: string
  category: string
}
