import { createFileRoute } from "@tanstack/react-router"
import { Option } from "effect"
import { readDataFile } from "@/utils/data"

export const Route = createFileRoute("/oembed/$embedId")({
  server: {
    handlers: {
      GET: async ({ params: { embedId } }) => {
        try {
          const html = Option.getOrThrow(readDataFile(`oembed/${embedId}.html`))

          const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
              </style>
            </head>
            <body>
              ${html}
              <script>
                window.onload = function() {
                  const embedId = "${embedId}";

                  let lastScrollHeight = document.documentElement.scrollHeight;

                  const observer = new MutationObserver(() => {
                    const currentScrollHeight = document.documentElement.scrollHeight;

                    if (currentScrollHeight !== lastScrollHeight) {
                      lastScrollHeight = currentScrollHeight;
                      window.parent.postMessage({ height: currentScrollHeight, embedId: embedId }, '*');
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
            </body>
            </html>
          `

          return new Response(fullHtml, {
            headers: {
              "Content-Type": "text/html",
              "Cache-Control": "public, max-age=3600",
            },
          })
        }
        catch (error) {
          console.error(`Error while displaying oembed: ${error}`)
          return new Response("Embed not found", { status: 404 })
        }
      },
    },
  },
})
