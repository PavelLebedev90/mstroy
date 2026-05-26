type Id = string | number

interface TreeItem {
  id: Id
  parent: Id | null
  label: string
}

class TreeStore {
  private items: TreeItem[]
  private itemMap: Map<Id, TreeItem>
  private childrenMap: Map<Id | null, TreeItem[]>

  constructor(items: TreeItem[]) {
    this.items = items
    this.itemMap = new Map()
    this.childrenMap = new Map()

    for (const item of items) {
      this.itemMap.set(item.id, item)

      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, [])
      }
      this.childrenMap.get(item.parent)!.push(item)
    }
  }

  getAll(): TreeItem[] {
    return this.items
  }

  getItem(id: Id): TreeItem | undefined {
    return this.itemMap.get(id)
  }

  getChildren(id: Id): TreeItem[] {
    return this.childrenMap.get(id) ?? []
  }

  getAllChildren(id: Id): TreeItem[] {
    const result: TreeItem[] = []
    const stack: TreeItem[] = this.getChildren(id)

    while (stack.length > 0) {
      const current = stack.pop()
      if (current) {
        result.push(current)
        stack.push(...this.getChildren(current.id))
      }
    }

    return result
  }

  getAllParents(id: Id): TreeItem[] {
    const result: TreeItem[] = []
    const stack = [this.itemMap.get(id)]

    while (stack.length > 0) {
      const current = stack.pop()
      if (current) {
        result.push(current)
        if (current.parent === null) break
        stack.push(this.itemMap.get(current.parent))
      }
    }

    return result
  }

  addItem(item: TreeItem): void {
    this.items.push(item)
    this.itemMap.set(item.id, item)

    if (!this.childrenMap.has(item.parent)) {
      this.childrenMap.set(item.parent, [])
    }
    this.childrenMap.get(item.parent)!.push(item)
  }

  removeItem(id: Id): void {
    const toRemove = new Set([id, ...this.getAllChildren(id).map((item) => item.id)])

    for (const removeId of toRemove) {
      const item = this.itemMap.get(removeId)
      if (!item) continue

      this.itemMap.delete(removeId)

      const siblings = this.childrenMap.get(item.parent)
      if (siblings) {
        const idx = siblings.indexOf(item)
        if (idx !== -1) siblings.splice(idx, 1)
      }

      this.childrenMap.delete(removeId)
    }

    this.items = this.items.filter((item) => !toRemove.has(item.id))
  }

  updateItem(updated: TreeItem): void {
    const existing = this.itemMap.get(updated.id)
    if (!existing) return

    if (existing.parent !== updated.parent) {
      const oldSiblings = this.childrenMap.get(existing.parent)
      if (oldSiblings) {
        const idx = oldSiblings.indexOf(existing)
        if (idx !== -1) oldSiblings.splice(idx, 1)
      }

      if (!this.childrenMap.has(updated.parent)) {
        this.childrenMap.set(updated.parent, [])
      }
      this.childrenMap.get(updated.parent)!.push(updated)
    } else {
      const siblings = this.childrenMap.get(existing.parent)
      if (siblings) {
        const idx = siblings.indexOf(existing)
        if (idx !== -1) siblings[idx] = updated
      }
    }

    this.itemMap.set(updated.id, updated)

    const itemsIdx = this.items.indexOf(existing)
    if (itemsIdx !== -1) this.items[itemsIdx] = updated
  }
}

export { TreeStore }
export type { TreeItem, Id }
