export type AsciiAnimFn = (cols: number, rows: number, time: number) => string;

export const animations: Record<string, AsciiAnimFn> = {
  noise(c, r, t) {
    let o = "";
    const s = t * 0.001;
    for (let y = 0; y < r; y++) {
      for (let x = 0; x < c; x++) {
        const n =
          Math.sin(x * 0.1 + s) *
          Math.cos(y * 0.15 + s * 0.7) *
          Math.sin((x + y) * 0.05 + s * 0.5);
        o += " .:;+=xX$#"[Math.max(0, Math.min(9, Math.floor((n + 1) * 4)))];
      }
      o += "\n";
    }
    return o;
  },

  wave(c, r, t) {
    let o = "";
    const ch = "░▒▓█▓▒░";
    for (let y = 0; y < r; y++) {
      for (let x = 0; x < c; x++) {
        const w =
          (Math.sin(x * 0.12 + t * 0.003) +
            Math.sin(x * 0.08 + y * 0.15 + t * 0.002)) /
          2;
        o += ch[Math.max(0, Math.min(6, Math.floor((w + 1) * 3.5)))];
      }
      o += "\n";
    }
    return o;
  },

  glitch(c, r, t) {
    let o = "";
    const g = "!@#$%^&*<>{}[]|\\/";
    const i = Math.sin(t * 0.01) * 0.5 + 0.5;
    for (let y = 0; y < r; y++) {
      const rr = Math.random() < i * 0.3;
      for (let x = 0; x < c; x++) {
        o +=
          rr && Math.random() < 0.7
            ? g[Math.floor(Math.random() * g.length)]
            : Math.random() < 0.1
              ? "█"
              : " ";
      }
      o += "\n";
    }
    return o;
  },

  plasma(c, r, t) {
    let o = "";
    const ch = " .:;+=xX$#";
    const s = t * 0.003;
    for (let y = 0; y < r; y++) {
      for (let x = 0; x < c; x++) {
        const v =
          (Math.sin(x * 0.05 + s) +
            Math.sin(y * 0.07 + s * 1.3) +
            Math.sin((x + y) * 0.04 + s * 0.7) +
            Math.sin(
              Math.sqrt((x - c / 2) ** 2 + (y - r / 2) ** 2) * 0.1 - s
            )) /
          4;
        o += ch[Math.max(0, Math.min(9, Math.floor((v + 1) * 4.5)))];
      }
      o += "\n";
    }
    return o;
  },

  scanlines(c, r, t) {
    let o = "";
    const p = (t * 0.01) % r;
    for (let y = 0; y < r; y++) {
      const d = Math.abs(y - p);
      for (let x = 0; x < c; x++)
        o +=
          d < 1
            ? "█"
            : d < 2
              ? "▓"
              : d < 3
                ? "░"
                : y % 2 === 0
                  ? "─"
                  : " ";
      o += "\n";
    }
    return o;
  },

  binary(c, r, t) {
    let o = "";
    const s = Math.floor(t * 0.01);
    for (let y = 0; y < r; y++) {
      for (let x = 0; x < c; x++)
        o += Math.sin(x * 0.3 + y * 0.2 + s * 0.1) > 0 ? "1" : "0";
      o += "\n";
    }
    return o;
  },

  flow(c, r, t) {
    let o = "";
    for (let y = 0; y < r; y++) {
      const off = Math.floor(t * 0.02 + y * 0.5) % 8;
      for (let x = 0; x < c; x++) {
        const p = (x + off) % 8;
        o += p < 3 ? "→" : p < 4 ? "─" : " ";
      }
      o += "\n";
    }
    return o;
  },
};
