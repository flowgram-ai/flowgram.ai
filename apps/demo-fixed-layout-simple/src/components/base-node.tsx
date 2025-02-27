import { FlowNodeEntity, useNodeRender } from '@flowgram.ai/fixed-layout-editor';

export const BaseNode = ({ node }: { node: FlowNodeEntity }) => {
  /**
   * Provides methods related to node rendering
   * 提供节点渲染相关的方法
   */
  const nodeRender = useNodeRender();
  /**
   * It can only be used when nodeEngine is enabled
   * 只有在节点引擎开启时候才能使用表单
   */
  const form = nodeRender.form;

  return (
    <div
      className="demo-fixed-node"
      /*
       * onMouseEnter is added to a fixed layout node primarily to listen for hover highlighting of branch lines
       * onMouseEnter 加到固定布局节点主要是为了监听 分支线条的 hover 高亮
       **/
      onMouseEnter={nodeRender.onMouseEnter}
      onMouseLeave={nodeRender.onMouseLeave}
      onMouseDown={(e) => {
        // trigger drag node
        nodeRender.startDrag(e);
        e.stopPropagation();
      }}
      style={{
        /**
         * Lets you precisely control the style of branch nodes
         * 用于精确控制分支节点的样式
         * isBlockIcon: 整个 condition 分支的 头部节点
         * isBlockOrderIcon: 分支的第一个节点
         */
        ...(nodeRender.isBlockOrderIcon || nodeRender.isBlockIcon ? { width: 260 } : {}),
      }}
    >
      {form?.render()}
    </div>
  );
};
