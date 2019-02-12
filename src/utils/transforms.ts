import { Vector3, Quaternion, Transform } from 'decentraland-ecs'

export function toVector3(target: string): Vector3 {
  const [x, y, z] = target.split(' ').map(s => parseFloat(s))
  return new Vector3(x, y, z)
}

export function toQuaternion(target: string): Quaternion {
  const [x, y, z] = target.split(' ').map(s => parseFloat(s))
  return Quaternion.Euler(x, y, z)
}

export function hasDefaultValues(transform: Transform) {
  const isDefaultPosition = transform.position.x === 0 && transform.position.isNonUniform
  const isDefaultScale = transform.scale.x === 0 && transform.scale.isNonUniform
  const isDefaultRotation = transform.rotation.equals(Quaternion.Zero())
  return isDefaultPosition && isDefaultScale && isDefaultRotation
}
