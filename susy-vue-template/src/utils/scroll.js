// 组件目录内定位：不使用 URL hash，全部走脚本滚动
import { onBeforeUnmount, onMounted, ref } from 'vue'

const OFFSET = 96

export function scrollToId(id) {
  if (!id) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - OFFSET,
    behavior: 'smooth',
  })
}

// 根据滚动位置反推当前所在区块，供侧边栏高亮
export function useActiveSection(getIds) {
  const activeId = ref('')
  let frame = 0

  function update() {
    frame = 0
    const ids = getIds()
    let current = ids[0] || ''
    for (const id of ids) {
      const el = document.getElementById(id)
      if (!el) continue
      if (el.getBoundingClientRect().top - OFFSET <= 0) current = id
      else break
    }
    activeId.value = current
  }

  function onScroll() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    // 路由组件异步加载，区块可能还没挂载，短暂重试
    let tries = 0
    const ensure = () => {
      update()
      if (!activeId.value && tries++ < 20) setTimeout(ensure, 150)
    }
    ensure()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
  })

  return { activeId }
}
