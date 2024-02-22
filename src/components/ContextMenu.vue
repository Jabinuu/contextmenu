<script setup >
import { useContextmenu } from '../hooks/contextmenu.js'
import { ref } from 'vue';

defineProps(['menu'])
const emit = defineEmits(['select'])
const container = ref()
const { visible, x, y } = useContextmenu(container)

function handleEnter(el) {
  // 手动计算auto下撑开的容器高度
  el.style.height = 'auto'
  // 这里需要减去多余的padding
  const h = el.clientHeight - Number(getComputedStyle(el).paddingTop.match(/^\d+/)[0]) * 2
  // 高度回归为0 否则没有过渡效果
  el.style.height = 0 + 'px'

  // 渲染下一帧之前，复制过渡和计算出的高度
  requestAnimationFrame(() => {
    el.style.height = h + 'px'
    el.style.transition = 'height.3s'
  })
}

// 进入动画结束后，关闭过渡，否则关闭菜单时有时延
function handdleAfterEnter(el) {
  el.style.transition = 'none'
}
</script>

<template>
  <div ref="container">
    <slot></slot>
    <Teleport to="body">
      <Transition @enter="handleEnter" @after-enter="handdleAfterEnter">
        <ul class="context-menu" v-if="visible" :style="{ top: `${y + 5}px`, left: `${x + 10}px` }">
          <li v-for="(item, index) in menu" :key="index" @click="emit('select', item)">
            {{ item.label }}
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.context-menu {
  overflow: hidden;
  margin: 0px;
  padding: 6px 0px;
  border-radius: 4px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.1);
  list-style: none;
  position: fixed;
  width: 120px;
  background-color: #fff;
}

.context-menu>li {
  cursor: pointer;
  margin-bottom: 8px;
  line-height: 1.8;
  display: block;
  text-align: center;
}

.context-menu>li:last-child {
  margin-bottom: 0px;
}

.context-menu>li:hover {
  background-color: rgba(100, 149, 247, 0.4)
}

.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
