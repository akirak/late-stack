import { useEffect, useRef } from "react"

function updateTocLocation(id: string) {
  const current = document.querySelectorAll(".table-of-contents [aria-current='location']")
  Array.from(current).forEach((el) => {
    el.removeAttribute("aria-current")
  })
  const newCurrent = document.querySelector(`.table-of-contents [data-heading-id="${id}"]`)
  if (newCurrent) {
    newCurrent.setAttribute("aria-current", "location")
  }
}

export function useSticky(selector: string) {
  const ref = useRef<Element | null>(null)

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
        ref.current = element
        element.classList.add("sticky-active")
        updateTocLocation(element.id)
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.boundingClientRect.bottom > -100) {
            // scroll down
            if (ref.current) {
              ref.current.classList.remove("sticky-active")
            }
            ref.current = entry.target
            entry.target.classList.add("sticky-active")
            updateTocLocation(entry.target.id)
          }
        }
        else {
          if (ref.current === entry.target) {
            ref.current.classList.remove("sticky-active")
            ref.current = null
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
        if (ref.current?.id === headingId) {
          const sibling = ref.current.nextElementSibling
          if (sibling) {
            event.preventDefault()
            const upper = ref.current.getBoundingClientRect().bottom
            const top = sibling.getBoundingClientRect().top
            const dx = top - upper - 15 // Add margin
            window.scrollBy({
              top: dx,
              behavior: "smooth",
            })
          }
          updateTocLocation(headingId)
        }
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick, false)
    }
  }, [])
}
