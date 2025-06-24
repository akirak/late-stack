import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { D2 } from "@terrastruct/d2"
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components"
import { ErrorBoundary } from "react-error-boundary"
import { CodeBlock } from "./CodeBlock"

type DiagramSyntax = "d2"

interface DiagramProps {
  lang: DiagramSyntax
  source: string
}

function D2Diagram({ source }: { source: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["d2", source],
    queryFn: async () => {
      const d2 = new D2()
      const result = await d2.compile(source)
      return d2.render(result.diagram, result.renderOptions)
    },
  })

  // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
  return <div dangerouslySetInnerHTML={{ __html: data }} />
}

function DiagramImage({ lang, source }: { lang: DiagramSyntax, source: string }) {
  switch (lang) {
    case "d2": {
      return <D2Diagram source={source} />
    }
    default: {
      return (
        <div>
          Unknown diagram type:
          {lang}
        </div>
      )
    }
  }
}

export function Diagram({ lang, source }: DiagramProps) {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <Tabs>
      <TabList aria-label="Switch between diagram presentation and code">
        <Tab id="diagram">Diagram</Tab>
        <Tab id="code">Code</Tab>
      </TabList>
      <TabPanel id="diagram">
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              There was an error!
              <button type="button" onClick={() => resetErrorBoundary()}>Try again</button>
            </div>
          )}
        >
          <DiagramImage lang={lang} source={source} />
        </ErrorBoundary>
      </TabPanel>
      <TabPanel id="code">
        <CodeBlock lang={lang} source={source} />
      </TabPanel>
    </Tabs>
  )
}
