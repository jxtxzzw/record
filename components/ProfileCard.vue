<template>
  <div>
    <Row>
      <Avatar shape="circle" size="large" :src="avatar" />
      <Button type="text" :ghost="ghost">
        {{ email }}
      </Button>
    </Row>
  </div>
</template>

<script>

export default {
  middleware: ['auth'],
  name: 'ProfileCard',
  props: {
    ghost: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
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
