import { GIAssets, GIComponentConfig, useGraphInsightContainerLayout } from '@alipay/graphinsight';
import { Tabs } from 'antd';
import * as React from 'react';
import ReactDOM from 'react-dom';
import CollapseContainer from './CollapseContainer';
import './index.less';
import type { ContainerProps } from './typing';
import WrapTab from './WrapTab';
const { TabPane } = Tabs;

export interface OperatorBarProps extends ContainerProps {
  GI_CONTAINER: string[];
  components: GIComponentConfig[];
  assets: GIAssets;
  tabPosition: 'left' | 'right' | 'top' | 'bottom';
  /**
   * 是否在画布的外围
   */
  outSideFromCanvas: boolean;
  flexDirection: 'row' | 'column';
  GISDK_ID: string;
}

const SideTabs: React.FunctionComponent<OperatorBarProps> = props => {
  const {
    components,
    assets,
    placement,
    offset,
    width,
    height,
    defaultVisible,
    outSideFromCanvas,
    GISDK_ID,

    tabPosition,
  } = props;

  useGraphInsightContainerLayout(GISDK_ID, outSideFromCanvas, {
    placement,
    offset,
    width,
    height,
  });

  const sortedComponents = React.useMemo(() => {
    return (
      components
        //@ts-ignore
        .sort((a, b) => a.props.GI_CONTAINER_INDEX - b.props.GI_CONTAINER_INDEX)
        .filter(item => item.props?.GIAC_CONTENT)
    );
  }, [components]);

  const panes = React.useMemo(() => {
    return sortedComponents.map((item, index) => {
      if (!item) {
        return null;
      }
      const { props: itemProps, id: itemId } = item;
      const { component: Component } = assets[itemId];
      return (
        <TabPane key={index} tab={<WrapTab {...itemProps} />}>
          <Component {...itemProps} />
        </TabPane>
      );
    });
  }, [sortedComponents]);

  const Content = (
    <div className="gi-side-tabs">
      <Tabs defaultActiveKey="1" tabPosition={tabPosition}>
        {panes}
      </Tabs>
    </div>
  );

  console.log('sortedComponents', sortedComponents, props);

  if (!outSideFromCanvas) {
    return (
      <CollapseContainer
        width={width}
        height={height}
        defaultVisible={defaultVisible}
        placement={placement}
        offset={offset}
      >
        {Content}
      </CollapseContainer>
    );
  }
  return ReactDOM.createPortal(Content, document.getElementById(`${GISDK_ID}-container-extra`) as HTMLElement);
};

export default SideTabs;
