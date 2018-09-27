export function camelCase(name: string) {
  return name.replace(/(?:-([a-z]))/g, (_, part) => {
    return part.toUpperCase()
  })
}
