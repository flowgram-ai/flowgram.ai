import { EntityManager, PlaygroundConfigEntity, PlaygroundContainerModule } from '@flowgram.ai/core'
import { Container } from 'inversify'

export function createPlaygroundContainer(): Container {
  const container = new Container()
  container.load(PlaygroundContainerModule)
  return container
}

export function createPlaygroundConfigEntity(): PlaygroundConfigEntity {
  return createPlaygroundContainer()
    .get<EntityManager>(EntityManager)
    .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity, true)!
}
