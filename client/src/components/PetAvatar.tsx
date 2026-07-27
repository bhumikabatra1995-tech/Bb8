import type { PetState } from "../lib/api";

interface PetAvatarProps {
  stage: PetState["stage"];
  happiness: number;
  className?: string;
}

function bodyColor(happiness: number): { body: string; cheeks: string } {
  if (happiness >= 70) return { body: "#7dd3a8", cheeks: "#ffb4c6" };
  if (happiness >= 40) return { body: "#f4c974", cheeks: "#ffc9a8" };
  return { body: "#9fb0c9", cheeks: "#d9c2d9" };
}

function Face({ happy }: { happy: boolean }) {
  return happy ? (
    <>
      <circle cx="42" cy="58" r="4.5" fill="#2b2b2b" />
      <circle cx="70" cy="58" r="4.5" fill="#2b2b2b" />
      <path d="M42 72 Q56 84 70 72" stroke="#2b2b2b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  ) : (
    <>
      <path d="M37 55 L47 60" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
      <path d="M75 55 L65 60" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="62" r="3.5" fill="#2b2b2b" />
      <circle cx="70" cy="62" r="3.5" fill="#2b2b2b" />
      <path d="M45 78 Q56 70 67 78" stroke="#2b2b2b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  );
}

export function PetAvatar({ stage, happiness, className }: PetAvatarProps) {
  const { body, cheeks } = bodyColor(happiness);
  const happy = happiness >= 45;

  if (stage === "egg") {
    return (
      <svg viewBox="0 0 112 112" className={className} role="img" aria-label="An egg, not yet hatched">
        <ellipse cx="56" cy="60" rx="34" ry="42" fill={body} />
        <path
          d="M40 45 L50 58 L42 65 L58 80"
          stroke="#ffffffaa"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const showHorn = stage === "teen" || stage === "adult";
  const showWings = stage === "adult";
  const bodyR = stage === "hatchling" ? 32 : stage === "kid" ? 36 : 40;

  return (
    <svg viewBox="0 0 112 112" className={className} role="img" aria-label={`Pet in its ${stage} stage`}>
      {showWings && (
        <>
          <ellipse cx="18" cy="58" rx="14" ry="22" fill={body} opacity="0.85" transform="rotate(-18 18 58)" />
          <ellipse cx="94" cy="58" rx="14" ry="22" fill={body} opacity="0.85" transform="rotate(18 94 58)" />
        </>
      )}
      <circle cx="56" cy="62" r={bodyR} fill={body} />
      <circle cx="34" cy="68" r="8" fill={cheeks} opacity="0.8" />
      <circle cx="78" cy="68" r="8" fill={cheeks} opacity="0.8" />
      {showHorn && <path d="M50 26 L56 8 L62 26 Z" fill={body} />}
      <Face happy={happy} />
    </svg>
  );
}
