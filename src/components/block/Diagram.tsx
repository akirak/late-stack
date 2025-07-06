import type { Key } from "react-aria-components"
import { useRef, useState } from "react"
import { Button, Dialog, Modal, Tab, TabList, TabPanel, Tabs, Tooltip, TooltipTrigger } from "react-aria-components"
import CopyIcon from "../icons/Copy"
import ExpandIcon from "../icons/Expand"
import { CodeBlock } from "./CodeBlock"

type DiagramSyntax = "d2"

interface DiagramProps {
  codeLanguage: DiagramSyntax
  code: string
  __html: string
  title?: string
  id: string
  className?: string
}

export function Diagram({ className, codeLanguage, code, __html, title }: DiagramProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const ref1 = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  // Prevent layout shift when switching tabs
  const handleTabChange = (key: Key) => {
    if (key === "code" && ref1.current) {
      setHeight(ref1.current.getBoundingClientRect().height)
    }
  }

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsTooltipOpen(true)
      setTimeout(() => setIsTooltipOpen(false), 1000)
    }
    catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <>
      <Tabs className="diagram-tabs" onSelectionChange={handleTabChange}>
        <TabList aria-label="Switch between diagram presentation and code">
          <Tab id="diagram">Diagram</Tab>
          <Tab id="code">
            Code (
            {codeLanguage}
            )
          </Tab>
        </TabList>
        <TabPanel id="diagram" ref={ref1}>
          <div className="diagram-container">
            <figure>
              { /* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */ }
              <div className={`diagram ${className || ""}`} dangerouslySetInnerHTML={{ __html }} />

              { title && (
                <figcaption>{title}</figcaption>
              )}

              <div className="button-group">
                <Button
                  onPress={() => setIsModalOpen(true)}
                  aria-label="Open the diagram in modal"
                >
                  <ExpandIcon className="icon" />
                </Button>
              </div>
            </figure>
          </div>
        </TabPanel>
        <TabPanel id="code" style={{ height: height || "auto" }}>
          <div className="diagram-code">
            <CodeBlock language={codeLanguage} code={code} />
          </div>
          <div className="button-group diagram-code-buttons">
            <TooltipTrigger
              isOpen={isTooltipOpen}
              onOpenChange={setIsTooltipOpen}
              delay={0}
              closeDelay={500}
              trigger="focus"
            >
              <Button
                onPress={handleCopyCode}
                aria-label="Copy code to clipboard"
                className="copy-button"
              >
                <CopyIcon className="icon" />
              </Button>
              <Tooltip placement="left">
                Copied!
              </Tooltip>
            </TooltipTrigger>
          </div>
        </TabPanel>
      </Tabs>
      <Modal
        isDismissable
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        className="diagram-modal"
      >
        <Dialog className="diagram-dialog">
          <Button
            onPress={() => setIsModalOpen(false)}
            aria-label="Close modal"
            className="close-modal"
          >
            Close
          </Button>
          <figure>
            { /* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */ }
            <div className={`diagram ${className || ""}`} dangerouslySetInnerHTML={{ __html }} />
            { title && (
              <figcaption>{title}</figcaption>
            )}
          </figure>
        </Dialog>
      </Modal>
    </>
  )
}
