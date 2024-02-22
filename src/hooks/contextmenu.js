import { ref, onMounted, onUnmounted } from "vue";

export function useContextmenu(container) {
  const visible = ref(false);
  const x = ref(0);
  const y = ref(0);

  onMounted(() => {
    container.value.addEventListener("contextmenu", showMenu);
    // 把事件注册到捕获阶段，改变触发不同元素相同事件的触发顺序
    window.addEventListener("contextmenu", hideMenu, true);
    window.addEventListener("click", hideMenu);
  });

  onUnmounted(() => {
    container.value.removeEventListener("contextmenu", showMenu);
  });

  function showMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    visible.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  }

  function hideMenu(e) {
    visible.value = false;
  }
  return { visible, x, y };
}
