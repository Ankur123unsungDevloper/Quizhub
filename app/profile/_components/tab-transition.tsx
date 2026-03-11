/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  tabKey: string;
};

export const TabTransition = ({ children, tabKey }: Props) => {
  const [visible, setVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(tabKey);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (tabKey === currentKey) {
      setVisible(true);
      return;
    }

    // Fade out
    setVisible(false);

    const timeout = setTimeout(() => {
      setCurrentKey(tabKey);
      setContent(children);
      setVisible(true);
    }, 150);

    return () => clearTimeout(timeout);
  }, [tabKey, children, currentKey]);

  return (
    <div
      className="transition-all duration-150"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(8px)",
      }}
    >
      {content}
    </div>
  );
};