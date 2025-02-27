import React, { useMemo, useImperativeHandle, forwardRef } from 'react';

import { type interfaces } from 'inversify';

import { PluginContext, loadPlugins, type PluginsProvider } from '../plugin';
import { createPlaygroundContainer } from '../playground-container';
import { Playground } from '../playground';
import { PlaygroundContext } from '../common';
import {
  PlaygroundReactContainerContext,
  PlaygroundReactContext,
  PlaygroundReactRefContext,
} from './playground-react-context';

export interface PlaygroundReactProviderProps {
  containerModules?: interfaces.ContainerModule[]; // 注入的 IOC 包
  parentContainer?: interfaces.Container;
  playgroundContainer?: interfaces.Container; // 由外部加载 playgroundContainer, 和 container 不能共存
  playgroundContext?: any; // 注入到画布中的 context, 所有的 layer 都能拿到
  autoFocus?: boolean; // 是否会自动触发画布 focus，默认 true
  autoResize?: boolean; // 是否允许根据浏览器自动 resize, 默认 true
  zoomEnable?: boolean; // 是否允许缩放，默认 true
  plugins?: PluginsProvider<any>;
  customPluginContext?: (container: interfaces.Container) => PluginContext; // 自定义插件的上下文
  children?: React.ReactNode;
}

/**
 * Playground react 组件
 * @param props
 */
export const PlaygroundReactProvider = forwardRef<
  PlaygroundContext | any,
  PlaygroundReactProviderProps
>(function PlaygroundReactProvider(props, ref) {
  const {
    containerModules,
    playgroundContext,
    parentContainer: fromContainer,
    playgroundContainer,
    plugins,
    customPluginContext,
    ...others
  } = props;

  /**
   * 创建 IOC 包
   */
  const container = useMemo(() => {
    let flowContainer: interfaces.Container;
    // 忽略所有 containerModules, 由外部加载 container,
    if (playgroundContainer) {
      flowContainer = playgroundContainer;
    } else {
      flowContainer = createPlaygroundContainer(
        {
          autoFocus: true,
          autoResize: true,
          zoomEnable: true,
          ...others,
        },
        fromContainer,
      );
      if (playgroundContext) {
        flowContainer.rebind(PlaygroundContext).toConstantValue(playgroundContext);
      }
      if (containerModules) {
        containerModules.forEach(module => flowContainer.load(module));
      }
    }
    return flowContainer;
    // @action 这里 props 数据如果更改不会触发刷新，不允许修改
  }, []);
  const playground = useMemo(() => {
    const playground = container.get(Playground);
    let ctx: PluginContext;
    if (customPluginContext) {
      ctx = customPluginContext(container);
      container.rebind(PluginContext).toConstantValue(ctx);
    } else {
      ctx = container.get<PluginContext>(PluginContext);
    }
    if (plugins) {
      loadPlugins(plugins(ctx), container);
    }
    playground.init();
    return playground;
  }, []);

  useImperativeHandle(ref, () => container.get<PluginContext>(PluginContext), []);

  return (
    <PlaygroundReactContainerContext.Provider value={container}>
      <PlaygroundReactRefContext.Provider value={playground}>
        <PlaygroundReactContext.Provider value={playgroundContext}>
          {props.children}
        </PlaygroundReactContext.Provider>
      </PlaygroundReactRefContext.Provider>
    </PlaygroundReactContainerContext.Provider>
  );
});
