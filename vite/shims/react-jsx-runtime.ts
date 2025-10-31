const REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element")
const REACT_FRAGMENT_TYPE = Symbol.for("react.fragment")

function jsxImpl(
  type: unknown,
  config: Record<string, any> | null = null,
  maybeKey?: string,
) {
  const configObj = config ?? {}
  let key: string | null = null

  if (maybeKey !== undefined) {
    key = `${maybeKey}`
  }

  if (configObj.key !== undefined) {
    key = `${configObj.key}`
  }

  const props = Object.prototype.hasOwnProperty.call(configObj, "key")
    ? Object.keys(configObj).reduce<Record<string, any>>((acc, propName) => {
        if (propName !== "key") {
          acc[propName] = configObj[propName]
        }
        return acc
      }, {})
    : configObj

  const ref = props.ref

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref: ref !== undefined ? ref : null,
    props,
  }
}

export const jsx = jsxImpl
export const jsxs = jsxImpl
export const jsxDEV = jsxImpl
export const Fragment = REACT_FRAGMENT_TYPE

const defaultExport = {
  Fragment,
  jsx,
  jsxs,
  jsxDEV,
}

export default defaultExport
