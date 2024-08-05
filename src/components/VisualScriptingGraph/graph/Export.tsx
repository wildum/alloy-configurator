import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './Argument.css';
import { Export as ExportType } from '../components/types';

type ExportProps = {
  exp: ExportType;
  nodeId: string;
};

const Export: React.FC<ExportProps> = ({ exp, nodeId }) => {
  return (
    <li style={{position: "relative"}}>
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
      <div style={{margin:"10px"}}>
        <span title={`${exp.type}\n${exp.doc}`} className="argument-name">
          {exp.name}
        </span>
      </div>
    </li>
  );
};

export default Export;