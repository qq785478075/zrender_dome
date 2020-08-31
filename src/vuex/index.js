import Vue from 'vue'
import Vuex from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    group: [], // 盒子
    line: []// 连线
  },
  mutations: {
    /**
     * 添加 盒子
     */
    addGroup (state, data = {
      outNumber: 2
    }) {
      state.group.push(data)
    },
    /**
     * 修改盒子数据
     */
    setGroup (state, data) {
      const group = cloneDeep(state.group)
      group.forEach((item, index) => {
        if (`group_${item.id}` === data.id) {
          state.group[index] = data
        }
      })
    },
    /**
     * 添加连线
     */
    addLine (state, data = []) {
      state.line.push(data)
    },
    /**
     * 移除线条数据
     */
    removeLine (state, data) {
      state.line = data
    }
  }

})
