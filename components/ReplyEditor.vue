<template>
  <div>
    <a-comment>
      <a-avatar
        slot="avatar"
        :src="avatar"
        :alt="email"
      />
      <div slot="content">
        <a-form-item>
          <a-textarea :rows="4" :value="value" @change="handleChange" />
        </a-form-item>
        <a-form-item>
          <a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit">
            发表评论
          </a-button>
          <a-button v-if="target !== 0" @click="cancelReply">
            取消回复指定评论
          </a-button>
        </a-form-item>
      </div>
    </a-comment>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  middleware: ['auth'],
  name: 'ReplyEditor',
  props: {
    target: {
      type: Number,
      default () {
        return 0
      }
    }
  },
  data () {
    return {
      moment,
      submitting: false,
      value: '',
      avatar: '',
      email: ''
    }
  },
  computed: {
    state () {
      return JSON.stringify(this.$auth.$state, undefined, 2)
    }
  },
  async mounted () {
    await this.getUserInfo()
  },
  methods: {
    cancelReply () {
      this.$emit('cancelReply')
    },
    async handleSubmit () {
      this.submitting = true
      if (!this.value) {
        this.$Message.error({
          background: true,
          content: '评论内容不能为空'
        })
        this.submitting = false
        return
      }
      const data = {
        userEmail: this.$auth.$state.user.email,
        content: this.value,
        reply: this.target
      }
      await this.$axios.$post('/api/Comment/Add', data)
      this.submitting = false
      this.$emit('reloadComment')
    },
    handleChange (e) {
      this.value = e.target.value
    },
    async getUserInfo () {
      const user = await this.$axios.$post('/api/User/userinfo', {
        email: this.$auth.$state.user.email
      })
      this.avatar = user.avatar
      this.email = user.email
    }
  }
}
</script>

<style scoped>

</style>
