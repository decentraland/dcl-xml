export const attributeValidators = new Map<string, (value: string) => void>([
  // BasicEntity
  ['id', isUniq],
  ['position', isVector3],
  ['scale', isOneNumberOrVector3],
  ['rotation', isVector3],
  ['look-at', isVector3],
  ['visible', isBoolean],
  ['billboard', isBillboard],
  // MaterialEntity
  ['color', isColor],
  ['with-collisions', isBoolean],
  // CircleEntity
  ['segments', isColor],
  ['arc', isColor],
  // PlaneEntity
  ['uvs', isOneNumber],
  ['radius', isOneNumber],
  ['arc', isOneNumber],
  ['radius-top', isOneNumber],
  ['radius-bottom', isOneNumber],
  ['segments-radial', isOneNumber],
  ['segments-height', isOneNumber],
  ['open-ended', isBoolean],
  // TextEntity
  ['outline-width', isOneNumber],
  ['outline-color', isColor],
  ['font-size', isOneNumber],
  ['opacity', isOneNumber],
  ['text-wrapping', isBoolean],
  ['h-align', isAlignment],
  ['v-align', isAlignment],
  ['width', isOneNumber],
  ['height', isOneNumber],
  ['line-count', isOneNumber],
  ['resize-to-fit', isBoolean],
  ['shadow-blur', isOneNumber],
  ['shadow-offset-x', isOneNumber],
  ['shadow-offset-y', isOneNumber],
  ['shadow-color', isColor],
  ['z-index', isOneNumber],
  ['padding-top', isOneNumber],
  ['padding-right', isOneNumber],
  ['padding-bottom', isOneNumber],
  ['padding-left', isOneNumber],
  // VideoEntity
  ['loop', isBoolean],
  ['play', isBoolean],
  ['volume', isOneNumber],
  // InputTextEntity
  ['max-length', isOneNumber]
])

const uniqValues = new Set()
function isUniq(value: string): void {
  if (uniqValues.has(value)) {
    throw new TypeError('Value must be uniq and is duplicated on this document')
  }
  uniqValues.add(value)
}

function isVector3(value: string): void {
  const variables = value.split(' ')
  if (variables.length !== 3 || !variables.every(variable => Number.isInteger(parseInt(variable, 10)))) {
    throw new TypeError('Must be Vector3Component type')
  }
}

function isOneNumber(value: string): void {
  const variables = value.split(' ')
  if (variables.length !== 1 || !Number.isInteger(parseInt(variables[0], 10))) {
    throw new TypeError('Must be a number')
  }
}

function isOneNumberOrVector3(value: string): void {
  try {
    isVector3(value)
  } catch (e) {
    try {
      isOneNumber(value)
    } catch (e) {
      throw new TypeError('Must be as number or a Vector3Component type')
    }
  }
}

function isBoolean(value: string): void {
  if (!value.match(/true|false/)) {
    throw new TypeError('Must be boolean value')
  }
}

function isColor(value: string): void {
  if (!value.match(/^#(?:[0-9a-f]{3}){1,2}$/i)) {
    throw new TypeError('Must be hex number color type')
  }
}

function isBillboard(value: string): void {
  if (!value.match(/[0-7]/)) {
    throw new TypeError('Must be number between 0 and 7')
  }
}

function isAlignment(value: string): void {
  if (!value.match(/top|right|bottom|left/)) {
    throw new TypeError('Must be `top`, `right`, `bottom` or `left`')
  }
}

export function resetUniq() {
  uniqValues.clear()
}
