import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { createExercise, deleteRoutine, saveRoutine } from "../api";
import { Card } from "../components/shared/Card";
import type { Exercise, Routine } from "../types";
import { dayNames } from "../utils/format";

type Props = {
  exercises: Exercise[];
  routines: Routine[];
  refresh: () => Promise<void>;
};

const emptyExercise = { exercise_id: 0, sets: 3, target_reps: 10, target_weight: 0, notes: "", order_index: 1 };

export function RoutinesPage({ exercises, routines, refresh }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("Push Day");
  const [day, setDay] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyExercise]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseGroup, setNewExerciseGroup] = useState("Chest");

  const selected = useMemo(() => routines.find((item) => item.id === editingId), [editingId, routines]);

  function loadRoutine(routine: Routine) {
    setEditingId(routine.id);
    setName(routine.name);
    setDay(routine.day_of_week);
    setNotes(routine.notes ?? "");
    setItems(
      routine.exercises.map((exercise) => ({
        exercise_id: exercise.exercise?.id ?? exercise.exercise_id ?? 0,
        sets: exercise.sets,
        target_reps: exercise.target_reps,
        target_weight: Number(exercise.target_weight ?? 0),
        notes: exercise.notes ?? "",
        order_index: exercise.order_index
      }))
    );
  }

  async function submit() {
    await saveRoutine(
      {
        name,
        day_of_week: day,
        notes,
        exercises: items
      },
      editingId ?? undefined
    );
    setEditingId(null);
    setName("Push Day");
    setDay(0);
    setNotes("");
    setItems([emptyExercise]);
    await refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
      <Card title="Your Routines" subtitle="Assign a program to specific weekdays.">
        <div className="space-y-3">
          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => loadRoutine(routine)}
              className={`w-full rounded-2xl border p-4 text-left ${
                selected?.id === routine.id ? "border-glow bg-glow/10" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{routine.name}</p>
                  <p className="text-sm text-slate-400">{dayNames[routine.day_of_week]}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{routine.exercises.length} exercises</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
      <Card title="Exercise Library" subtitle="Create reusable exercises for routines and PR tracking.">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input value={newExerciseName} onChange={(event) => setNewExerciseName(event.target.value)} className="rounded-2xl border border-white/10 bg-panel p-3 text-white" placeholder="Exercise name" />
          <input value={newExerciseGroup} onChange={(event) => setNewExerciseGroup(event.target.value)} className="rounded-2xl border border-white/10 bg-panel p-3 text-white" placeholder="Muscle group" />
          <button
            onClick={async () => {
              if (!newExerciseName.trim()) {
                return;
              }
              await createExercise({ name: newExerciseName, muscle_group: newExerciseGroup });
              setNewExerciseName("");
              await refresh();
            }}
            className="rounded-2xl bg-pulse px-4 py-3 font-semibold text-ink"
          >
            Add Exercise
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {exercises.map((exercise) => (
            <span key={exercise.id} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300">
              {exercise.name}
            </span>
          ))}
        </div>
      </Card>
      </div>
      <Card
        title={editingId ? "Edit Routine" : "Create Routine"}
        subtitle="Build the exact training plan the app should auto-load for that day."
        action={
          editingId ? (
            <button
              onClick={async () => {
                await deleteRoutine(editingId);
                setEditingId(null);
                await refresh();
              }}
              className="rounded-full border border-ember/30 px-4 py-2 text-sm text-ember hover:bg-ember/10"
            >
              <Trash2 size={16} className="mr-2 inline-block" />
              Delete
            </button>
          ) : null
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-white/10 bg-panel p-3 text-white" placeholder="Routine name" />
          <select value={day} onChange={(event) => setDay(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-panel p-3 text-white">
            {dayNames.map((item, index) => (
              <option key={item} value={index}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-panel p-3 text-white" placeholder="Routine notes" />
        <div className="mt-6 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-5">
              <select
                value={item.exercise_id}
                onChange={(event) =>
                  setItems((previous) =>
                    previous.map((entry, entryIndex) => (entryIndex === index ? { ...entry, exercise_id: Number(event.target.value) } : entry))
                  )
                }
                className="rounded-2xl border border-white/10 bg-panel p-3 text-white md:col-span-2"
              >
                <option value={0}>Choose exercise</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={item.sets}
                onChange={(event) =>
                  setItems((previous) =>
                    previous.map((entry, entryIndex) => (entryIndex === index ? { ...entry, sets: Number(event.target.value) } : entry))
                  )
                }
                className="rounded-2xl border border-white/10 bg-panel p-3 text-white"
                placeholder="Sets"
              />
              <input
                type="number"
                value={item.target_reps}
                onChange={(event) =>
                  setItems((previous) =>
                    previous.map((entry, entryIndex) => (entryIndex === index ? { ...entry, target_reps: Number(event.target.value) } : entry))
                  )
                }
                className="rounded-2xl border border-white/10 bg-panel p-3 text-white"
                placeholder="Reps"
              />
              <input
                type="number"
                value={item.target_weight ?? 0}
                onChange={(event) =>
                  setItems((previous) =>
                    previous.map((entry, entryIndex) => (entryIndex === index ? { ...entry, target_weight: Number(event.target.value) } : entry))
                  )
                }
                className="rounded-2xl border border-white/10 bg-panel p-3 text-white"
                placeholder="Target kg"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setItems((previous) => [...previous, { ...emptyExercise, order_index: previous.length + 1 }])}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            <Plus size={16} className="mr-2 inline-block" />
            Add Exercise
          </button>
          <button onClick={submit} className="rounded-full bg-glow px-4 py-2 text-sm font-semibold text-ink hover:brightness-110">
            Save Routine
          </button>
        </div>
      </Card>
    </div>
  );
}
