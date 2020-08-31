<template>
  <div class="charts_box">
    <div id="myCanvas"></div>
  </div>
</template>
<script>
export default {
  mounted () {
    this.$nextTick(() => {
      const canvas = document.getElementById('myCanvas')
      this.initCharts(canvas)
    })
  },
  methods: {
    initCharts (box) {
      const echarts = this.$echarts
      var myChart = echarts.init(box)

      // 关系坐标
      var xydata = [
        {
          source: [0, 1], // 盒子与盒子之间的关系
          children: [1, 0] // [输出, 输入]
        }
      ]
      // 节点坐标
      var dataArr = [
        {
          name: 'A',
          value: [15, 50]
        },
        {
          name: 'B',
          value: [-50, 10]
        },
        {
          name: 'C',
          value: [-55, -70]
        },
        {
          name: 'D',
          value: [40, -40]
        }
      ]

      // 当0时候表示输入起点坐标，其他值输入终点坐标
      var position = 0
      // 起点
      var positionSource
      // 终点
      var positionTarget
      // 设置判断点击线还是点击点
      var ok = 1
      // 删除数组的索引位置
      var del

      var links = xydata.map(function (item, i) {
        console.log(item, i)
        const start = item.source[0]
        const end = item.source[1]
        return {
          source: start,
          target: end
        }
      })

      var option = {
        title: {
          text: '可拖动流程图'
        },
        // 定义X轴
        xAxis: {
          min: -100,
          max: 100,
          type: 'value',
          axisLine: {
            onZero: false
          },
          show: false
        },
        yAxis: {
          min: -100,
          max: 100,
          type: 'value',
          axisLine: {
            onZero: false
          },
          show: false
        },
        series: [
          {
            // 设置id很重要
            id: 'a',
            // 设置为甘特图
            type: 'graph',
            layout: 'none',
            coordinateSystem: 'cartesian2d',
            label: {
              show: false,
              formatter: function (d, i) {
                return dataArr[d.dataIndex].name
              }
            },
            itemStyle: {
              show: false,
              borderColor: 'transparent',
              borderWidth: 0,
              color: 'transparent'
            },
            // 指定数据数组
            data: echarts.util.map(dataArr, function (item, di) {
              return item.value
            }),
            // 指定连线方式
            edges: links,
            // 指定连线颜色
            lineStyle: {
              normal: {
                color: '#22faf7'
              }
            }
          }
        ]
      }

      // 在demo里，必须要加setTimeout ，否则执行 myChart.convertToPixel 会报错
      setTimeout(function () {
        initGraphic()
        // 窗口大小改事件
        window.addEventListener('resize', updatePosition)
      }, 0)

      // 重新定位图形元素
      function updatePosition () {
        myChart.setOption({
          graphic: echarts.util.map(dataArr, function (item, dataIndex) {
            return {
              position: myChart.convertToPixel('grid', item.value)
            }
          })
        })
      }

      // 绘制图形元素
      function initGraphic () {
        myChart.setOption({
          graphic: echarts.util.map(dataArr, function (item, dataIndex) {
            return {
              type: 'group',
              id: `group_${dataIndex}`,
              position: myChart.convertToPixel('grid', item.value),
              children: [
                {
                  type: 'rect',
                  z: 100,
                  left: 'center',
                  top: 'center',
                  shape: {
                    width: 40,
                    height: 20
                  },
                  style: {
                    fill: '#fff',
                    stroke: '#999',
                    lineWidth: 1,
                    shadowBlur: 8,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                    shadowColor: 'rgba(0,0,0,0.3)'
                  }
                },
                {
                  type: 'circle',
                  z: 100,
                  top: 4,
                  left: 'center',
                  shape: {
                    // 拖动点的大小
                    r: 5
                  },
                  style: {
                    fill: '#0fe82e',
                    borderColor: '#0fe82e',
                    borderWidth: 1
                  },
                  onclick: echarts.util.curry(initLinks, {
                    dataIndex: dataIndex,
                    index: 0,
                    type: 'output'
                  })
                },
                {
                  type: 'circle',
                  z: 100,
                  top: -14,
                  left: '5',
                  shape: {
                    // 拖动点的大小
                    r: 5
                  },
                  style: {
                    fill: '#0692eb',
                    borderColor: '#0692eb',
                    borderWidth: 1
                  },
                  onclick: echarts.util.curry(initLinks, {
                    dataIndex: dataIndex,
                    index: 1,
                    type: 'input'
                  })
                },
                {
                  type: 'circle',
                  z: 100,
                  top: -14,
                  left: '-15',
                  shape: {
                    // 拖动点的大小
                    r: 5
                  },
                  style: {
                    fill: '#0692eb',
                    borderColor: '#0692eb',
                    borderWidth: 1
                  },
                  onclick: echarts.util.curry(initLinks, {
                    dataIndex: dataIndex,
                    index: 2,
                    type: 'input'
                  })
                }
              ],
              // 指定虚拟圈是否可见  false 可见
              invisible: true,
              // 指定圈被拖拽（可以与不可以）
              draggable: true,
              //   ondrag: echarts.util.curry(onPointDragging, dataIndex),
              //   onclick: echarts.util.curry(initLinks, dataIndex),
              onmouseup: echarts.util.curry(onPointDragging, dataIndex),
              // 层级
              z: 100
            }
          })
        })
      }
      // 图形元素拖动后， 修改节点位置
      function onPointDragging (dataIndex, dx, dy) {
        dataArr[dataIndex].value = myChart.convertFromPixel(
          'grid',
          this.position
        )
        // Update data
        myChart.setOption({
          series: [
            {
              id: 'a',
              data: dataArr
            }
          ]
        })
      }

      // 绘制添加的连线
      function initLinks (data) {
        const dataIndex = data.dataIndex
        for (var i = 0; i < dataArr.length; i++) {
          if (i == dataIndex) {
            ok = 0
            if (position == 0) {
              positionSource = i
              position = 1
            } else {
              positionTarget = i
              position = 0
              xydata.push([positionSource, positionTarget])
              // 当xydata值改变时linkss方法需要重新跑一变
              var linkss = xydata.map(function (item, i) {
                return {
                  source: xydata[i][0],
                  target: xydata[i][1]
                }
              })
              // 重新载入的东西都写在这里
              myChart.setOption({
                series: [
                  {
                    edges: linkss,
                    // 指定连线颜色
                    lineStyle: {
                      normal: {
                        color: '#22faf7'
                      }
                    }
                  }
                ]
              })
              return true
            }
            break
          }
        }
      }

      // 点击事件 , 删除连线
      myChart.on('click', function (params) {
        if (params.componentType != 'series' || params.dataType != 'edge') {
          return
        }

        var a = [params.data.source, params.data.target]
        for (var i = 0; i < xydata.length; i++) {
          if (
            params.data.source == xydata[i][0] &&
            params.data.target == xydata[i][1]
          ) {
            del = i
            xydata.splice(del, 1)
            // 当xydata值改变时linkss方法需要重新跑一变
            var linkss = xydata.map(function (item, i) {
              return {
                source: xydata[i][0],
                target: xydata[i][1]
              }
            })
            // 重新载入的东西都写在这里
            myChart.setOption({
              series: [
                {
                  edges: linkss
                }
              ]
            })
            return true
          }
        }
      })

      myChart.setOption(option)
    }
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
