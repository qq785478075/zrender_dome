<template>
  <div class="left_box">
    <el-row class="title">添加盒子</el-row>
    <el-form :model="form" class="form" ref="form" label-width="80px">
      <el-form-item label="入口数量:">
        <el-input v-model.number="form.outNumber" size="mini" placeholder="请输入入口数量"></el-input>
      </el-form-item>
      <el-row type="flex" justify="end">
        <el-button type="primary" @click="add" size="mini" :loading="loading">添加</el-button>
      </el-row>
    </el-form>

    <el-row class="btns">
      <el-col :span="24">
        <el-button @click="setPosition('top')" size="mini">向上平移</el-button>
        <el-button @click="setPosition('bottom')" size="mini">向下平移</el-button>
      </el-col>
      <el-col :span="24">
        <el-button @click="setPosition('left')" size="mini">向左平移</el-button>
        <el-button @click="setPosition('right')" size="mini">向右平移</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const initFrom = {
  outNumber: 2
}
export default {
  data () {
    return {
      form: {
        ...initFrom,
        pos: [100, 100]
      },
      loading: false
    }
  },
  methods: {
    add () {
      this.loading = true
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          const data = this._.cloneDeep(this.form)
          data.id = new Date().getTime()
          await this.$emit('add', data)
          await this.initData()
        }
      })
    },
    initData () {
      this.loading = false
      this.form = {
        ...initFrom,
        pos: [100, 100]
      }
    },
    setPosition (type) {
      this.$emit('setPosition', type)
    }
  }
}
</script>
<style  lang="less" scoped>
.left_box {
  width: 100%;
  height: 100%;
  padding: 50px 20px;
  box-sizing: border-box;
  box-shadow: 0px 6px 10px 0px rgba(221, 226, 232, 0.8);

  .title {
    font-size: 18px;
    font-weight: bolder;
  }
  .form {
    margin-top: 20px;
  }
  .btns {
    margin-top: 20px;
    .el-button {
      margin-bottom: 20px;
    }
  }
}
</style>
