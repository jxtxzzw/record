<template>
  <div :style="{height: cardInnerHeight + 'px', overflowY: 'auto'}">
    <Row>
      <Input search enter-button placeholder="请输入关键字，不区分大小写……" @on-search="handleSearch" />
    </Row>
    <div style="height: 20px"></div>
    <Table class="table" :loading="loading" row-key="id" :columns="recordColumns" :data="recordDataPaged" @on-sort-change="sortChanged" />
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page
          show-total
          show-sizer
          transfer
          show-elevator
          :total="recordData.length"
          :current="pageCurrent"
          :page-size="pageSize"
          :page-size-opts="pageSizeOpts"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
        />
      </div>
    </div>
    <EditRecordModal :id="editId" :modal="showEdit" @editItemVisibleChange="handleVisibleChange" />
  </div>
</template>

<script>
import { customSort, getRecordColumnsBase } from '../assets/recordColumnsBase'
import EditRecordModal from './EditRecordModal'
import expandRow from './TableExpand'
export default {
  name: 'Items',
  components: { EditRecordModal },
  data () {
    return {
      pageSize: 20,
      pageSizeOpts: [10, 20, 50, 100],
      pageCurrent: 1,
      loading: true,
      showEdit: false,
      editId: 0,
      screenHeight: 0,
      recordColumns: [],
      recordData: [],
      records: [],
      recordStatus: {}
    }
  },
  computed: {
    cardInnerHeight () {
      // cardHeight 与 default layout 计算类似，为屏幕高度减去 137，之后需要再减去 2 个 16 的 padding
      return this.screenHeight - 137 - 32
    },
    sliceBegin () {
      return (this.pageCurrent - 1) * this.pageSize
    },
    sliceEnd () {
      return this.pageCurrent * this.pageSize
    },
    recordDataPaged () {
      return this.recordData.slice(this.sliceBegin, this.sliceEnd)
    }
  },
  watch: {
    records: {
      deep: true,
      handler () {
        this.recordStatus = {}
        for (const x of this.records) {
          this.recordStatus[x] = true
        }
      }
    }
  },
  async mounted () {
    this.extendRecordColumns()
    this.addWindowOnResizeHook()
    await this.loadData()
  },
  methods: {
    addWindowOnResizeHook () {
      // 找到根元素下面谁是 default layout
      let defaultLayoutVue
      for (let i = 0; i < this.$root.$children.length; i++) {
        if (this.$root.$children[i].onResizeHook) {
          defaultLayoutVue = this.$root.$children[i]
          break
        }
      }
      // 将 default layout 的 screenHeight 留下来，作为初始值
      this.screenHeight = document.body.clientHeight
      // 在 default layout 的 onResizeHook 中添加一个函数，表示窗口大小变化时，需要更新该组件的 screenHeight 为 default layout 的 screenHeight
      defaultLayoutVue.onResizeHook.push(() => {
        this.screenHeight = document.body.clientHeight
      })
    },
    async loadData (keyword = undefined) {
      this.loading = true
      this.recordData = await this.$axios.$post('/api/Item/itemList', {
        keyword
      })
      if (this.$auth.$state.loggedIn) {
        // 数据库查询的传输的速度其实是很快的，慢的是渲染的速度，所以这个不涉及 1000 多行的表格渲染，可以不优化
        this.records = (await this.$axios.$post('/api/Record/getMyRecords')).problems
      }
      this.recordData = customSort({}, this.recordData)
      this.loading = false
    },
    extendRecordColumns () {
      this.recordColumns = getRecordColumnsBase()
      // expand 这一列必须放在最前面，所以不采用 push 方法，采用 [e, ...arr] 的方法
      this.recordColumns = [{
        type: 'expand',
        width: 50,
        render: (h, params) => {
          return h(expandRow, {
            props: {
              row: params.row
            }
          })
        }
      }, ...this.recordColumns]
      this.recordColumns.push({
        title: '操作',
        key: 'action',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: this.recordStatus[parseInt(params.row.id)] ? 'text' : 'success',
                long: true,
                disabled: !this.$auth.$state.loggedIn
              },
              style: {
                margin: '5px 5px 5px 5px'
              },
              on: {
                click: () => {
                  this.showRecordModal(params.row.id)
                }
              }
            }, this.$auth.$state.loggedIn
              ? !this.recordStatus[params.row.id]
                ? '打卡' : `已打卡，点击查看或修改`
              : '请先登录')
          ])
        }
      })
    },
    // 避免模态框关闭后，没有通知父组件改变 showEdit 值导致无法再次触发
    handleVisibleChange (status) {
      this.showEdit = status
      if (!status) {
        this.reload()
      }
    },
    async reload () {
      await this.loadData()
    },
    showRecordModal (id) {
      this.editId = id
      this.showEdit = true
    },
    async handleSearch (val) {
      await this.loadData(val)
    },
    changePage (page) {
      this.pageCurrent = page
    },
    changePageSize (pageSize) {
      this.pageSize = pageSize
    },
    sortChanged (info) {
      customSort(info, this.recordData)
      // 排序后强制回到第 1 页
      this.pageCurrent = 1
    }
  }
}
</script>

<style scoped>
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
  .demo-spin-col{
    height: 100px;
    position: relative;
    border: 1px solid #eee;
  }
  .table table{
    table-layout: auto;
    width: 100% !important;
  }
</style>
