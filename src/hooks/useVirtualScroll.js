import { useRef, useState, useCallback } from 'react'
export function useVirtualScroll({ totalItems, rowHeight, viewportHeight, buffer = 3 }) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef(null)
  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer)
  const visibleCount = Math.ceil(viewportHeight / rowHeight)
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + buffer * 2)
  const totalHeight = totalItems * rowHeight
  const offsetY = startIndex * rowHeight
  return { scrollRef, onScroll, startIndex, endIndex, totalHeight, offsetY, scrollTop }
}
