import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryCell from '../CategoryCell.vue'
import type { ICellRendererParams } from 'ag-grid-community'
import type { BuildRowDataItem } from '../../types'

function makeParams(
  overrides: Partial<ICellRendererParams<BuildRowDataItem>>,
): ICellRendererParams<BuildRowDataItem> {
  return {
    data: { path: ['1'], label: 'Айтем 1', category: 'Группа' },
    node: { level: 0, expanded: true, setExpanded: vi.fn() } as never,
    ...overrides,
  } as ICellRendererParams<BuildRowDataItem>
}

describe('CategoryCell', () => {
  describe('группа', () => {
    it('показывает иконку ▾ когда узел раскрыт', () => {
      const wrapper = mount(CategoryCell, {
        props: { params: makeParams({ node: { level: 0, expanded: true, setExpanded: vi.fn() } as never }) },
      })
      expect(wrapper.find('.toggle-icon').exists()).toBe(true)
      expect(wrapper.find('.toggle-icon').text()).toBe('▾')
    })

    it('показывает иконку ▸ когда узел свёрнут', () => {
      const wrapper = mount(CategoryCell, {
        props: { params: makeParams({ node: { level: 0, expanded: false, setExpanded: vi.fn() } as never }) },
      })
      expect(wrapper.find('.toggle-icon').text()).toBe('▸')
    })

    it('рендерит текст «Группа» жирным', () => {
      const wrapper = mount(CategoryCell, { props: { params: makeParams({}) } })
      const label = wrapper.find('span:last-child')
      expect(label.text()).toBe('Группа')
      expect(label.attributes('style')).toContain('font-weight: 700')
    })

    it('вызывает setExpanded при клике на иконку', async () => {
      const setExpanded = vi.fn()
      const wrapper = mount(CategoryCell, {
        props: {
          params: makeParams({ node: { level: 0, expanded: true, setExpanded } as never }),
        },
      })
      await wrapper.find('.toggle-icon').trigger('click')
      expect(setExpanded).toHaveBeenCalledWith(false)
    })

    it('применяет отступ по уровню вложенности', () => {
      const wrapper = mount(CategoryCell, {
        props: { params: makeParams({ node: { level: 2, expanded: true, setExpanded: vi.fn() } as never }) },
      })
      expect(wrapper.find('div').attributes('style')).toContain('padding-left: 48px')
    })
  })

  describe('элемент', () => {
    const elementParams = makeParams({
      data: { path: ['1', '2'], label: 'Айтем 2', category: 'Элемент' },
      node: { level: 1, expanded: false, setExpanded: vi.fn() } as never,
    })

    it('не показывает иконку', () => {
      const wrapper = mount(CategoryCell, { props: { params: elementParams } })
      expect(wrapper.find('.toggle-icon').exists()).toBe(false)
    })

    it('показывает placeholder вместо иконки', () => {
      const wrapper = mount(CategoryCell, { props: { params: elementParams } })
      expect(wrapper.find('.toggle-placeholder').exists()).toBe(true)
    })

    it('рендерит текст «Элемент» без жирного', () => {
      const wrapper = mount(CategoryCell, { props: { params: elementParams } })
      const label = wrapper.find('span:last-child')
      expect(label.text()).toBe('Элемент')
      expect(label.attributes('style')).toContain('font-weight: 400')
    })

    it('применяет отступ по уровню вложенности', () => {
      const wrapper = mount(CategoryCell, { props: { params: elementParams } })
      expect(wrapper.find('div').attributes('style')).toContain('padding-left: 24px')
    })
  })
})
