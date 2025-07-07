export interface Heading {
  id?: string
  text: string
  level: number
}

type NestedHeading = Heading & {
  children: NestedHeading[]
}

function buildNestedHeadings(flatHeadings: Heading[]): NestedHeading[] {
  const result: NestedHeading[] = []
  const stack: NestedHeading[] = []

  flatHeadings.forEach((heading) => {
    const newNode = { ...heading, children: [] }
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(newNode)
    }
    else {
      result.push(newNode)
    }

    stack.push(newNode)
  })

  return result
};

function TocItem({ heading }: { heading: NestedHeading }) {
  return (
    <li key={heading.id || heading.text}>
      { heading.id
        ? (
            <a
              href={`#${heading.id}`}
              data-heading-id={heading.id}
            >
              {heading.text}
            </a>
          )
        : heading.text }
      {heading.children.length > 0 && (
        <ul>
          {heading.children.map(child => (
            <TocItem key={child.id || child.text} heading={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

export interface TocProps {
  headings: Heading[]
}

export function Toc({ headings }: TocProps) {
  const baseLevel = headings.map(({ level }) => level).reduce((a, b) => Math.min(a, b), Infinity)

  const nestedHeadings = buildNestedHeadings(headings.map(h => ({ ...h, level: h.level - baseLevel })))

  return (
    <ul className="table-of-contents">
      {nestedHeadings.map(heading => (
        <TocItem key={heading.id || heading.text} heading={heading} />
      ))}
    </ul>
  )
}
