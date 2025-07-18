import type { JSX, RefAttributes } from "react"

export interface IconProps {
  className?: string
  width?: string | number
  height?: string | number
}

// export type SvgIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>

export type SvgIcon = (props: IconProps & RefAttributes<SVGSVGElement>) => JSX.Element
