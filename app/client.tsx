import { StartClient } from "@tanstack/react-start"
import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { createRouter } from "./router"

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
