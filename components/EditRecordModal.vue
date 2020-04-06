<style>
  .vertical-center-modal .ant-upload.ant-upload-select-picture-card {
    width: 208px;
    height: 312px;
  }

  .vertical-center-modal .ant-upload-list-picture-card .ant-upload-list-item {
    width: 208px;
    height: 312px;
  }

</style>
<template>
  <div v-if="formValidate != null">
    <Modal
      v-model="modalVisible"
      title="打卡"
      class-name="vertical-center-modal"
      :closable="false"
      :mask-closable="false"
      :loading="loading"
      width="50"
      @on-ok="handleUpload()"
      @on-visible-change="handleVisibleChange"
    >
      <!-- W3C 标准中有如下规定： -->
      <!-- When there is only one single-line text input field in a form, the user agent should accept Enter in that field as a request to submit the form. -->
      <!-- 即：当一个 form 元素中只有一个输入框时，在该输入框中按下回车应提交该表单。如果希望阻止这一默认行为，可以在 <Form> 标签上添加 @submit.native.prevent。 -->
      <!-- 本表单中不需要输入 title 等，而 note 是 textarea，code 是调用了代码编辑器，都不属于输入框，因此 Tag 的输入框是唯一输入框 -->
      <!-- 所以 Tag 编辑时的回车会引发表单提交，这里阻止了这一操作，等效于表单中增加了一个 hidden 的输入框 -->
      <Form :model="formValidate" @submit.native.prevent>
        <Alert v-if="formError" type="error" show-icon>
          表单验证失败
          <span slot="desc">
            {{ formError }}
          </span>
        </Alert>
        <Divider>标签</Divider>
        <FormItem label="标签">
          <Tags :tags="formValidate.tags" @add="addTag" @remove="removeTag"></Tags>
        </FormItem>
        <Divider>刷题笔记与代码</Divider>
        <Checkbox v-model="formValidate.shareMore">
          分享刷题笔记与代码
        </Checkbox>
        <FormItem v-if="formValidate.shareMore" label="笔记">
          <Input v-model="formValidate.note" type="textarea" maxlength="4096" show-word-limit :rows="6" />
        </FormItem>
        <FormItem v-if="formValidate.shareMore" label="语言">
          <RadioGroup v-model="formValidate.language">
            <Radio label="C/C++"></Radio>
            <Radio label="Java"></Radio>
            <Radio label="Python"></Radio>
            <Radio label="Javascript"></Radio>
            <Radio label="SQL"></Radio>
            <Radio label="ML/SML/OCaml"></Radio>
          </RadioGroup>
        </FormItem>
        <FormItem v-if="formValidate.shareMore" label="代码">
          <!-- if Nust.js/SSR（如果在 Nuxt.js 环境下，需要外面包裹一层 no-ssr） -->
          <client-only placeholder="代码编辑器正在加载中……">
            <codemirror
              ref="cmEditor"
              v-model="formValidate.code"
              class="codemirror"
              :options="cmOptions"
            />
          </client-only>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import Tags from '~/components/Tags'

export default {
  middleware: ['auth'],
  components: {
    Tags
  },
  props: {
    modal: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: undefined,
        theme: 'idea'
      },
      formValidate: {
        tags: [],
        shareMore: true,
        note: '',
        language: '',
        code: ''
      },
      formError: null,
      loading: true,
      modalVisible: false
    }
  },
  // 增加 watcher 来监控 props 中 category 的修改
  watch: {
    // 用 watcher 留下 modal 的值，否则模态框开启关闭的时候修改 props 的值就会引起 warning
    modal: {
      handler (val) {
        this.modalVisible = val
        if (val) {
          this.formValidate.shareMore = true
          this.formError = null
        }
      }
    },
    id: {
      async handler (val) {
        this.id = val
        await this.loadData()
      }
    },
    formValidate: {
      deep: true,
      handler (val) {
        let mode
        switch (val.language) {
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
          default:
            break
        }
        this.cmOptions.mode = mode
      }
    }
  },
  methods: {
    async loadData () {
      const itemData = (await this.$axios.post('/api/Item/itemInfo', {
        id: this.id
      })).data
      this.formValidate.tags = itemData.tag
      const noteCodeData = (await this.$axios.post('/api/Item/noteCodeInfo', {
        id: this.id
      })).data
      this.formValidate.note = noteCodeData.note ? noteCodeData.note : ''
      this.formValidate.language = noteCodeData.language ? noteCodeData.language : 'C/C++'
      this.formValidate.code = noteCodeData.code ? noteCodeData.code : ''
    },
    addTag (tagName) {
      // 先移除重复项，再添加，确保不存在重复标签
      this.removeTag(tagName)
      this.formValidate.tags.push(tagName)
      // 过滤空标签
      this.formValidate.tags = this.formValidate.tags.filter(tag => tag.length > 0)
    },
    removeTag (tagName) {
      this.formValidate.tags = this.formValidate.tags.filter(tag => tag !== tagName)
    },
    handleVisibleChange (status) {
      this.$emit('editItemVisibleChange', status)
    },
    async handleUpload () {
      let valid = true
      if (this.formValidate.shareMore) {
        valid = valid && (this.formValidate.note !== '' || this.formValidate.code !== '')
      }
      this.loading = false
      this.$nextTick(() => {
        this.loading = true
      })
      if (valid) {
        this.formValidate.id = this.id
        let success = true
        try {
          await this.$axios.$post('/api/update', {
            id: this.id,
            tags: this.formValidate.tags
          })
          await this.$axios.$post('/api/Record/record', this.formValidate)
        } catch (e) {
          success = false
          this.$Message.error({
            background: true,
            content: '表单提交出现错误：' + e
          })
          this.formError = '表单提交出现错误：' + e
        }
        if (success) {
          this.modalVisible = false
          this.$Message.success({
            background: true,
            content: '编辑成功'
          })
        }
      } else {
        let errMsg = '表单验证失败，请检查您输入的内容'
        if (this.formValidate.note === '' && this.formValidate.code === '') {
          errMsg = '当您选择分享刷题笔记或代码时，二者至少填写一者方可提交。'
        }
        this.$Message.error({
          background: true,
          content: errMsg
        })
        this.formError = errMsg
      }
    }
  }
}
</script>
