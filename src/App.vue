<script setup>
import ContextMenu from './components/ContextMenu.vue';
import { ref } from 'vue';
const leftMenu = [
  { label: '部门' },
  { label: '员工' },
  { label: '角色' },
  { label: '权限' },
  { label: '领导' }
]
const leftSelected = ref('')

const rightMenu = [
  { label: '添加' },
  { label: '删除' },
  { label: '修改' },
  { label: '查看' },
  { label: '删除' }
]
const rightSelected = ref('')

const rightInnerMenu = [
  {
    label: '菜单1',
    subMenu: [
      { label: '子菜单1' },
      { label: '子菜单2' },
      { label: '子菜单3' }
    ]
  },
  { label: '菜单2' },
  { label: '菜单3' },
  { label: '菜单4' },
  { label: '菜单5' }
]
const rightInnerSelected = ref('')
</script>

<template>
  <div id="container">
    <ContextMenu :menu="leftMenu" @select="leftSelected = $event.label" style="flex: 1;">
      <div id="left" style="overflow: hidden;">
        <h1>{{ leftSelected }}</h1>
      </div>
    </ContextMenu>

    <ContextMenu :menu="rightMenu" @select="rightSelected = $event.label" style="flex:1;">
      <div id="right" style="overflow: hidden;">
        <h1>{{ rightSelected }}</h1>
        <ContextMenu :menu="rightInnerMenu" @select="rightInnerSelected = $event.label">
          <div id="right-inner" style="overflow: hidden;">
            <h1>{{ rightInnerSelected }}</h1>
          </div>
        </ContextMenu>
      </div>
    </ContextMenu>
  </div>
</template>

<style scoped>
#container {
  display: flex;
}

#left {
  height: 50vh;
  margin-right: 30px;
  background-color: skyblue;
}

#right {
  position: relative;
  box-sizing: border-box;
  height: 50vh;
  padding: 20px;
  background-color: greenyellow;
}

#right-inner {
  position: absolute;
  bottom: 20px;
  width: calc(100% - 40px);
  height: 100px;
  background-color: green;
}
</style>
