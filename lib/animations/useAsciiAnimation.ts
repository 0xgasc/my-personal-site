"use client";

import { useEffect, useRef, useState } from "react";
import { animations } from "./ascii";

export function useAsciiAnimation(
  animName: string,
  cols: number,
  rows: number,
  enabled: boolean = true,
  frameSkip: number = 3
): string {
  const [output, setOutput] = useState("");
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || animName === "none" || cols < 1 || rows < 1) {
      setOutput("");
      return;
    }

    const fn = animations[animName];
    if (!fn) return;

    function loop(time: number) {
      frameRef.current++;
      if (frameRef.current % frameSkip === 0) {
        setOutput(fn(cols, rows, time));
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [animName, cols, rows, enabled, frameSkip]);

  return output;
}
