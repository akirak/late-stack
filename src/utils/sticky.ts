import { useEffect, useRef } from "react"

export function useSticky(selector: string) {
  const sticky = useRef<Element | null>(null)

  useEffect(() => {
    const targets = document.querySelectorAll(selector)

    const setLastHiddenTarget = () => {
      const hiddenElements = Array.from(targets).filter(
        el => el.getBoundingClientRect().bottom < 0,
      )
      if (hiddenElements.length > 0) {
        const element = hiddenElements.sort((a, b) => {
          return b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom
        })[0]
        sticky.current = element
        element.classList.add("sticky-active")
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.boundingClientRect.bottom > -100) {
            // scroll down
            if (sticky.current) {
              sticky.current.classList.remove("sticky-active")
            }
            sticky.current = entry.target
            entry.target.classList.add("sticky-active")
          }
        }
        else {
          if (sticky.current === entry.target) {
            sticky.current.classList.remove("sticky-active")
            sticky.current = null
            setLastHiddenTarget()
          }
        }
      })
    }, {
      rootMargin: "50% 0px -98% 0px",
    })

    targets.forEach(target => observer.observe(target))

    return () => {
      observer.disconnect()
    }
  }, [selector])

  // If the user clicks on the anchor of the sticky element, scroll to the
  // beginning of the next element
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const parent = (event.target as HTMLElement)?.parentNode as HTMLElement | null
      if (parent) {
        const headingId = parent.getAttribute("data-heading-id")
        if (sticky.current?.id === headingId) {
          const sibling = sticky.current.nextElementSibling
          if (sibling) {
            event.preventDefault()
            const upper = sticky.current.getBoundingClientRect().bottom
            const top = sibling.getBoundingClientRect().top
            const dx = top - upper - 15 // Add margin
            window.scrollBy({
              top: dx,
              behavior: "smooth",
            })
          }
        }
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick, false)
    }
  }, [])
}
