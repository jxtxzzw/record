<template>
  <!-- 引用该组件的父组件，需要指定 height 或通过动态计算得到 height 并指定 overflow-y 为 auto，以避免评论内容超出组件 -->
  <div>
    <div v-if="loading">
      <a-skeleton :active="true" :avatar="true" :paragraph="{rows: 4}" />
    </div>
    <div v-else>
      <div v-if="replyTarget===0">
        <ReplyEditor :target="replyTarget" @reloadComment="reloadComment" />
      </div>
      <Comment
        v-for="reply in replies"
        :key="reply.id"
        :reply="reply"
        :target="replyTarget"
        @handleReplyTargetChange="handleReplyTargetChange"
        @reloadComment="reloadComment"
      />
      <!-- emit 的 v-on 不需要带括号，参数会依次自动填入 method 的 params -->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Comment from '~/components/Comment'
import ReplyEditor from '~/components/ReplyEditor'
export default {
  middleware: ['auth'],
  name: 'CommentPage',
  components: {
    Comment,
    ReplyEditor
  },
  data () {
    return {
      moment,
      loading: true,
      comments: [],
      value: '',
      replyTarget: 0,
      replies: []
    }
  },
  async mounted () {
    await this.loadData()
  },
  methods: {
    handleReplyTargetChange (newTarget) {
      this.replyTarget = newTarget
    },
    async loadData () {
      this.loading = true
      this.replies = await this.$axios.$post('/api/Comment/Query')
      this.$emit('countComments', this.replies)
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    reloadComment () {
      this.$emit('reloadComment')
    }
  }
}
</script>

<style scoped>
</style>
