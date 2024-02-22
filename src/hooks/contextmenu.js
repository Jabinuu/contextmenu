import { ref, onMounted, onUnmounted, nextTick } from "vue";

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

    nextTick(() => {
      const { clientX, clientY } = e;
      const menuContainer = document.querySelector(".context-menu");
      const { clientWidth: menuWidth, clientHeight: menuHeight } =
        menuContainer;
      const isOverPortWidth = clientX + menuWidth > window.innerWidth;
      const isOverPortHeight = clientY + menuHeight > window.innerHeight;

      if (isOverPortWidth) {
        x.value = clientX - menuWidth;
        y.value = clientY;
      }
      if (isOverPortHeight) {
        x.value = clientX;
        y.value = clientY - menuHeight;
      }
      if (!isOverPortHeight && !isOverPortWidth) {
        x.value = clientX;
        y.value = clientY;
      }
    });
  }

  function hideMenu() {
    visible.value = false;
  }
  return { visible, x, y };
}
