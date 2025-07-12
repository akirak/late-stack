declare module "*.module.css" {
  const classes: { [key: string]: string }
}

declare module "*.css?url" {
  const url: string
  export default url
}

declare module "*.css" {
  const styles: string
  export default styles
}
