<template>
  <div>
    <div v-if="registerPage">
      <h2 class="text-center">
        注册
      </h2>
      <Row>
        <i-col offset="8" span="8">
          <Alert v-if="error" type="error" show-icon>
            出现错误
            <span slot="desc">{{ error }}</span>
          </Alert>
        </i-col>
      </Row>
      <Row>
        <i-col offset="8" span="8">
          <Alert show-icon>
            注册
            <span slot="desc"> 输入您的邮箱注册账号，初始密码将会发送到您的邮箱。如果您忘记密码，请输入原邮箱账号，则该注册行为将变更为重置密码。</span>
          </Alert>
        </i-col>
      </Row>
      <Row>
        <i-col offset="8" span="8">
          <Card :dis-hover="true" :bordered="false">
            <busyOverlay />
            <Form ref="register">
              <FormItem prop="email" label="邮箱">
                <Input ref="email" v-model="email" placeholder="邮箱">
                <Icon slot="prefix" type="ios-person-outline" />
                <!-- 用 slot="prepend" 是前面加一块出来，后果是对不齐，以及会令 4.0 的 maxlength 和 password 失效 -->
                <!-- 这里应该是用 slot="prefix" -->
                </Input>
              </FormItem>
              <Button long type="primary" @click="register">
                注册
              </Button>
            </Form>
          </Card>
          <Button type="dashed" @click="registerPage = false">
            已有账号？点击登录。
          </Button>
        </i-col>
      </Row>
    </div>
    <div v-else>
      <h2 class="text-center">
        登录
      </h2>
      <Row>
        <i-col offset="8" span="8">
          <Alert v-if="error" type="error" show-icon>
            出现错误
            <span slot="desc">{{ error }}</span>
          </Alert>
        </i-col>
      </Row>
      <Row>
        <i-col offset="8" span="8">
          <Alert v-if="$auth.$state.redirect" show-icon>
            请先登录
            <span slot="desc"> 你必须先登录才能访问 <strong>{{ $auth.$state.redirect }}</strong> 页面 </span>
          </Alert>
        </i-col>
      </Row>
      <Row>
        <i-col offset="8" span="8">
          <Card :dis-hover="true" :bordered="false">
            <busyOverlay />
            <Form ref="login">
              <FormItem prop="email" label="邮箱">
                <Input ref="email" v-model="email" placeholder="邮箱">
                <Icon slot="prefix" type="ios-person-outline" />
                  <!-- 用 slot="prepend" 是前面加一块出来，后果是对不齐，以及会令 4.0 的 maxlength 和 password 失效 -->
                  <!-- 这里应该是用 slot="prefix" -->
                </Input>
              </FormItem>
              <FormItem prop="password" label="密码">
                <Input v-model="password" type="password" password placeholder="请输入密码" @on-enter="login">
                <Icon slot="prefix" type="ios-lock-outline" />
                </Input>
              </FormItem>
              <Button long type="primary" @click="login">
                登录
              </Button>
            </Form>
          </Card>
          <Button type="dashed" @click="registerPage = true">
            没有账号？点击注册。
          </Button>
        </i-col>
      </Row>
    </div>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center !important;
}
</style>

<script>
import * as passwordEncrypt from '~/assets/passwordEncrypt'
import busyOverlay from '~/components/busy-overlay'
export default {
  middleware: ['auth'],
  components: { busyOverlay },
  data () {
    return {
      registerPage: false,
      email: '',
      password: '',
      error: null
    }
  },
  computed: {
    redirect () {
      return (
        this.$route.query.redirect &&
        decodeURIComponent(this.$route.query.redirect)
      )
    },
    isCallback () {
      return Boolean(this.$route.query.callback)
    }
  },
  methods: {
    login () {
      this.error = null
      return this.$auth
        .loginWith('local', {
          data: {
            email: this.email,
            password: passwordEncrypt.clientEncrypt(this.password)
          }
        })
        .catch((e) => {
          this.error = e + ''
          if (this.error === 'Error: Request failed with status code 401') {
            this.error = '您输入的用户名或密码错误，用户登录授权失败。'
          }
        })
    },
    async register () {
      this.error = null
      let success = true
      try {
        await this.$axios.$post('/api/User/register', {
          email: this.email
        })
      } catch (e) {
        success = false
      }
      if (success) {
        this.$Message.success({
          background: true,
          content: '注册成功，请查看邮件以获取初始密码'
        })
      }
    }
  }
}
</script>
