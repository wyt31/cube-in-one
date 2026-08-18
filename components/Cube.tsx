type Point3D = [number, number, number];

const UNIT = 26;
const GAP = 0.07;
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);
const STROKE = "#C4C4C4";

const TOP_COLORS = [
  "#C5D4BC",
  "#F0EBE3",
  "#D8E4D0",
  "#E8E2D9",
  "#B8C9AD",
  "#F0EBE3",
  "#D8E4D0",
  "#C5D4BC",
  "#E8E2D9",
];

const LEFT_COLORS = [
  "#AEBBC6",
  "#B8C4CE",
  "#C5CED6",
  "#B8C4CE",
  "#AEBBC6",
  "#C5CED6",
  "#B8C4CE",
  "#AEBBC6",
  "#C5CED6",
];

const RIGHT_COLORS = [
  "#D4C4B0",
  "#E0D5C5",
  "#C9B8A8",
  "#E8E2D9",
  "#D4C4B0",
  "#C9B8A8",
  "#E0D5C5",
  "#E8E2D9",
  "#D4C4B0",
];

function project(x: number, y: number, z: number) {
  return {
    x: (x - y) * COS30 * UNIT,
    y: (x + y) * SIN30 * UNIT - z * UNIT,
  };
}

function insetCell(
  i: number,
  j: number,
  fixed: { axis: "x" | "y" | "z"; value: number },
  iAxis: "x" | "y" | "z",
  jAxis: "x" | "y" | "z"
): Point3D[] {
  const g = GAP;
  const coords = (axis: "x" | "y" | "z", a: number, b: number): Point3D => {
    const point: Record<"x" | "y" | "z", number> = { x: 0, y: 0, z: 0 };
    point[fixed.axis] = fixed.value;
    point[iAxis] = a;
    point[jAxis] = b;
    return [point.x, point.y, point.z];
  };

  return [
    coords(iAxis, i + g, j + g),
    coords(iAxis, i + 1 - g, j + g),
    coords(iAxis, i + 1 - g, j + 1 - g),
    coords(iAxis, i + g, j + 1 - g),
  ];
}

function toPath(corners: Point3D[]) {
  return corners
    .map(([x, y, z], index) => {
      const p = project(x, y, z);
      return `${index === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    })
    .join(" ")
    .concat(" Z");
}

function FaceCells({
  face,
  colors,
}: {
  face: "top" | "left" | "right";
  colors: string[];
}) {
  const cells = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j;
      let corners: Point3D[];

      if (face === "top") {
        corners = insetCell(i, j, { axis: "z", value: 3 }, "x", "y");
      } else if (face === "left") {
        corners = insetCell(j, i, { axis: "x", value: 0 }, "y", "z");
      } else {
        corners = insetCell(i, j, { axis: "y", value: 3 }, "x", "z");
      }

      cells.push(
        <path
          key={`${face}-${index}`}
          d={toPath(corners)}
          fill={colors[index]}
          stroke={STROKE}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      );
    }
  }

  return <>{cells}</>;
}

export default function Cube() {
  return (
    <div className="group relative cursor-default">
      <svg
        viewBox="-75 -90 150 135"
        className="h-[9rem] w-[9rem] animate-float transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04] sm:h-[10rem] sm:w-[10rem]"
        aria-hidden
      >
        <g>
          <FaceCells face="left" colors={LEFT_COLORS} />
          <FaceCells face="right" colors={RIGHT_COLORS} />
          <FaceCells face="top" colors={TOP_COLORS} />
        </g>
      </svg>
    </div>
  );
}
