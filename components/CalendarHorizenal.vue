<template>
  <div :id="'container-' + email"></div>
</template>

<script>
import { isEmpty } from 'lodash'
export default {
  props: {
    data: {
      type: Array,
      default: null
    },
    email: {
      type: String,
      default: null
    }
  },
  watch: {
    email: {
      // email 改变的时候重绘
      handler () {
        this.drawChart()
      }
    }
  },
  mounted () {
    this.drawChart()
  },
  methods: {
    drawChart () {
      // 通过 plugin 引入 G2
      const Chart = this.$g2.Chart
      const registerShape = this.$g2.registerShape

      registerShape('polygon', 'boundary-polygon', {
        draw (cfg, container) {
          if (!isEmpty(cfg.points)) {
            const group = container.addGroup()
            const attrs = {
              stroke: '#fff',
              lineWidth: 1,
              fill: cfg.color
            }
            const points = cfg.points
            const path = [
              ['M', points[0].x, points[0].y],
              ['L', points[1].x, points[1].y],
              ['L', points[2].x, points[2].y],
              ['L', points[3].x, points[3].y],
              ['Z']
            ]
            attrs.path = this.parsePath(path)
            group.addShape('path', {
              attrs
            })

            if (cfg.data.lastWeek) {
              const linePath = [
                ['M', points[2].x, points[2].y],
                ['L', points[3].x, points[3].y]
              ]
              // 最后一周的多边形添加右侧边框
              group.addShape('path', {
                attrs: {
                  path: this.parsePath(linePath),
                  lineWidth: 4,
                  stroke: '#404040'
                }
              })
              if (cfg.data.lastDay) {
                group.addShape('path', {
                  attrs: {
                    path: this.parsePath([
                      ['M', points[1].x, points[1].y],
                      ['L', points[2].x, points[2].y]
                    ]),
                    lineWidth: 4,
                    stroke: '#404040'
                  }
                })
              }
            }

            return group
          }
        }
      })

      // Step 1: 创建 Chart 对象
      const chart = new Chart({
        container: 'container-' + this.email,
        autoFit: true,
        height: 300,
        padding: [50, 30, 50, 70]
      })

      // Step 2: 载入数据源
      chart.data(this.data)

      // Step 3：创建图形语法，绘制柱状图
      chart.scale({
        day: {
          type: 'cat',
          values: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        },
        week: {
          type: 'cat'
        },
        commits: {
          sync: true
        },
        date: {
          type: 'cat'
        }
      })
      chart.axis('week', {
        position: 'top',
        tickLine: null,
        line: null,
        label: {
          offset: 12,
          style: {
            fontSize: 12,
            fill: '#666',
            textBaseline: 'top'
          },
          formatter: (val) => {
            return ''
          }
        }
      })
      chart.axis('day', {
        grid: null
      })
      chart.legend(false)
      chart.tooltip({
        title: 'date',
        showMarkers: false
      })
      chart.coordinate().reflect('y')
      chart.polygon().position('week*day*date')
        .color('commits', '#BAE7FF-#1890FF-#0050B3')
        .shape('boundary-polygon')

      // Step 4: 渲染图表
      chart.interaction('element-active')
      chart.render()
    }
  }
}
</script>
