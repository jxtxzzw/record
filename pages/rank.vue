<template>
  <div :style="{height: cardInnerHeight + 'px', overflowY: 'auto'}">
    <Select v-model="subject" filterable @on-change="rank">
      <Option v-for="item in subjects" :key="item.value" :value="item.value">
        {{ item.prompt }}
      </Option>
    </Select>
    <div id="container"></div>
  </div>
</template>

<script>

export default {
  name: 'Rank',
  middleware: ['auth'],
  data () {
    return {
      screenHeight: 0,
      subject: 'count',
      chart: null,
      subjects: [
        {
          value: 'count',
          prompt: '按打卡次数（累计刷题数）排名'
        },
        {
          value: 'consist',
          prompt: '按连续打卡天数排名'
        },
        {
          value: 'uniqueDay',
          prompt: '按累计打卡天数排名'
        },
        {
          value: 'shareCount',
          prompt: '按分享的刷题笔记和代码数排名'
        }
      ],
      rankInfo: []
    }
  },
  computed: {
    cardInnerHeight () {
      // cardHeight 与 default layout 计算类似，为屏幕高度减去 137，之后需要再减去 2 个 16 的 padding
      return this.screenHeight - 137 - 32
    }
  },
  async mounted () {
    this.addWindowOnResizeHook()
    this.rankInfo = await this.$axios.$post('/api/Record/getRankInfo')
    this.rank()
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
    rank () {
      if (this.chart) {
        this.chart.clear()
      }
      switch (this.subject) {
        case 'count':
        default:
          this.rankInfo.sort((a, b) => {
            return a.count - b.count
          })
          break
        case 'consist':
          this.rankInfo.sort((a, b) => {
            return a.consist - b.consist
          })
          break
        case 'uniqueDay':
          this.rankInfo.sort((a, b) => {
            return a.uniqueDay - b.uniqueDay
          })
          break
        case 'shareCount':
          this.rankInfo.sort((a, b) => {
            return a.shareCount - b.shareCount
          })
          break
      }
      this.drawChart()
    },
    drawChart () {
      // 通过 plugin 引入 G2
      const Chart = this.$g2.Chart

      // Step 1: 创建 Chart 对象
      if (!this.chart) {
        this.chart = new Chart({
          container: 'container',
          autoFit: true,
          height: 500
        })
      }

      // Step 2: 载入数据源
      if (this.subject === 'shareCount') {
        const rankInfoWithLanguages = []
        for (const x of this.rankInfo) {
          for (const lan of x.languages) {
            const y = Object.assign({}, x)
            y.language = lan.language
            y.languageCount = lan.count
            y.languages = undefined
            rankInfoWithLanguages.push(y)
          }
        }
        this.chart.data(rankInfoWithLanguages)
      } else {
        this.chart.data(this.rankInfo)
      }

      // Step 3：创建图形语法，绘制柱状图
      this.chart.axis('user', {
        title: null,
        tickLine: null,
        line: null
      })
      this.chart.axis(this.subject, {
        label: null,
        title: {
          offset: 30,
          style: {
            fontSize: 12,
            fontWeight: 300
          }
        }
      })

      if (this.subject === 'shareCount') {
        this.chart.legend({
          position: 'top'
        })
        this.chart.coordinate('rect').transpose()
        this.chart.tooltip({
          shared: true,
          showMarkers: false
        })
        this.chart.interaction('active-region')
        this.chart
          .interval()
          .adjust('stack')
          .position('user*languageCount')
          .color('language*user', (language, user) => {
            if (language === 'C/C++') {
              return '#1890ff'
            }
            if (language === 'Java') {
              return '#41C769'
            }
            if (language === 'Python') {
              return '#FAD029'
            }
            if (language === 'SQL') {
              return '#f5222d'
            }
            if (language === 'Javascript') {
              return '#f58000'
            }
            if (language === 'ML/SML/OCaml') {
              return '#9a08f5'
            }
          })
          .size(26)
          .label('languageCount*language', (val, t) => {
            const color = t === 'white'
            if (val < 0.05) {
              return null
            }
            return {
              position: 'middle',
              offset: 0,
              style: {
                fontSize: 12,
                fill: color,
                lineWidth: 0,
                stroke: null,
                shadowBlur: 2,
                shadowColor: 'rgba(0, 0, 0, .45)'
              }
            }
          })
      } else {
        this.chart.legend(false)
        this.chart.coordinate().transpose()
        this.chart.interaction('element-active')
        this.chart
          .interval()
          .position('user*' + this.subject)
          .size(26)
          .label('value', {
            style: {
              fill: '#8d8d8d'
            },
            offset: 10
          })
      }

      // Step 4: 渲染图表
      this.chart.forceFit()
      this.chart.render()
    }
  }
}
</script>

<style scoped>

</style>
