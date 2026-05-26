import { describe, it, expect, beforeEach } from 'vitest'
import { TreeStore } from '..'

const items = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

let ts: TreeStore

beforeEach(() => {
  ts = new TreeStore(structuredClone(items))
})

describe('getAll', () => {
  it('возвращает исходный массив', () => {
    expect(ts.getAll()).toHaveLength(8)
    expect(ts.getAll()[0]).toMatchObject({ id: 1, parent: null })
  })
})

describe('getItem', () => {
  it('возвращает элемент по числовому id', () => {
    expect(ts.getItem(1)).toMatchObject({ id: 1, label: 'Айтем 1' })
  })

  it('возвращает элемент по строковому id', () => {
    expect(ts.getItem('91064cee')).toMatchObject({ id: '91064cee', label: 'Айтем 2' })
  })

  it('возвращает undefined для несуществующего id', () => {
    expect(ts.getItem(999)).toBeUndefined()
  })
})

describe('getChildren', () => {
  it('возвращает прямых потомков', () => {
    const children = ts.getChildren(1)
    expect(children).toHaveLength(2)
    expect(children.map((c) => c.id)).toEqual(expect.arrayContaining(['91064cee', 3]))
  })

  it('возвращает пустой массив для листового узла', () => {
    expect(ts.getChildren(7)).toEqual([])
  })
})

describe('getAllChildren', () => {
  it('возвращает всех потомков', () => {
    const all = ts.getAllChildren(1)
    expect(all.map((c) => c.id)).toEqual(expect.arrayContaining(['91064cee', 3, 4, 5, 6, 7, 8]))
    expect(all).toHaveLength(7)
  })

  it('возвращает пустой массив для листового узла', () => {
    expect(ts.getAllChildren(7)).toEqual([])
  })

  it('потомки обходятся в ширину (родитель раньше своих детей)', () => {
    const all = ts.getAllChildren(1).map((c) => c.id)
    expect(all.indexOf('91064cee')).toBeLessThan(all.indexOf(4))
    expect(all.indexOf(4)).toBeLessThan(all.indexOf(7))
  })
})

describe('getAllParents', () => {
  it('возвращает цепочку от элемента до корня', () => {
    const parents = ts.getAllParents(7).map((p) => p.id)
    expect(parents).toEqual([7, 4, '91064cee', 1])
  })

  it('для корня возвращает только сам корень', () => {
    expect(ts.getAllParents(1).map((p) => p.id)).toEqual([1])
  })
})

describe('addItem', () => {
  it('добавляет новый элемент и он находится через getItem и getChildren', () => {
    ts.addItem({ id: 9, parent: 3, label: 'Айтем 9' })
    expect(ts.getItem(9)).toMatchObject({ id: 9 })
    expect(ts.getChildren(3).map((c) => c.id)).toContain(9)
    expect(ts.getAll()).toHaveLength(9)
  })
})

describe('removeItem', () => {
  it('удаляет элемент и всех его потомков', () => {
    ts.removeItem('91064cee')
    // удалены: 91064cee, 4, 5, 6, 7, 8 — осталось 2
    expect(ts.getAll()).toHaveLength(2)
    expect(ts.getItem('91064cee')).toBeUndefined()
    expect(ts.getItem(4)).toBeUndefined()
    expect(ts.getChildren(1).map((c) => c.id)).not.toContain('91064cee')
  })

  it('удаляет листовой элемент без потомков', () => {
    ts.removeItem(7)
    expect(ts.getAll()).toHaveLength(7)
    expect(ts.getChildren(4).map((c) => c.id)).not.toContain(7)
  })
})

describe('updateItem', () => {
  it('обновляет поля существующего элемента', () => {
    ts.updateItem({ id: 7, parent: 4, label: 'Новый лейбл' })
    expect(ts.getItem(7)).toMatchObject({ label: 'Новый лейбл' })
  })

  it('при смене parent элемент переходит в другое поддерево', () => {
    ts.updateItem({ id: 7, parent: 3, label: 'Айтем 7' })
    expect(ts.getChildren(4).map((c) => c.id)).not.toContain(7)
    expect(ts.getChildren(3).map((c) => c.id)).toContain(7)
  })
})
