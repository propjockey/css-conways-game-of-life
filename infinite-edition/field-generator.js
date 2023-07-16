
let checked = {
  "42x42": [
    "..........................................".split(""),
    "...11.....................................".split(""),
    "..1111....................................".split(""),
    "..11.11...................................".split(""),
    "....11....................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    ".........................1................".split(""),
    ".......................1.1................".split(""),
    ".............11......11............11.....".split(""),
    "............1...1....11............11.....".split(""),
    ".11........1.....1...11...................".split(""),
    ".11........1...1.11....1.1................".split(""),
    "...........1.....1.......1................".split(""),
    "............1...1.........................".split(""),
    ".............11...........................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................11111...........".split(""),
    ".........................1....1...........".split(""),
    "..............................1...........".split(""),
    ".........................1...1............".split(""),
    "...........................1..............".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "..........................................".split(""),
    "......11..................................".split(""),
    "..1111.11.................................".split(""),
    "..111111..................................".split(""),
    "...1111...................................".split(""),
    "..........................................".split(""),
    "..........................................".split("")
  ]
} // checked["42x42"][y][x]

function gol (w = 42, h = 42) {
  let chex = checked[`${h}x${w}`]
  let registry = ``
  let output = "  --frame-out: var(--frame-in, 0);\n  --gen-out: var(--gen-in, 0);\n"
  let nextGenOutput = ""
  let hoist = ""
  let capture = ""
  let htmlrows = []
  let cssrows = []
  let gen0CSS = "\n"
  let gen0html = "\n"

  // --cell-[x]-[y]-in: 1
  // --cell-[x]-[y]-out: 1

  for (let y = 0; y < h; y++) {
    htmlrows[y] = `  <li class="rows row-${y}"></li>`
    cssrows[y] = `.row-${y} {`
    gen0html += "    "
    for (let x = 0; x < w; x++) {
      cssrows[y] += `\n  --bit-${x}: var(--cell-${x}-${y}-in);`

      registry += `@property --cell-${x}-${y}-sum { syntax: "<integer>"; initial-value: 0; inherits: false; }\n`
      registry += `@property --cell-${x}-${y}-out { syntax: "<integer>"; initial-value: 0; inherits: false; }\n`

      output += `  --cell-${x}-${y}-in: 0;\n`
      output += `  --cell-${x}-${y}-out: var(--cell-${x}-${y}-in);\n`
      nextGenOutput += `  --cell-${x}-${y}-sum: calc(
    var(--cell-${x - 1}-${y - 1}-in, 0) + var(--cell-${x}-${y - 1}-in, 0) + var(--cell-${x + 1}-${y - 1}-in, 0) +
    var(--cell-${x - 1}-${y}-in, 0) + var(--cell-${x}-${y}-in, 0) + var(--cell-${x + 1}-${y}-in, 0) +
    var(--cell-${x - 1}-${y + 1}-in, 0) + var(--cell-${x}-${y + 1}-in, 0) + var(--cell-${x + 1}-${y + 1}-in, 0)
  );\n`
      nextGenOutput += `  --cell-${x}-${y}-out: calc(
    (1 + max(-1, min(0, -100 * var(--gen-in)))) * var(--cell-${x}-${y}, 0) +

    var(--cell-${x}-${y}-in, 0) *
    (1 + max(-1, min(0,  100 * (var(--cell-${x}-${y}-sum) - 3)))) *
    (1 + max(-1, min(0, -100 * (var(--cell-${x}-${y}-sum) - 4)))) +

    (1 - var(--cell-${x}-${y}-in, 0)) *
    (1 + max(-1, min(0,  100 * (var(--cell-${x}-${y}-sum) - 3)))) *
    (1 + max(-1, min(0, -100 * (var(--cell-${x}-${y}-sum) - 3))))
  );\n`

     hoist += `    --cell-${x}-${y}-in: var(--cell-${x}-${y}-held, 0);\n`
     capture += `    --cell-${x}-${y}-held: var(--cell-${x}-${y}-out);\n`

     gen0CSS += `.css-game-of-life-infinite:has(.gen-0 .cell-${x}-${y}:checked) { --cell-${x}-${y}: 1; }\n`

     let isChecked = chex && chex[y] && chex[y][x] === "1"
     gen0html += `<input type="checkbox" class="cell-${x}-${y}" ${isChecked ? "checked" : ""}>`
    }
    gen0html += "\n"

    cssrows[y] += `\n}\n`
  }

  let bump = 100 / w
  let p = 0
  let rowCSS = `  --r: 255;
  --g: 0;
  --b: 255;
  --grad: linear-gradient(
    to right`
  for (let x = 0; x < w; x++) {
    rowCSS += `,\n    rgba(var(--r), var(--g), var(--b), var(--bit-${x})) ${p.toFixed(3)}% ${(p + bump).toFixed(3)}%`
    p += bump
  }
  rowCSS += "\n  ) 50% 50% / 100% 100% no-repeat;"
  rowCSS += `\n  background: var(--grad);` // todo: mask?

  let periodic = `
  --cell--1--1-in: var(--cell-${w-1}-${h-1}-in);
  --cell-${w}-${h}-in: var(--cell-0-0-in);
  --cell--1-${h}-in: var(--cell-${w-1}-0-in);
  --cell-${w}--1-in: var(--cell-0-${h-1}-in);\n`
  for (let x = 0; x <= w; x++) {
    periodic += `  --cell-${x}--1-in: var(--cell-${x}-${h-1}-in);\n`
    periodic += `  --cell-${x}-${h}-in: var(--cell-${x}-0-in);\n`
  }
  for (let y = 0; y <= h; y++) {
    periodic += `  --cell--1-${y}-in: var(--cell-${w-1}-${y}-in);\n`
    periodic += `  --cell-${w}-${y}-in: var(--cell-0-${y}-in);\n`
  }

  return `
<ul class="css-game-of-life-infinite">
  <li class="header">
    <h1>100% CSS Conway's Game Of Life - INFINITE EDITION</h1>
    <a href="https://twitter.com/Jane0ri">@jane0ri</a>
    <label class="periodic"><span><input type="checkbox" name="tab" checked> Wrap Edges</span></label>
    <label class="config-tab"><input type="radio" name="tab" checked>CONFIGURE</label>
    <label class="simulation-tab"><input type="radio" name="tab">SIMULATE</label>
  </li>
  <li class="gen-0">
    ${gen0html}
  </li>
  \n${htmlrows.join("\n")}\n
  <li class="controls">
    <ul class="io clock">
      <li class="phase-0 phase-capture"></li>
      <li class="phase-1 phase-capture"></li>
      <li class="phase-2 phase-hoist"></li>
      <li class="phase-3 phase-hoist"></li>
    </ul>
    <ul class="io next-gen">
      <li class="phase-0 phase-capture"></li>
      <li class="phase-1 phase-capture"></li>
      <li class="phase-2 phase-hoist"></li>
      <li class="phase-3 phase-hoist"></li>
    </ul>
  </li>
</ul>

<style>
  @property --seq-out { syntax: "<integer>"; initial-value: 0; inherits: true; }
  @property --frame-out { syntax: "<integer>"; initial-value: 0; inherits: true; }
  @property --gen-out { syntax: "<integer>"; initial-value: 0; inherits: true; }
  \n${registry}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; font-weight: normal; }
ul, li { list-style: none; }

.css-game-of-life-infinite::after {
  box-sizing: border-box;
  counter-reset: gen calc(var(--gen-in) - 1) wait calc(var(--wait) - var(--frame-out, 0));
  content: "Wait: " counter(wait) " Generation: " counter(gen);
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  padding-top: calc(var(--cell-w) * 42 / 80 * 3);
  height: calc(var(--cell-w) * 42 / 80 * 10);
  font-size: calc(var(--cell-w) * 42 / 80 * 3);
  text-align: center;
}

.css-game-of-life-infinite:has(.simulation-tab :checked):has(.controls:not(:hover))::after {
  background: magenta;
  color: white;
  content: ":hover cursor within ^ to simulate";
  outline: 2px solid rebeccapurple;
}
.css-game-of-life-infinite:has(.config-tab :checked)::after {
  content: " 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.\\A"
    " 2. Any live cell with two or three live neighbours lives on to the next generation.\\A"
    " 3. Any live cell with more than three live neighbours dies, as if by overpopulation.\\A"
    " 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.";
  white-space: pre;
  text-align: left;
  font-size: calc(var(--cell-w) * 42 / 80 * 1.75);
  padding-top: calc(var(--cell-w) * 42 / 80);
}

.css-game-of-life-infinite {
  --wait: 2;
  accent-color: magenta;
}
${gen0CSS}

.header {
  position: absolute;
  bottom: 100%;
  height: calc(var(--cell-w) * 42 / 80 * 10);
  font-size: calc(var(--cell-w) * 42 / 80 * 3);
  
  display: grid;
  grid-template-columns: 0.7fr 0.95fr 1fr 1fr;
  width: 100%;
  align-items: stretch;
  text-align: center;
  column-gap: 0.5vmin;
}
h1 {
  font-size: inherit;
  grid-column: span 4;
  text-align: center;
}
.header [type="radio"] {
  display: none;
}
.header > * {
  display: grid;
  align-items: center;
  cursor: pointer;
}
.header label:has([type="radio"]) {
  border: 2px solid rebeccapurple;
  border-bottom: 2px solid transparent;
  border-top-left-radius: 2vmin;
  border-top-right-radius: 2vmin;
  background: white;
  opacity: 0.5;
}
.header label:has([type="radio"]:checked) {
  background: magenta;
  opacity: 1;
}
.header:has(.config-tab :not(:checked)) .periodic {
  opacity: 0.5;
  pointer-events: none;
}

body { display: grid; }
.gen-0 {
  position: absolute;
  inset: 0;
  display: none;
}

.css-game-of-life-infinite:has(.config-tab :checked) .gen-0 {
  display: grid;
  grid-template-columns: repeat(${w}, 1fr);
  grid-template-rows: repeat(${h}, 1fr);
}

.css-game-of-life-infinite:has(.periodic :checked) {${periodic}}

.css-game-of-life-infinite {
  position: relative;
  margin: auto;
  outline: 2px solid rebeccapurple;
  --cell-w: calc(max(55px / 4 * ${w}, 80vmin) / ${Math.max(w, h)});
  width: calc(var(--cell-w) * ${w});
  margin-block: calc(var(--cell-w) * 42 / 80 * 10);
  aspect-ratio: ${w} / ${h};
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(${h}, 1fr);

  --CONFIG: -10;
  --CLOCK: 0;
  --NEXT_GEN: 10;

  --seq-in: var(--CLOCK);
  --seq-out: var(--seq-in);
  \n${output}
}

a { color: rebeccapurple; }

.css-game-of-life-infinite > .rows {\n${rowCSS}\n}
.controls {
  position: absolute;
  inset: 0;
  z-index: var(--seq-in);
}

${cssrows.join("\n")}

@keyframes io-hoist {
  0%, 100% {
    --seq-in: var(--seq-held, var(--CLOCK));
    --frame-in: var(--frame-held, 0);
    --gen-in: var(--gen-held, 0);\n${hoist}  }
}
@keyframes io-capture {
  0%, 100% {
    --seq-held: var(--seq-out);
    --frame-held: var(--frame-out);
    --gen-held: var(--gen-out);\n${capture}  }
}

.io {
  position: absolute;
  inset: 0;
  overflow: hidden;

  --sequence-matches: calc(1 + max(-1, 100000 * min(
    var(--sequence, 0) - var(--seq-in, 0),
    var(--seq-in, 0) - var(--sequence, 0)
  )));
  left: calc(100% - var(--sequence-matches) * 100%);
}
.io.clock {
  --sequence: var(--CLOCK);
}
.io.next-gen {
  --sequence: var(--NEXT_GEN);
  --background: rgba(0, 255, 0, 0.25);
}

.css-game-of-life-infinite:has(.io.clock:hover) {
  --frame-out: calc(var(--frame-in, 0) + 1);
  --goto-next-gen: calc(1 + max(-1, min(0,  100 * (var(--frame-in, 0) + 2 - var(--wait)))));
  --seq-out: calc(
    var(--goto-next-gen) * var(--NEXT_GEN)
  );
}
.css-game-of-life-infinite:has(.io.next-gen:hover) {
  --gen-out: calc(var(--gen-in, 0) + 1);
  --frame-out: 0;
  --seq-out: var(--CLOCK);
\n${nextGenOutput}
}

.io > .phase-0 { --io: 0; }
.io > .phase-1 { --io: 1; }
.io > .phase-2 { --io: 2; }
.io > .phase-3 { --io: 3; }
.io > * {
  position: absolute;
  inset: 0;
  --phase-matches: calc(1 + max(-1, 100000 * min(
    var(--io) - var(--goto, 0), var(--goto, 0) - var(--io)
  )));
  left: calc(100% - var(--phase-matches) * 100%);
}
.css-game-of-life-infinite:has(.phase-0:hover) {
  --tick-hoist: paused;
  --tick-capture: running;
  --goto: 1;
}
.css-game-of-life-infinite:has(.phase-1:hover) {
  --tick-hoist: paused;
  --tick-capture: paused;
  --goto: 2;
}
.css-game-of-life-infinite:has(.phase-2:hover) {
  --tick-hoist: running;
  --tick-capture: paused;
  --goto: 3;
}
.css-game-of-life-infinite:has(.phase-3:hover) {
  --tick-hoist: paused;
  --tick-capture: paused;
  --goto: 0;
}
.css-game-of-life-infinite {
  --tick-hoist: paused;
  --tick-capture: paused;
  animation: io-hoist 1ms linear both var(--tick-hoist, running),
             io-capture 1ms linear both var(--tick-capture, running);
}
.css-game-of-life-infinite:has(.config-tab :checked) {
  animation: none;
  --seq-in: var(--CONFIG);
}
</style>
`
}
