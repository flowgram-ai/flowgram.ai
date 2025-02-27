import { IGroupPluginRegister } from '../type';
import { GroupsLayer } from '../groups-layer';

/** 注册背景层 */
export const registerLayer: IGroupPluginRegister = (ctx, opts) => {
  ctx.playground.registerLayer(GroupsLayer, opts);
};
