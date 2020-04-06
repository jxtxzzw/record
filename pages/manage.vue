<template>
  <div>
    <div v-if="$auth.$state.user.email === 'jxtxzzw@126.com'">
      <Row>
        <i-col span="24">
          <Divider>发送全体公告</Divider>
          <Announcement />
        </i-col>
      </Row>
    </div>
    <div v-else>
      <Alert type="error" show-icon>
        您没有权限进行系统管理
        <span slot="desc">
          只有超级管理员可以进行系统管理。如果有任何问题，请联系超级管理员。
        </span>
      </Alert>
    </div>
  </div>
</template>

<script>
import Announcement from '../components/Announcement'
export default {
  middleware: ['auth'],
  name: 'Manage',
  components: { Announcement }
}
</script>

<style scoped>

</style>
