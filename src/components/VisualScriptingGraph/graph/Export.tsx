import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Export as ExportType } from '../components/types';
import { css } from '@emotion/css';

type ExportProps = {
  exp: ExportType;
  nodeId: string;
};

const Export: React.FC<ExportProps> = ({ exp, nodeId }) => {
  return (
    <li style={{ position: "relative" }}>
      <Handle
        id={`${nodeId}.${exp.name}-sourceLeft`}
        type="source"
        position={Position.Left}
      />
      <Handle
        id={`${nodeId}.${exp.name}-sourceRight`}
        type="source"
        position={Position.Right}
      />
      <div className={styles.centerContent}>
        <span className={styles.export} title={`${exp.type}\n${exp.doc}`}>
          {exp.name}
        </span>
      </div>
    </li>
  );
};

const styles = {
  centerContent: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  export: css`
    position: relative;
    display: inline-block;

    &:hover::after {
      content: attr(title);
      background-color: #333;
      color: #fff;
      padding: 5px;
      border-radius: 3px;
      position: absolute;
      left: 100%;
      top: 0;
      white-space: pre;
      z-index: 10;
      transform: translateX(10px);
    }
  `
};

export default Export;
