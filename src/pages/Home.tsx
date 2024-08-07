import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "../theme";
import {
  Alert,
  LinkButton,
  Button,
  Modal,
  Input,
  Icon,
  Tooltip,
  VerticalGroup,
} from "@grafana/ui";
import ConfigEditor from "../components/ConfigEditor";
import ExamplesCatalog from "../components/ExamplesCatalog";
import { useModelContext } from "../state";
import InstallationInstructions from "../components/InstallationInstructions";
import ConfigurationWizard from "../components/ConfigurationWizard";
import Converter from "../components/Converter";
import GraphPanel from "../components/GraphPanel";

function Home() {
  const styles = useStyles(getStyles);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [examplesCatalogOpen, setExamplesCatalogOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const { model } = useModelContext();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const converterEnabled = !!process.env.REACT_APP_CONVERT_ENDPOINT;

  const shareLink = useMemo(
    () => `${window.location}?c=${btoa(model)}`,
    [model],
  );

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5 * 1000);
  };

  const openVisualScripting = () => {
    navigate('/visual-scripting');
  };

  return (
    <>
      <section className={styles.firstSection}>
        <div className={styles.hero}>
          <h1>Welcome to the Grafana Alloy Configuration Generator</h1>
          <p>
            This tool allows for easy configuration of Grafana Alloy.
          </p>
          <p>
            Try the new visual scripting feature!
          </p>
          <div className={styles.buttonBar}>
            <Button onClick={openVisualScripting} variant="primary">
              Open visual scripting tool
            </Button>
          </div>
          <hr />
          <VerticalGroup>
            <p>
              To get started with the classic configurator click on <code>Add Component</code> in the editor below
            </p>
            <p>
              If this is your first time working with Grafana Alloy, we
              recommend you use the configuration wizard or get started with an
              example configuration, based on your usecase.
            </p>
            <div className={styles.buttonBar}>
              <Button onClick={() => setWizardOpen(true)} variant="primary">
                Start configuration wizard
              </Button>
              {converterEnabled && (
                <Button onClick={() => setConverterOpen(true)} variant="secondary">
                  Convert your existing configuration
                </Button>
              )}
              <Button onClick={() => setExamplesCatalogOpen(true)} variant="secondary">
                Open examples catalog
              </Button>
              <LinkButton
                variant="secondary"
                href="https://grafana.com/docs/alloy/latest/"
                target="_blank"
                icon="external-link-alt"
              >
                View Alloy Docs
              </LinkButton>
              <div className={css`flex-grow: 1;`}></div>
              <Button onClick={() => setGraphOpen(true)} variant="secondary" icon="sitemap">
                Visualize
              </Button>
            </div>
          </VerticalGroup>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.editorWindow}>
          <ConfigEditor />
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.shareSection}>
          <h4>Share this Configuration</h4>
          <p>To share this configuration, use the following link:</p>
          <VerticalGroup>
            <Input
              value={shareLink}
              readOnly
              addonAfter={
                <Tooltip content={(copied ? "Copied" : "Copy") + " link to clipboard"}>
                  <Button variant="secondary" onClick={copyLink}>
                    <Icon name={copied ? "check" : "copy"} />
                  </Button>
                </Tooltip>
              }
            />
            <Alert
              severity="warning"
              title="By copying the link to your clipboard you may be unintentionally sharing sensitive data. Check the included information before copying and ensure that you avoid sharing confidential data like secrets or API-Tokens"
            ></Alert>
          </VerticalGroup>
        </div>
      </section>
      <section className={styles.section}>
        <InstallationInstructions />
      </section>
      <Modal
        title="Configuration Wizard"
        isOpen={wizardOpen}
        onDismiss={() => setWizardOpen(false)}
        className={styles.wizardModal}
      >
        <ConfigurationWizard dismiss={() => setWizardOpen(false)} />
      </Modal>
      <Modal
        title="Examples Catalog"
        isOpen={examplesCatalogOpen}
        onDismiss={() => setExamplesCatalogOpen(false)}
      >
        <ExamplesCatalog dismiss={() => setExamplesCatalogOpen(false)} />
      </Modal>
      <Modal
        title="Configuration Converter"
        isOpen={converterOpen}
        onDismiss={() => setConverterOpen(false)}
      >
        <Converter dismiss={() => setConverterOpen(false)} />
      </Modal>
      <Modal
        title="Visualization"
        isOpen={graphOpen}
        onDismiss={() => setGraphOpen(false)}
        className={styles.wizardModal}
      >
        <GraphPanel />
      </Modal>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    section: css`
      width: 100%;
      padding-top: 20px;
      display: flex;
      justify-content: center;
    `,
    firstSection: css`
      width: 100%;
      padding-top: 20px;
      display: flex;
      justify-content: center;
      margin-top: 81px;
    `,
    hero: css`
      width: 80vw;
    `,
    editorWindow: css`
      height: 60vh;
      width: 80vw;
      padding: 10px;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      border-radius: 2px;
      background-color: ${theme.colors.background.secondary};
    `,
    shareSection: css`
      width: 80vw;
      display: block;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      background-color: ${theme.colors.background.secondary};
      border-radius: 2px;
      padding: ${theme.spacing(2, 2)};
    `,
    buttonBar: css`
      display: flex;
      gap: 0.5rem;
      width: 100%;
    `,
    wizardModal: css`
      min-width: 50%;
    `,
  };
};

export default Home;