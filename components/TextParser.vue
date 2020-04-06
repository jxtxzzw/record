<template>
  <div v-html="parsedValue">
  </div>
</template>

<script>
export default {
  name: 'TextParser',
  props: {
    value: {
      type: String,
      default () {
        return ''
      }
    }
  },
  computed: {
    parsedValue () {
      const lines = this.value.split('\n')
      const length = lines.length
      const html = []
      for (let i = 0; i < length; i++) {
        if (lines[i].length > 0) {
          let line = '</span><span class="spoiler"><span>'
          line += lines[i]
          line += '</span></span>'
          html.push(line)
        }
      }
      return html.join('<br />')
    }
  }
}
</script>

<style scoped>

</style>
