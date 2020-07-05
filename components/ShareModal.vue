<template>
  <div>
    <Modal
      v-model="modalVisible"
      title="查看刷题笔记与代码"
      class-name="vertical-center-modal"
      :closable="true"
      :mask-closable="true"
      width="50"
      @on-visible-change="handleVisibleChange"
    >
      <a-empty
        v-if="list.length === 0"
        image="/empty.png"
      >
        <span slot="description">还没有任何人分享刷题笔记或代码哦</span>
      </a-empty>

      <Collapse v-else v-model="viewing" accordion>
        <Panel v-for="item in list" :key="item.id" :name="item.id.toString()">
          <Avatar size="small" :src="item.avatar" />
          {{ item.email }}
          <p slot="content">
            <divider v-if="item.note.length > 0">
              笔记
            </divider>
            <TextParser v-if="item.note.length > 0" :value="item.note" />
            <divider v-if="item.code.length > 0">
              代码
            </divider>
            <!-- if Nust.js/SSR（如果在 Nuxt.js 环境下，需要外面包裹一层 no-ssr） -->
            <client-only v-if="item.code.length > 0" placeholder="代码编辑器正在加载中……">
              <codemirror
                ref="cmEditor"
                v-model="item.code"
                class="codemirror"
                :options="{
                  tabSize: 4,
                  styleActiveLine: true,
                  lineNumbers: true,
                  line: true,
                  mode: item.mode,
                  readOnly: true,
                  theme: 'idea'
                }"
              />
            </client-only>
          </p>
        </Panel>
      </Collapse>
    </Modal>
  </div>
</template>

<script>
import TextParser from './TextParser'
export default {
  name: 'ShareModal',
  components: { TextParser },
  props: {
    modal: {
      type: Boolean,
      default: false
    },
    problemId: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      modalVisible: false,
      viewing: '0',
      list: []
    }
  },
  watch: {
    // 用 watcher 留下 modal 的值，否则模态框开启关闭的时候修改 props 的值就会引起 warning
    modal: {
      handler (val) {
        this.modalVisible = val
      }
    }
  },
  async mounted () {
    // 这个和 Edit 不一样的地方在于它每一个组件在 mounted 的时候就有默认的 id，不是默认 0 再之后传递修改
    if (this.$auth.$state.loggedIn) {
      await this.loadData()
    }
  },
  methods: {
    async loadData () {
      this.list = await this.$axios.$post('/api/Item/allNoteCodeInfo', {
        id: this.problemId
      })
      for (const x of this.list) {
        let mode
        switch (x.language) {
          case 'C/C++':
            mode = 'text/x-c++src'
            break
          case 'Java':
            mode = 'text/x-java'
            break
          case 'Python':
            mode = 'text/x-python'
            break
          case 'Javascript':
            mode = 'text/javascript'
            break
          case 'SQL':
            mode = 'text/x-sql'
            break
          case 'ML/SML/OCaml':
            mode = 'text/x-ocaml'
            break
          case 'Go':
            mode = 'text/x-go'
            break
          default:
            break
        }
        x.mode = mode
      }
    },
    handleVisibleChange (status) {
      this.$emit('visibleChange', status)
    }
  }
}
</script>

<style scoped>

</style>
