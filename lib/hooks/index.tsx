import { useEffect, useState } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({ x: 0, y: 0 });
  useEffect(() => {
    function resizeListener() {
      if (typeof window !== "undefined") {
        setSize({ x: window.innerWidth, y: window.innerHeight });
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", resizeListener);
    }
    // call reisizeListener manually once for initial size
    resizeListener();
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", resizeListener);
      }
    };
  }, []);
  return [size.x, size.y];
}
