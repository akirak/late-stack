import { lazy, Suspense } from "react"
import { Loading } from "@/components/inline/Loading"

const DiagramLazy = lazy(() => import("@/components/block/Diagram"))
const LinkCardLazy = lazy(() => import("@/components/block/LinkCard"))
const LiteYouTubeLazy = lazy(() => import("@/components/block/LiteYouTube"))
const OembedFrameLazy = lazy(() => import("@/components/block/OembedFrame"))

export function Diagram(props: any) {
  return (
    <Suspense fallback={<Loading />}>
      <DiagramLazy {...props} />
    </Suspense>
  )
}

export function LinkCard(props: any) {
  return (
    <Suspense fallback={<Loading />}>
      <LinkCardLazy {...props} />
    </Suspense>
  )
}

export function LiteYouTube(props: any) {
  return (
    <Suspense fallback={<Loading />}>
      <LiteYouTubeLazy {...props} />
    </Suspense>
  )
}

export function OembedFrame(props: any) {
  return (
    <Suspense fallback={<Loading />}>
      <OembedFrameLazy {...props} />
    </Suspense>
  )
}
