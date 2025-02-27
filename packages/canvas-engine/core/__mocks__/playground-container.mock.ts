import { Playground, createPlaygroundContainer } from '../src'

export function createPlayground(): Playground {
  return createPlaygroundContainer().get(Playground)
}
