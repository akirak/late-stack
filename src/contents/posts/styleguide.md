---
title: Content Style Guide
language: en
publicationDate: "1970-01-01T12:00:00+09:00"
description: Guide to content styles on jingsi.space.
---

:::warning
Most part of this content is AI-generated.
:::

This post demonstrates various Markdown features and how they render in the blog.

## Text Formatting {#text-formatting}

Regular text with **bold text**, _italic text_, and **_bold italic text_**.

You can also use ~~strikethrough~~ text.

### Code {#code}

Inline `code` looks like this.

```javascript
// Code block with syntax highlighting
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet("World")
```

```python collapse={2-4} title="Python example" frame="code"
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

```diff lang="bash"
# Shell commands
-npm install
-npm run dev
+pnpm install
+pnpm run dev
```

## Lists {#lists}

### Unordered Lists {#unordered-lists}

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered Lists {#ordered-lists}

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Links and Images {#links-and-images}

[External link to TanStack](https://tanstack.com)

[Internal link to about page](/about)

## Blockquotes {#blockquotes}

> This is a blockquote. It can contain multiple paragraphs.
>
> Like this second paragraph.

> **Note**: Blockquotes can also contain other formatting like **bold** and _italic_ text.

## Tables {#tables}

Basic table with headers:

| Feature     | Support | Notes               |
| ----------- | ------- | ------------------- |
| Headers     | ✅      | Full support        |
| Code blocks | ✅      | Syntax highlighting |
| Images      | ✅      | Local and remote    |
| Tables      | ✅      | Markdown tables     |
| Math        | ❓      | To be tested        |

Table: Blog feature support status

More complex table with alignment:

| Framework | Language | Performance | Learning Curve | Ecosystem |
| :-------- | :------: | ----------: | :------------: | :-------- |
| React     |  JS/TS   |        High |     Medium     | Excellent |
| Vue       |  JS/TS   |        High |      Easy      | Good      |
| Angular   |    TS    |        High |      Hard      | Good      |
| Svelte    |  JS/TS   |   Very High |      Easy      | Growing   |

Table: JavaScript framework comparison with column alignment

Table with longer content:

| HTTP Status | Name                  | Description                                                                       |
| ----------- | --------------------- | --------------------------------------------------------------------------------- |
| 200         | OK                    | The request has succeeded. The meaning of the success depends on the HTTP method. |
| 201         | Created               | The request has been fulfilled and resulted in a new resource being created.      |
| 400         | Bad Request           | The server could not understand the request due to invalid syntax.                |
| 401         | Unauthorized          | Authentication is required and has failed or has not yet been provided.           |
| 404         | Not Found             | The server can not find the requested resource.                                   |
| 500         | Internal Server Error | The server has encountered a situation it doesn't know how to handle.             |

Table: Common HTTP status codes and their meanings

<!--
## Horizontal Rules {#horizontal-rules}

I don't plan on using horizontal rules in my blog.

Content before hr

---

Content after hr
-->

## Footnote references

Alpha[^micromark], bravo[^micromark], and charlie[^remark].

[^remark]: things about remark

[^micromark]: things about micromark

## Mixed Content Example {#mixed-content}

Here's a more complex example combining multiple elements:

### Task List {#task-list}

- [x] Set up blog structure
- [x] Add Markdown support
- [ ] Add comment system
- [ ] Implement search

### Code Example with Explanation {#code-example}

The following TypeScript code demonstrates a simple utility function:

```typescript
interface User {
  id: number
  name: string
  email: string
}

function formatUser(user: User): string {
  return `${user.name} <${user.email}>`
}

// Usage
const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
}

console.log(formatUser(user)) // Output: John Doe <john@example.com>
```

:::tip
This pattern is commonly used in TypeScript applications for type-safe data formatting.
:::

## Admonitions {#admonitions}

:::tip
Use keyboard shortcuts to boost your productivity! Try `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette in VS Code.
:::

:::important
Always backup your database before running migration scripts in production. This simple step can save you from hours of recovery work.
:::

:::warning
The `dangerouslySetInnerHTML` prop bypasses React's built-in XSS protection. Only use it with trusted content that you have sanitized yourself.
:::

:::error
Missing environment variable `DATABASE_URL`. Make sure to set this in your `.env` file before starting the application.
:::

:::info[Performance optimization (info with a custom title)]
Consider using `React.memo()` for components that receive the same props frequently. This can significantly reduce unnecessary re-renders in your application.
:::

## Embedded contents {#embedded}

### YouTube {#youtube}

::link[https://www.youtube.com/watch?v=l7OPFjPjtGs]

## Diagrams {#diagrams}

Supported via `diagram` custom directive.

### Simple diagram

:::diagram

```d2
x -> y -> z
```

:::

### More complex diagram

:::diagram

```d2
# Network Architecture
api: API Gateway {
  shape: hexagon
}
lambda: Lambda Function {
  shape: oval
}
db: Database {
  shape: cylinder
}

api -> lambda: HTTP Request
lambda -> db: Query
db -> lambda: Result
lambda -> api: Response
```

:::

## Conclusion {#conclusion}

This showcase demonstrates the rich Markdown support available in this TanStack Start blog. The content pipeline processes all these elements seamlessly from Markdown to the final rendered output.
