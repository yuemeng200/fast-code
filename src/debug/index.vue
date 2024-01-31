<template>
  <div>
    <cpt-header v-for="item, index in career_info.stats" :key="index" :stat="item">
    </cpt-header>
  </div>
</template>

<script>
import CptHeader from './cpt-header.vue'
export default {
  components: {
    CptHeader,
  },
}
</script>

<style lang="less" scoped></style>