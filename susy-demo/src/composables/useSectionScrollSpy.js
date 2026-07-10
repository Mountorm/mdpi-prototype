import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

/**
 * 右侧滚动容器内的 section 锚点高亮（常见固定探测线做法）。
 * - 激活线固定在滚动容器顶部附近
 * - 取「顶部已越过激活线」的最后一个 section
 * - 接近底部时强制高亮最后一项（矮 section 兜底）
 */
export function useSectionScrollSpy(getSectionIds, bodyRef, options = {}) {
  const activeSectionId = ref('')
  const offset = options.offset ?? 32
  const bottomThreshold = options.bottomThreshold ?? 4

  function getIds() {
    return typeof getSectionIds === 'function' ? getSectionIds() : getSectionIds
  }

  function updateActive() {
    const body = bodyRef.value
    const ids = getIds()
    if (!body || !ids?.length) {
      activeSectionId.value = ''
      return
    }

    const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight)
    if (maxScroll > 0 && body.scrollTop >= maxScroll - bottomThreshold) {
      activeSectionId.value = ids[ids.length - 1]
      return
    }

    const probeY = body.getBoundingClientRect().top + offset
    let current = ids[0]
    for (const id of ids) {
      const el = document.getElementById(id)
      if (!el) continue
      if (el.getBoundingClientRect().top <= probeY) {
        current = id
      }
    }
    activeSectionId.value = current
  }

  function scrollToSection(sectionId) {
    const body = bodyRef.value
    const el = document.getElementById(sectionId)
    if (!el || !body) return
    activeSectionId.value = sectionId
    const bodyRect = body.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = body.scrollTop + (elRect.top - bodyRect.top) - 8
    body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  function onScroll() {
    updateActive()
  }

  onMounted(() => {
    nextTick(() => {
      updateActive()
      bodyRef.value?.addEventListener('scroll', onScroll, { passive: true })
    })
  })

  onUnmounted(() => {
    bodyRef.value?.removeEventListener('scroll', onScroll)
  })

  watch(
    () => getIds()?.join?.(',') ?? '',
    () => nextTick(updateActive)
  )

  return { activeSectionId, scrollToSection, updateActive }
}
