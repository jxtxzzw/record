<style scoped>
  .expand-row{
    margin-bottom: 16px;
  }
</style>
<template>
  <div>
    <Row>
      <divider>标签</divider>
      <Tag
        v-for="tag in row.tag"
        :key="tag"
        size="large"
        type="dot"
      >
        {{ tag }}
      </Tag>
    </Row>
    <Row>
      <divider>刷题笔记与代码</divider>
      <Button type="success" ghost long :disabled="!this.$auth.$state.loggedIn" @click="viewShareModal">
        {{ this.$auth.$state.loggedIn ? '查看' : '请先登录' }}
      </Button>
      <ShareModal :modal="showShareModal" :problem-id="row.id" @visibleChange="handleVisibleChange" />
    </Row>
  </div>
</template>
<script>
import ShareModal from './ShareModal'
export default {
  name: 'TableExpand',
  components: { ShareModal },
  props: {
    row: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      showShareModal: false
    }
  },
  methods: {
    viewShareModal () {
      this.showShareModal = true
    },
    // 避免模态框关闭后，没有通知父组件改变 showEdit 值导致无法再次触发
    handleVisibleChange (status) {
      this.showShareModal = status
    }
  }
}
</script>
