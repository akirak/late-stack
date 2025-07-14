import { useEffect, useState } from "react"
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components"
import ExpandIcon from "@/components/icons/Expand"

export interface OembedFrameProps {
  title?: string
  html: string
  id?: string
  width?: number | string
  height?: number | string
  className?: string
  sandbox?: string
}

export default function OembedFrame({
  title,
  html,
  id,
  width,
  height,
  className = "",
  sandbox = "allow-scripts allow-same-origin",
}: OembedFrameProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scroll, setScroll] = useState(0)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

  const extendedHtml = `
    ${html}
    <script>
      window.onload = function() {
        const iframeId = "${id}";
        if (iframeId.length === 0) {
          return
        }

        let lastScrollHeight = document.documentElement.scrollHeight;

        const observer = new MutationObserver(() => {
          const currentScrollHeight = document.documentElement.scrollHeight;

          if (currentScrollHeight !== lastScrollHeight) {
            lastScrollHeight = currentScrollHeight;
            window.parent.postMessage({ height: currentScrollHeight, iframeId: iframeId }, '*');
          }
        });

        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      };
    </script>
  `

  const setModalOpen = (open: boolean) => {
    if (open) {
      setScroll(window.scrollY)
      setIsModalOpen(open)
    }
    else {
      setIsModalOpen(open)
      window.scrollTo({ top: scroll, behavior: "instant" })
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.height
        && event.data.iframeId === id
      ) {
        setContentHeight(event.data.height)
      }
    }
    window.addEventListener("message", handleMessage, false)
    return () => {
      window.removeEventListener("message", handleMessage, false)
    }
  }, [id])

  return (
    <div className={`oembed-frame-container ${className}`} id={id}>
      <figure>
        <div className="oembed-frame">
          <iframe
            srcDoc={extendedHtml}
            title={title || `Embedded content - ${Date.now()}`}
            width={width}
            height={height}
            // eslint-disable-next-line react-dom/no-missing-iframe-sandbox
            sandbox={sandbox}
          />
          <div className="button-group oembed-frame-buttons">
            <Button
              onPress={() => setModalOpen(true)}
              aria-label="Open the embed in modal"
              className="expand-button"
            >
              <ExpandIcon className="icon" />
            </Button>
          </div>
        </div>
        {title && <figcaption>{title}</figcaption>}
      </figure>

      <ModalOverlay
        isDismissable
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        className="react-aria-ModalOverlay"
      >
        <Modal className="oembed-modal">
          <Dialog className="oembed-dialog" aria-label={title}>
            <Button
              onPress={() => setIsModalOpen(false)}
              aria-label="Close modal"
              className="close-modal visually-hidden"
            >
              <span>Close</span>
            </Button>
            <figure className="oembed-frame oembed-frame-expanded">
              <iframe
                srcDoc={extendedHtml}
                title={`${title || "Embedded content"} - Modal view - ${Date.now()}`}
                width={width}
                height={contentHeight}
                // eslint-disable-next-line react-dom/no-missing-iframe-sandbox
                sandbox={sandbox}
              />
            </figure>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  )
}
