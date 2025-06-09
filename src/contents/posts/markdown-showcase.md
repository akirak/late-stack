---
title: Markdown Showcase
language: en
draft: true
---

# Markdown Showcase

This post demonstrates various Markdown features and how they render in the blog.

## Text Formatting

Regular text with **bold text**, _italic text_, and **_bold italic text_**.

You can also use ~~strikethrough~~ text.

### Code

Inline `code` looks like this.

```javascript
// Code block with syntax highlighting
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet("World")
```

```python title="Python example" frame="code"
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

```bash
# Shell commands
npm install
npm run dev
```

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered Lists

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Links and Images

[External link to TanStack](https://tanstack.com)

[Internal link to about page](/about)

## Blockquotes

> This is a blockquote. It can contain multiple paragraphs.
>
> Like this second paragraph.

> **Note**: Blockquotes can also contain other formatting like **bold** and _italic_ text.

## Tables

| Feature     | Support | Notes               |
| ----------- | ------- | ------------------- |
| Headers     | ✅      | Full support        |
| Code blocks | ✅      | Syntax highlighting |
| Images      | ✅      | Local and remote    |
| Tables      | ✅      | Markdown tables     |
| Math        | ❓      | To be tested        |

## Horizontal Rules

I don't plan on using horizontal rules in my blog.

Content before hr

---

Content after hr

## Footnotes

Alpha[^micromark], bravo[^micromark], and charlie[^remark].

[^remark]: things about remark

[^micromark]: things about micromark

## Mixed Content Example

Here's a more complex example combining multiple elements:

### Task List

- [x] Set up blog structure
- [x] Add Markdown support
- [ ] Add comment system
- [ ] Implement search

### Code Example with Explanation

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

> **Tip**: This pattern is commonly used in TypeScript applications for type-safe data formatting.

## Conclusion

This showcase demonstrates the rich Markdown support available in this TanStack Start blog. The content pipeline processes all these elements seamlessly from Markdown to the final rendered output.

---

_Last updated: December 9, 2024_
