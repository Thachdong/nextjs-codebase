import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import styles from "~modules-dashboard/styles/layout/sidebar.module.css";
import React, { useCallback, useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { menu } from "~modules-dashboard/layouts/data";
import Image from "next/image";
import clsx from "clsx";
import MenuIcon from "@mui/icons-material/Menu";
import { ExpandedMenu } from "./ExpandedMenu";
import { BaseButton } from "~modules-core/components";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type TProps = {
  expand: boolean;
  setExpand: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Sidebar: React.FC<TProps> = ({ expand, setExpand }) => {
  // LOCAL STATE AND EXTRACT PROPS
  const [collapses, setCollapses] = useState<string[]>([]);

  const { pathname } = useRouter();

  // METHODS
  const handleCollapse = (id: string) => {
    setCollapses((prevCollapse) =>
      prevCollapse.includes(id)
        ? prevCollapse.filter((collapse) => collapse !== id)
        : [...prevCollapse, id]
    );
  };

  const renderActiveStyle = useCallback(
    (id: string, type: "children" | "parent") => {
      const pathSlice = pathname.split("/");
      // [0]: domain;
      // [1]: dashboard;
      // [2]: parentUrl;
      // [3]: childrenUrl

      if (type === "children") {
        return `${pathSlice[2]}/${pathSlice[3]}` === id
          ? { color: "#2684C5" }
          : {};
      } else {
        return pathSlice[2] === id
          ? { background: "#2684C5", color: "#fff", fontWeight: "bold" }
          : { color: "#6494BE" };
      }
    },
    [pathname]
  );

  const renderMenu = useCallback(() => {
    if (!expand) {
      return <ExpandedMenu menu={menu} />;
    }

    return (
      <List component="nav" className={styles["menu"]}>
        {menu.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              className={clsx(
                // styles["menu-items"],
                styles["parent-menu-items"]
              )}
              disablePadding
            >
              <ListItemButton
                onClick={() => handleCollapse(item.id)}
                sx={{ ...renderActiveStyle(item.id, "parent") }}
                className={clsx(styles["menu-items"], "mx-2 rounded px-2")}
              >
                {/* <ListItemIcon className="text-[#6494BE] min-w-[32px] w-8"> */}
                {item.icon}
                {/* </ListItemIcon> */}

                <span className="flex-grow text-sm py-2 font-semibold text-white pl-2">
                  {item.title}
                </span>

                {collapses.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={collapses.includes(item.id)}>
              <List className="p-0">
                {item.childrens.map((child) => (
                  <Link href={`/dashboard/${child.link}`} key={child.link}>
                    <a className="w-full d-block no-underline text-[#fff] ">
                      <ListItem
                        disablePadding
                        className={clsx("hover:text-[#2684C5]")}
                        sx={{ ...renderActiveStyle(child.link, "children") }}
                      >
                        <ListItemButton className="flex items-center  pl-[24px]">
                          <FiberManualRecordIcon className="w-2 h-2" />
                          <span className="text-sm py-2 pl-4 font-semibold">
                            {child.title}
                          </span>
                        </ListItemButton>
                      </ListItem>
                    </a>
                  </Link>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    );
  }, [expand, menu, styles, collapses, pathname]);

  // DOM RENDERING
  return (
    <Box
      className={styles["sidebar"]}
      sx={{ width: expand ? "250px" : "64px" }}
    >
      <Box className={styles["logo-box"]}>
        {!expand ? (
          <Image src="/logo-small.png" alt="Esti" width={40} height={40} />
        ) : (
          <Image src="/logo-full.png" alt="Esti" width={134} height={59} />
        )}

        <BaseButton
          variant="text"
          onClick={() => setExpand(!expand)}
          className={clsx(
            styles["expand-btn"],
            "min-w-[32px]",
            expand && "bg-[#599F50] text-white"
          )}
        >
          <MenuIcon className="w-[30px] h-[40px]" />
        </BaseButton>
      </Box>
      <Box className={styles["avatar-box"]}></Box>
      {renderMenu()}
    </Box>
  );
};
