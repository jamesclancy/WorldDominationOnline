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
  footer?: ReactNode;
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
        <footer className={styles.footer}>{props.footer}</footer>
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
    <Layout
      footer={
        <>
          <Link href="/about">About</Link> | <Link href="/rules">Rules</Link>
        </>
      }
    >
      <Container fluid>
        <Row>
          <Col>
            <h1 className="display-1">{props.title}</h1>
            {props.leadInText && <p className="lead">{props.leadInText}</p>}
            {props.children}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export default Layout;
