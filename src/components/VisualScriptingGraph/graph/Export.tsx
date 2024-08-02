import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './Argument.css';
import { Export as ExportType } from '../components/types';

type ExportProps = {
  exp: ExportType;
};

const Export: React.FC<ExportProps> = ({ exp }) => {
  return (
    <li style={{position: "relative"}}>
      <Handle id={`${exp.name}-sourceLeft`} type="source" position={Position.Left} />
      <Handle id={`${exp.name}-sourceRight`} type="source" position={Position.Right} />
      <div style={{margin:"10px"}}>
        <span title={`${exp.type}\n${exp.doc}`}>
          {exp.name}
        </span>
      </div>
    </li>
  );
};

export default Export;