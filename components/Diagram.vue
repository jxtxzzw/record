<template>
  <div v-if="data">
    <i-circle
      :size="200"
      :trail-width="4"
      :stroke-width="5"
      :percent="percent"
      stroke-linecap="square"
      stroke-color="#43a3fb"
    >
      <div class="demo-Circle-custom">
        <h1>{{ data.count }} / {{ total }}</h1>
        <p>进度</p>
        <span>
          <i>{{ percent.toFixed(2) }}%</i>
        </span>
      </div>
    </i-circle>
    <a-statistic title="打卡次数（累计刷题数）" :value="data.count" style="margin-right: 50px" />
    <a-statistic title="连续打卡天数（打卡间隔不超过 48 小时）" :value="data.consist" style="margin-right: 50px" />
    <a-statistic title="累计打卡天数" :value="data.uniqueDay" style="margin-right: 50px" />
    <CalendarHorizenal :data="data.commits" :email="data.user" />
  </div>
</template>

<script>
import CalendarHorizenal from './CalendarHorizenal'

export default {
  name: 'Diagram',
  components: { CalendarHorizenal },
  props: {
    data: {
      type: Object,
      default: null
    },
    total: {
      type: Number,
      default: 0
    }
  },
  computed: {
    percent () {
      if (this.data) {
        return this.data.count / this.total * 100
      } else {
        return 0
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .demo-Circle-custom {
    & h1 {
      color: #3f414d;
      font-size: 28px;
      font-weight: normal;
    }

    & p {
      color: #657180;
      font-size: 14px;
      margin: 10px 0 15px;
    }

    & span {
      display: block;
      padding-top: 15px;
      color: #657180;
      font-size: 14px;

      &:before {
        content: '';
        display: block;
        width: 50px;
        height: 1px;
        margin: 0 auto;
        background: #e0e3e6;
        position: relative;
        top: -15px;
      }
    ;
    }

    & span i {
      font-style: normal;
      color: #3f414d;
    }
  }
</style>
