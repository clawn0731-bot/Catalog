"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HeatmapDatum {
  row: string;
  col: string;
  value: number;
}

interface HeatmapProps {
  data: HeatmapDatum[];
  rowLabel: string;
  colLabel: string;
}

function cellColor(value: number): string {
  if (value === 0) return "bg-gray-50 text-gray-400";
  if (value === 1) return "bg-blue-100 text-blue-700";
  if (value === 2) return "bg-blue-200 text-blue-800";
  if (value <= 4) return "bg-blue-300 text-blue-900";
  return "bg-blue-500 text-white";
}

export function Heatmap({ data, rowLabel, colLabel }: HeatmapProps) {
  const { rows, cols, matrix } = useMemo(() => {
    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    const map = new Map<string, number>();

    for (const d of data) {
      rowSet.add(d.row);
      colSet.add(d.col);
      map.set(`${d.row}__${d.col}`, d.value);
    }

    const rows = Array.from(rowSet).sort();
    const cols = Array.from(colSet).sort();
    const matrix: number[][] = rows.map((r) =>
      cols.map((c) => map.get(`${r}__${c}`) ?? 0),
    );

    return { rows, cols, matrix };
  }, [data]);

  if (rows.length === 0 || cols.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        데이터가 없습니다
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              {rowLabel} / {colLabel}
            </th>
            {cols.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row} className="border-t border-border/50">
              <td className="sticky left-0 z-10 bg-background px-3 py-2 text-xs font-medium whitespace-nowrap">
                {row}
              </td>
              {matrix[ri].map((val, ci) => (
                <td key={cols[ci]} className="px-1 py-1 text-center">
                  <div
                    className={cn(
                      "mx-auto flex h-8 w-full min-w-[2rem] items-center justify-center rounded text-xs font-medium transition-colors",
                      cellColor(val),
                    )}
                  >
                    {val}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
