import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import TreeStoreGrid from '../index.vue'

// мокаем AgGridVue, оставляя всю остальную логику компонента нетронутой
vi.mock('ag-grid-vue3', () => ({
  AgGridVue: defineComponent({
    name: 'AgGridVue',
    props: { rowData: Array, columnDefs: Array, getDataPath: Function },
    emits: ['grid-ready', 'row-group-opened'],
    template: '<div class="ag-grid-mock" />',
  }),
}))

vi.mock('ag-grid-community', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ag-grid-community')>()
  return {
    ...actual,
    ModuleRegistry: { registerModules: vi.fn() },
  }
})

vi.mock('ag-grid-enterprise', () => ({
  RowGroupingModule: {},
  TreeDataModule: {},
}))

// мокаем CSS-импорты
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}))
vi.mock('ag-grid-community/styles/ag-theme-alpine.css', () => ({}))

function makeMockApi(expanded = true) {
  return {
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    forEachNode: vi.fn((cb) => {
      cb({ childrenAfterGroup: ['child'], expanded })
    }),
  }
}

describe('TreeStoreGrid', () => {
  describe('начальный рендер', () => {
    it('показывает тулбар с текстом "Режим: просмотр"', () => {
      const wrapper = mount(TreeStoreGrid)
      expect(wrapper.find('.mode-label').text()).toBe('Режим: просмотр')
    })

    it('рендерит ag-grid-mock', () => {
      const wrapper = mount(TreeStoreGrid)
      expect(wrapper.find('.ag-grid-mock').exists()).toBe(true)
    })
  })

  describe('переключение режима через кнопку', () => {
    let wrapper: ReturnType<typeof mount>
    let mockApi: ReturnType<typeof makeMockApi>

    beforeEach(async () => {
      wrapper = mount(TreeStoreGrid)
      mockApi = makeMockApi(true)

      await wrapper.findComponent({ name: 'AgGridVue' }).vm.$emit('grid-ready', { api: mockApi })
      await flushPromises()
    })

    it('при клике меняет текст на "Режим: свёрнуто" и вызывает collapseAll', async () => {
      await wrapper.find('.mode-label').trigger('click')
      expect(mockApi.collapseAll).toHaveBeenCalled()
      expect(wrapper.find('.mode-label').text()).toBe('Режим: свёрнуто')
    })

    it('повторный клик разворачивает и меняет текст обратно', async () => {
      await wrapper.find('.mode-label').trigger('click')
      await wrapper.find('.mode-label').trigger('click')
      expect(mockApi.expandAll).toHaveBeenCalled()
      expect(wrapper.find('.mode-label').text()).toBe('Режим: просмотр')
    })
  })

  describe('синхронизация состояния при row-group-opened', () => {
    it('устанавливает "свёрнуто" если хотя бы один узел закрыт', async () => {
      const wrapper = mount(TreeStoreGrid)
      const mockApi = makeMockApi(false)

      await wrapper.findComponent({ name: 'AgGridVue' }).vm.$emit('grid-ready', { api: mockApi })
      await wrapper.findComponent({ name: 'AgGridVue' }).vm.$emit('row-group-opened', {})
      await flushPromises()

      expect(wrapper.find('.mode-label').text()).toBe('Режим: свёрнуто')
    })

    it('устанавливает "просмотр" если все узлы раскрыты', async () => {
      const wrapper = mount(TreeStoreGrid)
      const mockApi = makeMockApi(true)

      await wrapper.findComponent({ name: 'AgGridVue' }).vm.$emit('grid-ready', { api: mockApi })

      // сначала сворачиваем
      await wrapper.find('.mode-label').trigger('click')

      // эмулируем что все раскрыты
      mockApi.forEachNode = vi.fn((cb) => cb({ childrenAfterGroup: ['child'], expanded: true }))
      await wrapper.findComponent({ name: 'AgGridVue' }).vm.$emit('row-group-opened', {})
      await flushPromises()

      expect(wrapper.find('.mode-label').text()).toBe('Режим: просмотр')
    })
  })

  describe('grid-ready', () => {
    it('вызывает expandAll на апи после монтирования', async () => {
      const wrapper = mount(TreeStoreGrid)
      const mockApi = makeMockApi()

      await wrapper.findComponent({ name: 'AgGridVue' }).vm.$emit('grid-ready', { api: mockApi })
      await flushPromises()

      expect(mockApi.expandAll).toHaveBeenCalledOnce()
    })
  })
})
