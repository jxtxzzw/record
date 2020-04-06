<template>
  <div :style="{height: cardInnerHeight + 'px', overflowY: 'auto'}">
    <Row>
      <i-col span="11">
        <Divider>我的打卡记录</Divider>
        <!-- 留空一个 Select 的高度，使左右平齐 -->
        <div style="height: 32px"></div>
        <Diagram :data="myRecords" :total="total" />
      </i-col>
      <i-col offset="2" span="11">
        <Divider>TA 的打卡记录</Divider>
        <Select v-model="competition" filterable @on-change="chooseAndCompete">
          <Option v-for="user in users" :key="user.email" :value="user.email">
            {{ user.email }}
          </Option>
        </Select>
        <Diagram v-if="competition" :data="competitionRecords" :total="total" />
      </i-col>
    </Row>
    <Table :loading="loading" row-key="id" :columns="recordColumns" :data="recordDataPaged" @on-sort-change="sortChanged" />
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
  </div>
</template>

<script>
import { customSort, getRecordColumnsBase } from '../assets/recordColumnsBase'
import Diagram from '../components/Diagram'

export default {
  name: 'Compete',
  middleware: ['auth'],
  components: { Diagram },
  data () {
    return {
      pageSize: 20,
      pageSizeOpts: [10, 20, 50, 100],
      pageCurrent: 1,
      loading: true,
      total: 0,
      screenHeight: 0,
      recordColumns: [],
      recordData: [],
      myRecords: null,
      competitionRecords: null,
      users: [],
      competition: null
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
  async mounted () {
    this.extendRecordColumns()
    this.addWindowOnResizeHook()
    await this.loadData()
    await this.loadUsers()
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
    async loadData () {
      this.loading = true
      this.recordData = await this.$axios.$post('/api/Item/itemList')
      this.total = this.recordData.length
      this.myRecords = await this.$axios.$post('/api/Record/getMyRecords')
      this.recordData = customSort({}, this.recordData)
      this.loading = false
    },
    async loadUsers () {
      this.users = await this.$axios.$post('/api/User/users')
    },
    async chooseAndCompete (chose) {
      // 这里先放成 null，而不是直接改变，有 2 个考量
      // 1. 解决切换时出现 Cannot read property 'appendChild' of null 问题
      // 2. 自己和自己比较的话会由于 container 是同一个导致布局错乱，所以要避免自己和自己比
      this.competitionRecords = null
      if (chose === this.myRecords.user) {
        this.$Message.error({
          background: true,
          content: '不能和自己竞争'
        })
      } else {
        this.competitionRecords = await this.$axios.$post('/api/Record/getRecordsByUser', {
          email: this.competition
        })
      }
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
    },
    extendRecordColumns () {
      this.recordColumns = getRecordColumnsBase()
      this.recordColumns.push({
        title: '我已完成',
        key: 'my',
        render: (h, params) => {
          if (this.myRecords && this.myRecords.problems.includes(params.row.id)) {
            return h('div', [
              h('Icon', {
                props: {
                  type: 'ios-checkmark-circle'
                },
                style: {
                  margin: '5px 5px 5px 5px'
                }
              })
            ])
          } else {
            return h('div')
          }
        }
      })
      this.recordColumns.push({
        title: '对方已完成',
        key: 'competition',
        render: (h, params) => {
          if (this.competitionRecords && this.competitionRecords.problems.includes(params.row.id)) {
            return h('div', [
              h('Icon', {
                props: {
                  type: 'ios-checkmark-circle'
                },
                style: {
                  margin: '5px 5px 5px 5px'
                }
              })
            ])
          } else {
            return h('div')
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
