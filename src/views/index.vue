<template>
  <el-row class="my_chart" :gutter="10">
      <el-col :span="5">
        <common-left @add="add" @setPosition="setPosition"></common-left>
      </el-col>
      <el-col :span="19">
        <charts ref="charts"></charts>
      </el-col>
  </el-row>
</template>
<script>
import {mapMutations} from 'vuex'
export default {
  components: {
    commonLeft: () => import('./components/commonLeft.vue'),
    charts: () => import('./charts/index.vue')
  },
  methods: {
    ...mapMutations(['addGroup']),
    add (data) {
      this.addGroup(data)
      this.$refs.charts.addGroup(data)
    },
    setPosition (type) {
      const zrender = this.$refs.charts.zr
      const _roots = zrender.storage._roots
      _roots.forEach(item => {
        switch (type) {
          case 'top':
            item.attr('position', [item.position[0], item.position[1] - 10])
            break
          case 'bottom':
            item.attr('position', [item.position[0], item.position[1] + 10])
            break
          case 'left':
            item.attr('position', [item.position[0] - 10, item.position[1]])
            break
          case 'right':
            item.attr('position', [item.position[0] + 10, item.position[1]])
            break
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.my_chart{
  width: 100%;
  height: 100vh;
  // overflow: hidden;
  box-sizing: border-box;

  .el-col{
    height: 100%;
  }
}
</style>
