import { WorkoutCharts } from "../components/charts/WorkoutCharts";
import type { ProgressData } from "../types";

type Props = {
  data: ProgressData;
};

export function ProgressPage({ data }: Props) {
  return <WorkoutCharts data={data} />;
}
