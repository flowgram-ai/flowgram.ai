import { type EntityManager } from './entity-manager';

export const EntityManagerContribution = Symbol('EntityManagerContribution');

export interface EntityManagerContribution {
  registerEntityManager(entityManager: EntityManager): void;
}
