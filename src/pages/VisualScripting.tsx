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
      margin-top: 81px;
    `,
  };
};

export default VisualScripting;