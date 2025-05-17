declare module "*.css?url" {
  const url: string
  export default url
}

declare module "*.css" {
  const styles: Record<string, string>
  export default styles
}
