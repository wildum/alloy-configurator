import React from 'react';
import { Handle, Position, Connection } from '@xyflow/react';
import './Argument.css';
import { Export as ExportType } from '../components/types';

type ExportProps = {
  exp: ExportType;
  onConnect: (connection: Connection) => void;
};

const Export: React.FC<ExportProps> = ({ exp, onConnect }) => {
  return (
    <li style={{position: "relative"}}>
      <Handle 
        id={`${exp.name}-sourceLeft`} 
        type="source" 
        position={Position.Left}
        onConnect={onConnect}
      />
      <Handle 
        id={`${exp.name}-sourceRight`} 
        type="source" 
        position={Position.Right}
        onConnect={onConnect}
      />
      <div style={{margin:"10px"}}>
        <span title={`${exp.type}\n${exp.doc}`}>
          {exp.name}
        </span>
      </div>
    </li>
  );
};

export default Export;