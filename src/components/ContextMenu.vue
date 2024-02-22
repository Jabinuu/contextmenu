<script setup lang="ts">
import { useContextmenu } from '../hooks/contextmenu.js'
import { ref } from 'vue';

defineProps(['menu'])
const emit = defineEmits(['select'])
const container = ref()
const { visible, x, y } = useContextmenu(container)

</script>

<template>
  <div ref="container">
    <slot></slot>
    <Teleport to="body">
      <Transition name="fade">
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
