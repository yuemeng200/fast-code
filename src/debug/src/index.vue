<template>
  <div>
    <cpt-header>
    </cpt-header>
  </div>
</template>

<script>

import CptHeader from './cpt-header.vue'
export default {
  data() {
    return {
      pageInfo: {
        desc: 'Debug',
      }
    }
  },
  components: {
    CptHeader,
  },
  mounted() {
    this.showMessage()
  },
  computed: {
    message() {
      return `This is ${this.pageInfo.desc} page.`
    },
  },
  methods: {
    showMessage() {
      console.log(this.message);
    }
  },
}
</script>

<style lang="less" scoped></style>