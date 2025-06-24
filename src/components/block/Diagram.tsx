import { Tab, TabList, TabPanel, Tabs } from "react-aria-components"
import { CodeBlock } from "./CodeBlock"

type DiagramSyntax = "d2"

interface DiagramProps {
  codeLanguage: DiagramSyntax
  code: string
  __html: string
}

export function Diagram({ codeLanguage, code, __html }: DiagramProps) {
  return (
    <Tabs>
      <TabList aria-label="Switch between diagram presentation and code">
        <Tab id="diagram">Diagram</Tab>
        <Tab id="code">Code</Tab>
      </TabList>
      <TabPanel id="diagram">
        { /* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */ }
        <div dangerouslySetInnerHTML={{ __html }} />
      </TabPanel>
      <TabPanel id="code">
        <CodeBlock language={codeLanguage} code={code} />
      </TabPanel>
    </Tabs>
  )
}
