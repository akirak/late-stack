import type { Key } from "react-aria-components"
import { useRef, useState } from "react"
import { Button, Dialog, Modal, Tab, TabList, TabPanel, Tabs } from "react-aria-components"
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

  const ref1 = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  // Prevent layout shift when switching tabs
  const handleTabChange = (key: Key) => {
    if (key === "code" && ref1.current) {
      setHeight(ref1.current.getBoundingClientRect().height)
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
