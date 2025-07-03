declare module "remark-captions" {

  /**
   * Configuration options for remark-captions plugin
   */
  export interface RemarkCaptionsOptions {
    /**
     * External captions configuration - captions that appear outside/after the captioned element
     * Maps MDAST node types to their caption trigger strings
     */
    external?: {
      /**
       * Caption trigger for table elements
       * @default "Table:"
       */
      table?: string
      /**
       * Caption trigger for code block elements
       * @default "Code:"
       */
      code?: string
      /**
       * Caption trigger for math block elements
       */
      math?: string
      /**
       * Caption trigger for iframe elements
       */
      iframe?: string
      /**
       * Custom node type caption triggers
       */
      [nodeType: string]: string | undefined
    }

    /**
     * Internal captions configuration - captions that appear inside the captioned element
     * Maps MDAST node types to their caption trigger strings
     */
    internal?: {
      /**
       * Caption trigger for blockquote elements
       * @default "Source:"
       */
      blockquote?: string
      /**
       * Caption trigger for image elements
       * @default "Figure:"
       */
      image?: string
      /**
       * Caption trigger for inline math elements
       */
      inlineMath?: string
      /**
       * Custom node type caption triggers
       */
      [nodeType: string]: string | undefined
    }
  }

  /**
   * Remark plugin that adds custom syntax to add captions to elements.
   * Wraps the captioned element in a figure node with figcaption node as last child.
   *
   * @param options - Configuration options for the plugin
   * @returns A unified plugin
   */
  function remarkCaptions(options: RemarkCaptionsOptions): (tree: any) => Promise<void>

  export default remarkCaptions
}
