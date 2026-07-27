import { useState } from "react";
import type { PetState } from "../lib/api";
import { PetAvatar } from "./PetAvatar";

const STAGE_LABEL: Record<PetState["stage"], string> = {
  egg: "Egg",
  hatchling: "Hatchling",
  kid: "Kid",
  teen: "Teen",
  adult: "Adult",
};

interface PetWidgetProps {
  pet: PetState;
  onRename: (name: string) => void;
}

export function PetWidget({ pet, onRename }: PetWidgetProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(pet.name);

  const xpPercent = Math.min(100, Math.round((pet.xpIntoLevel / pet.xpForNextLevel) * 100));

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm p-6 flex flex-col items-center gap-3">
      <PetAvatar stage={pet.stage} happiness={pet.happiness} className="w-32 h-32" />

      {editing ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draftName.trim()) onRename(draftName.trim());
            setEditing(false);
          }}
        >
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={() => setEditing(false)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-center text-lg font-semibold w-32"
            maxLength={30}
          />
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-lg font-semibold text-slate-800 dark:text-slate-100"
          title="Click to rename"
        >
          {pet.name} <span className="text-slate-400 font-normal text-sm">· {STAGE_LABEL[pet.stage]}</span>
        </button>
      )}

      <div className="w-full space-y-2">
        <Meter label={`Level ${pet.level}`} value={xpPercent} color="bg-indigo-400" />
        <Meter label="Happiness" value={pet.happiness} color="bg-emerald-400" />
      </div>

      {pet.streak > 0 && (
        <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
          🔥 {pet.streak} day streak
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
