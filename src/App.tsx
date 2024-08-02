import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "./theme";
import { Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import Home from './pages/Home';
import VisualScripting from './pages/VisualScripting';

function App() {
  const styles = useStyles(getStyles);

  return (
    <div className={styles.container}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="visual-scripting" element={<VisualScripting />} />
        </Route>
      </Routes>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      background: ${theme.colors.background.primary};
      font-family: Inter, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      justify-content: flex-start;
      padding-bottom: 10em;
    `,
  };
};

export default App;