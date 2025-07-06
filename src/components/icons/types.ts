import type { JSX, RefAttributes } from "react"

export interface IconProps {
  className?: string
}

// export type SvgIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>

export type SvgIcon = (props: IconProps & RefAttributes<SVGSVGElement>) => JSX.Element
