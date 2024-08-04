import React from 'react';
import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "../theme";
import VisualScriptingGraph from '../components/VisualScriptingGraph';

const VisualScripting: React.FC = () => {
  const styles = useStyles(getStyles);

  return (
    <div className={styles.container}>
      <VisualScriptingGraph />
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      position: absolute;
      top: 81px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    `,
  };
};

export default VisualScripting;