import { IGroupPluginRegister } from '../type';
import { GroupPluginRegister } from '../constant';
import { registerRender } from './register-render';
import { registerLayer } from './register-layer';
import { registerGroupNode } from './register-group-node';
import { registerCleanGroups } from './register-clean-groups';

export const groupRegisters: Record<GroupPluginRegister, IGroupPluginRegister> = {
  [GroupPluginRegister.GroupNode]: registerGroupNode,
  [GroupPluginRegister.Render]: registerRender,
  [GroupPluginRegister.Layer]: registerLayer,
  [GroupPluginRegister.CleanGroups]: registerCleanGroups,
};
