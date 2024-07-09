本项目将手把手实现一个基于Vue的通用的前端通用右键菜单，具有以下特性：

-   与业务代码完全解耦
-   支持嵌套元素的右键菜单
-   菜单项可灵活配置

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b1e77e4277a4502906a53ccb6e0f7bc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1920&h=1032&s=774446&e=gif&f=328&b=fdfcf9)

实现了一个小demo，演示地址：<https://contextmenu-murex.vercel.app/>

## 为什么要做右键菜单？

笔者做过一个思维导图项目，需要能够对思维导图上的节点和画布进行操作，如何实现呢？右键菜单是一个不错的选择，既不占用画布空间，又有丰富的功能可供选择。但问题来了，如何实现这样一个右键菜单：

-   组件使用方便
-   与业务代码解耦
-   针对不同的目标元素展示不同的右键菜单
-   右键菜单如何定位

## 组件的设计

比较容易想到的是：

-   向`ContextMenu`组件传递一个与其关联的容器，右击这个容器则显示右键菜单，这样的话需要向`ContextMenu`传递容器的真实DOM元素，这样的方式不够优雅也影响效率。

``` html
<ContextMenu :relation="componentA"/>
```

-   在容器组件中嵌套`ContextMenu`组件，这个方式下容器和右键菜单的关联关系不明显，而且更要命的是两者之间产生了耦合，`ContextMenu`依赖容器组件的数据。

``` html
<div class="componentA">
  <ContextMenu :porps=""/>
</div>
```

那么有没有既能与业务组件解耦，且代码组织优雅的设计方案呢？这里笔者参考了开源组件库里对冒泡（Popover），抽屉（Drawer），下拉菜单（Dropdown）等组件的设计方案，利用插槽将业务组件置于`ContextMenu`组件中，然后是右键菜单的具体实现。

``` html
<!-- ContextMenu 组件使用 -->
<!-- const menu = [
  { label: '部门' },
  { label: '员工' },
  { label: '角色' },
  { label: '权限' },
  { label: '领导' }
] -->
<ContextMenu :menu="menu" @select="console.log($event)">
    <!-- 业务组件 -->
</ContextMenu>


<!-- ContextMenu -->
<div ref="container">
  <slot></slot>
  <ul class="context-menu">
    <li></li>
    <!-- 菜单组件实现 -->
  </ul>
</div>
```

`ContextMenu`的使用上，需要提供菜单配置项，是一个数组，数组元素为必须包含`label`属性的对象，选定菜单中某一项，可监听`select`事件，然后执行相应的业务逻辑。

## 组件的布局方式

这个很容易想到，一定是要用固定定位，不管是哪个业务组件触发了右键菜单，其位置一定是相对于视口的。

但问题并不是这样就结束了，要知道默认情况下的固定定位位置相对于视口，但如果其父代中有`tranform`的元素，那么固定定位的位置是相对于这个元素的而不是视口。如果没有想到这个特性，就会产生严重的布局问题。

我们可以利用 Vue3 内置的`<Teleport>`组件，将右键菜单传送到`body`元素，这样无论如何右键菜单的定位位置都是相对于视口的。

``` html
<!-- ContextMenu -->
<div ref="container">
  <slot></slot>
  
  <Teleport to="body">
    <ul class="context-menu">
    <li></li>
    <!-- 菜单组件实现 -->
  </ul>
  </Teleport>
</div>
```

## 菜单组件的位置和可见度

设计好组件了，如何显示组件，并定位菜单的位置呢？

这里我们可以写一个`useContextMenu`的 hook，返回位置坐标`x`和`y`，以及可见度`visible`，并接收一个容器参数，因为需要监听各个需要右键菜单的容器的`contextmenu`事件。

这里需要注意位置坐标的要结合菜单height 和 width 来判断是否会相对视口越界，如果越界则自适应定位位置。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/382774a7a1934d32996c704ba300346f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=441&h=524&s=23291&e=png&b=acff2f)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66279afc43064d61ad090905d6d6ec53~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=381&h=515&s=24514&e=png&b=fefefe)

``` js
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

  function hideMenu(e) {
    visible.value = false;
  }
  return { visible, x, y };
}
```

这里控制右键菜单的显示和隐藏还是需要注意一些细节的，比如需要利用事件捕获改变事件的触发顺序，以及阻止冒泡，防止嵌套元素中出现重复右键菜单。

## 组件动画

这里要实现一个高度由 0 过渡到 h 的效果，利用`<Transition>`来实现，但有一个问题是：过渡效果是无法识别`height: auto`的，也就是高度无法从 0 过渡到 `auto`，那么就无法仅通过 CSS 来实现过渡动画，我们可以利用`<Transition>`的 JS 钩子函数，来手动计算子元素撑开的高度，然后在触发下一次渲染更新前手动设置`height`。

``` js
function handleEnter(el) {
  // 手动计算auto下撑开的容器高度
  el.style.height = 'auto'
  // 这里需要减去多余的padding
  const h = el.clientHeight - 12
  // 高度回归为0 否则没有过渡效果
  el.style.height = 0 + 'px'

  // 渲染下一帧之前，复制过渡和计算出的高度
  requestAnimationFrame(() => {
    el.style.height = h + 'px'
    el.style.transition = '.3s'
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
        <ul class="context-menu" >
          <li></li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
```

## 总结

好了，以上就是设计一个通用右键菜单组件的所有注意要点了，可以看到细节还是有一些的，比如：

-   组件的设计方案
-   固定定位的问题
-   事件触发模型
-   菜单定位越界控制
-   组件的auto高度过渡动画。

其实还有一种设计方案是函数式组件，利用 Vue API的`h`函数将 SFC 渲染为`VNode`，然后调用`render`方法将真实dom进行挂载，也支持菜单项的配置和业务解耦。
最后，如果有用的话欢迎 Star⭐~
