import { getRouterManifest } from "@tanstack/react-start/router-manifest"

import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server"
import { createRouter } from "./router"

const handler = createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultRenderHandler)

export default handler
