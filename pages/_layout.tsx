import Link from "next/link";
import {
  Col,
  Container,
  Nav,
  Navbar,
  Row,
  ThemeProvider,
} from "react-bootstrap";
import { useSession, signIn, signOut } from "next-auth/react";

import styles from "../styles/Layout.module.css";
import { ReactNode } from "react";

interface ILayoutProps {
  footer?: boolean;
}

const loginBar = (session: any) => {
  if (session) {
    return (
      <>
        <Nav.Link href={`/user/${session.user.name}`}>
          Signed in as {session.user.name}
        </Nav.Link>
        <Nav.Link onClick={() => signOut()}>Sign out.</Nav.Link>
      </>
    );
  }
  return <Nav.Link onClick={() => signIn()}>Not signed in Sign in</Nav.Link>;
};

export function Layout(props: React.PropsWithChildren<ILayoutProps>) {
  const { data: session } = useSession();
  return (
    <ThemeProvider>
      <Navbar bg="primary" variant="dark">
        <Container fluid>
          <Navbar.Brand href="/">World Domination</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/leader-board">Leader Board</Nav.Link>
          </Nav>
          <Nav className="justify-right">{loginBar(session)}</Nav>
        </Container>
      </Navbar>
      <Container fluid className={"mainContainer"} style={{ width: "100%" }}>
        <div className={styles.mainContent}>{props.children}</div>
      </Container>
      {props.footer && (
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
          <ul className="nav col-md-12 justify-content-end">
            <li className="nav-item">
              <a href="/" className="nav-link px-2 text-muted">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a href="/leader-board" className="nav-link px-2 text-muted">
                Leader Board
              </a>
            </li>
            <li className="nav-item">
              <a href="/about" className="nav-link px-2 text-muted">
                About
              </a>
            </li>
            <li className="nav-item">
              <a href="/rules" className="nav-link px-2 text-muted">
                Rules
              </a>
            </li>
            <li className="nav-item">
              <a
                href="https://github.com/jamesclancy/WorldDominationOnline"
                className="nav-link px-2 text-muted"
                target="_blank"
              >
                View Source
              </a>
            </li>
          </ul>
        </footer>
      )}
    </ThemeProvider>
  );
}

interface IGeneralPageLayoutProps {
  title: string;
  leadInText?: string;
}

export function GeneralPageLayout(
  props: React.PropsWithChildren<IGeneralPageLayoutProps>
) {
  return (
    <Layout footer={true}>
      <Container fluid>
        <Row>
          <Col>
            <h1 className="display-4">{props.title}</h1>
            {props.leadInText && <p className="lead">{props.leadInText}</p>}
            {props.children}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export default Layout;
