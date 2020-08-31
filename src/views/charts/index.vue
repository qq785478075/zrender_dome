<template>
  <div class="charts_box">
    <div id="myCanvas"></div>
  </div>
</template>
<script>
import zrender from 'zrender'
import {mapState, mapMutations} from 'vuex'
export default {
  data () {
    return {
      height: 50, // 盒子高度
      spacing: 25, // 圆点之间的间距
      zr: null,
      output: null, // 输出元素
      outputPost: [], // 输出元素坐标
      input: null, // 输入元素
      inputPost: [], // 输入元素坐标
      lineData: { // 连接线
        output: {},
        input: {}
      }
    }
  },
  mounted () {
    this.$nextTick(async () => {
      await this.initCanvas()
      await this.initDrawLine()
    })
  },
  methods: {
    ...mapMutations(['setGroup', 'addLine', 'removeLine']),
    /**
     * 初始化画布
     */
    initCanvas () {
      const myCanvas = document.getElementById('myCanvas')
      // eslint-disable-next-line new-cap
      const zr = new zrender.init(myCanvas)
      this.zr = zr
      const group = this.group
      for (let i = 0, l = group.length; i < l; i++) {
        this.addGroup(group[i])
      }
    },
    addGroup (data) {
      const zr = this.zr
      const g = new zrender.Group()
      g.attr('position', data.pos)
      g.attr({
        id: `group_${data.id}`
      })
      this.addBox(g, data)
      this.addInput(g, data)
      this.addOutput(g, data)
      let NEWDATA = data
      g.on('drag', NEWDATA, (e) => {
        const pos = [e.offsetX, e.offsetY]
        g.attr('position', pos)
        NEWDATA.pos = pos
        this.setGroup(NEWDATA)
        for (var i = 0; i < g.childCount(); i++) {
          var child = g.childAt(i)
          child.position = [0, 0]
        }
        g.dirty()
        // 盒子组拖动 重新绘制 连线
        g.afterUpdate = () => {
          const _roots = zr.storage._roots
          // eslint-disable-next-line camelcase
          const g_id = g.id.split('group_')[1]
          _roots.forEach(item => {
          // 根据 连线ID line_**_**类型 取得 关联的线条 元素
            if (item.id.includes(g_id) && item.id.includes('line_')) {
              const id = item.id.split('_')
              const inputId = id[1]
              const outputId = id[2]
              const x1 = item.shape.x1
              const x2 = item.shape.x2
              const y1 = item.shape.y1
              const y2 = item.shape.y2
              const line = this.line
              let lineData = {}
              line.forEach(item => {
                // eslint-disable-next-line eqeqeq
                if (item.output == outputId && item.input == inputId) {
                  lineData = item
                }
              })
              // console.log(item)
              // console.log(x1, x2, y1, y2)
              // console.log(lineData)
              if (g_id.includes(inputId) && g_id.includes(outputId)) {
                // console.log('同一个盒子内')
                const width = g.childAt(0).shape.width / 2
                item.attr({
                  shape: {
                    x1: pos[0] + lineData.currentInput * this.spacing,
                    y1: pos[1],
                    x2: pos[0] + width,
                    y2: pos[1] + this.height
                  }
                })
              } else if (g_id.includes(inputId)) {
                // console.log(`inputId*****${inputId}`)
                item.attr({
                  shape: {
                    x1: pos[0] + lineData.currentInput * this.spacing,
                    y1: pos[1],
                    x2: x2,
                    y2: y2
                  }
                })
              } else {
                const width = g.childAt(0).shape.width / 2
                // console.log(`outputId*****${outputId}`)
                item.attr({
                  shape: {
                    x1: x1,
                    y1: y1,
                    x2: pos[0] + width,
                    y2: pos[1] + this.height
                  }})
              }
            }
          })
        }
      })
      zr.add(g)
    },
    /**
     * 添加 盒子
     */
    addBox (box, data) {
      const height = parseFloat(this.height)
      const spacing = parseFloat(this.spacing)
      // 绘制矩形
      const RECT = new zrender.Rect({
        shape: {
          x: 0,
          y: 0,
          width: (data.outNumber + 1) * spacing,
          height: height
        },
        style: {
          fill: '#fff',
          stroke: '#000',
          lineWidth: 1,
          shadowBlur: 0
        },
        rectHover: false, // 检验鼠标是否移动到物体
        draggable: true // 图形是否可拖曳
      })
      box.add(RECT)
    },
    /**
     * 绘制输出
     */
    addOutput (box, data) {
      const spacing = parseFloat(this.spacing)
      // 绘制 圆
      const CIRCLE = new zrender.Circle({
        draggable: false, // 图形是否可拖曳
        shape: {
          r: 6,
          cx: (data.outNumber + 1) * spacing / 2, // 居中
          cy: 50
        },
        style: {
          fill: '#0fe82e'
        },
        z: 1
      })
      CIRCLE.attr({
        id: `output_${data.id}`
      })
      CIRCLE.on('click', (e) => {
        console.log(e, 'output')
        this.setIsLine('output', e.target)
      })
      box.add(CIRCLE)
    },
    /**
     * 绘制输入
     */
    addInput (box, data) {
      const spacing = parseFloat(this.spacing)
      // 绘制 圆
      for (let i = 0, l = data.outNumber; i < l; i++) {
        const CIRCLE = new zrender.Circle({
          draggable: false, // 图形是否可拖曳
          shape: {
            r: 6,
            cx: spacing * (i + 1)
          },
          style: {
            fill: '#0692eb'
          },
          z: 1
        })
        CIRCLE.attr({
          id: `input_${data.id}`
        })
        CIRCLE.on('click', (e) => {
          console.log(e, 'input')
          this.setIsLine('input', e.target)
        })
        box.add(CIRCLE)
      }
    },
    /**
     * 设置是否连线
     */
    setIsLine (type, data) {
      const lineData = this.lineData
      this.lineData[type] = data
      if (lineData.input.id && lineData.output.id) {
        let ID = this.getIOID(lineData['output'], 'output')
        const INPUTID = this.getIOID(lineData['input'], 'input')
        const OUTPUTID = this.getIOID(lineData['output'], 'output')
        // 输入 输出为同一个盒子
        if (INPUTID === OUTPUTID) {
          ID = `line_${INPUTID}_${INPUTID}`
        } else {
          ID = `line_${INPUTID}_${OUTPUTID}`
        }
        lineData.id = ID
        const zr = this.zr
        const _roots = zr.storage._roots
        _roots.forEach(item => {
          if (item.id === ID) {
            this.zr.remove(item)
            this.removeLineState(ID)
          }
        })
        const currentInput = parseFloat(lineData['input'].shape.cx / this.spacing)
        let line = {
          output: OUTPUTID, // 输出
          input: INPUTID, // 输入
          currentInput: currentInput// 当前输入 第几个
        }
        this.addLine(line)
        this.drawLine(lineData)
      }
    },
    /**
     * 绘制连线
     */
    drawLine (data) {
      // const lineList = this.line
      const zr = this.zr
      const input = data['input']
      const output = data['output']
      const inputPostX = input.parent.position[0] + input.shape.cx // 输入元素坐标
      const inputPostY = input.parent.position[1] + input.shape.cy // 输入元素坐标
      const outputPostX = output.parent.position[0] + output.shape.cx // 输入元素坐标
      const outputPostY = output.parent.position[1] + output.shape.cy // 输入元素坐标
      let ID = this.getIOID(data['output'], 'output')
      const INPUTID = this.getIOID(data['input'], 'input')
      const OUTPUTID = this.getIOID(data['output'], 'output')
      if (INPUTID === OUTPUTID) {
        ID = `line_${INPUTID}_${INPUTID}`
      } else {
        ID = `line_${INPUTID}_${OUTPUTID}`
      }
      const line = new zrender.Line({
        shape: {
          x1: inputPostX,
          y1: inputPostY,
          x2: outputPostX,
          y2: outputPostY
        }
      })
      line.attr({
        id: ID
      })
      line.on('click', (e) => {
        // console.log(e)
        // 移除连线
        this.removeLineState(ID)
        zr.remove(e.target)
      })
      zr.add(line)
      this.initLineData()
    },
    /**
     * 初始化 绘制连线信息
     */
    initLineData () {
      this.output = null // 输出元素
      this.outputPost = [] // 输出元素坐标
      this.input = null // 输入元素
      this.inputPost = [] // 输入元素坐标
      this.lineData = {
        output: {},
        input: {}
      }
    },
    /**
     * 移除vuex 缓存的连线
     */
    removeLineState (ID) {
      let lineList = this._.cloneDeep(this.line)
      let newLine = []
      lineList.forEach((item, index) => {
        const itemId = `line_${item.input}_${item.output}`
        console.log(itemId, ID)
        // eslint-disable-next-line eqeqeq
        if (itemId != ID) {
          newLine.push(item)
        }
      })
      console.log(newLine)
      this.removeLine(newLine)
    },
    /**
     * 获取输入、输出、盒子 ID
     */
    getIOID (data, key) {
      return data.id.split(`${key}_`)[1]
    },
    /**
     * 初始 绘制线条
     */
    initDrawLine () {
      const zr = this._.cloneDeep(this.zr)
      const line = this._.cloneDeep(this.line)
      const _roots = zr.storage._roots
      const spacing = this.spacing
      const data = {}
      if (line.length <= 0 && _roots.length <= 0) return
      line.forEach(lineItem => {
        _roots.forEach(_rootsItem => {
          // console.log(lineItem)
          // console.log(_rootsItem)
          // 获取输入点信息
          if (_rootsItem.id === `group_${lineItem.input}`) {
            _rootsItem._children.forEach(clidrenItem => {
              // eslint-disable-next-line eqeqeq
              if (clidrenItem.id === `input_${lineItem.input}` && spacing * parseFloat(lineItem.currentInput) == clidrenItem.shape.cx) {
                data['input'] = clidrenItem
              }
            })
          }
          // 获取输出点信息
          if (_rootsItem.id === `group_${lineItem.output}`) {
            _rootsItem._children.forEach(clidrenItem => {
              if (clidrenItem.id === `output_${lineItem.output}`) {
                data['output'] = clidrenItem
              }
            })
          }
        })
        this.drawLine(data)
      })
    }
  },
  computed: {
    ...mapState({
      group: state => state.group,
      line: state => state.line
    })
  }
}
</script>
<style lang="less" scoped>
.charts_box {
  width: 100%;
  height: 100%;

  #myCanvas {
    width: 100%;
    height: 100%;
  }
}
</style>
