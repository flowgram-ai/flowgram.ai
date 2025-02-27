import { type interfaces } from 'inversify';

export function bindContributions(bind: interfaces.Bind, target: any, contribs: any[]) {
  bind(target).toSelf().inSingletonScope();
  contribs.forEach(contrib => bind(contrib).toService(target));
}
