import { CommandBar, CommandBarButton, ICommandBarItemProps, INavLink, INavLinkGroup, Nav, Stack, StackItem, ThemeProvider } from "@fluentui/react";
import Link from "next/link";

import styles from "../styles/Layout.module.css";
interface ILayoutProps {
  expandedNavLinkGroup?: INavLink;
}

const navLinkGroups: (optionalAddition?: ICommandBarItemProps) => ICommandBarItemProps[] = (
  optionalAddition?: ICommandBarItemProps
) => {
  if (optionalAddition !== undefined)
    return [
          {
            name: "Home",
            url: "/",
            key: "home",
          },
          optionalAddition,
          {
            name: "Leader Board",
            url: "/leader-board",
            key: "leader-board",    iconProps: { iconName: 'Add' },
          }
    ];

  return [
        {
          name: "Home",
          url: "/",
          key: "home",
          text:"Home",
          
        },
        {
          name: "Leader Board",
          url: "/leader-board",
          key: "leader-board",
          text:"Leader Board"
        }
  ];
};

const stackTokens: IStackTokens = { childrenGap: 40 };
export function Layout(props: React.PropsWithChildren<ILayoutProps>) {
  return (
    <ThemeProvider>
      <Stack>
      <div className={styles.headerBar}>
        <h1> WORLD DOMINATION</h1>
        <Stack horizontal   tokens={stackTokens}>
        <Link href={"/"}>Home</Link>
      <Link href={"/leader-board"}>Leader Board</Link>
      
        </Stack>
      </div>
        <Stack horizontal className={"mainContainer"} style={{width:"100%"}}>
          <StackItem grow  className={styles.mainContent}>
          {props.children}
          </StackItem>
        </Stack>
        <footer className={styles.footer}>
          <a href="/about">About</a> | <a href="/rules">Rules</a>
        </footer>
      </Stack>
    </ThemeProvider>
  );
}
