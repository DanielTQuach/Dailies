import type { JobStage } from "@prisma/client";

export type { JobStage };

export const JOB_STAGE_FLOW: { value: JobStage; label: string; short: string }[] = [
  { value: "SAVED", label: "Saved", short: "Saved" },
  { value: "APPLIED", label: "Applied", short: "Applied" },
  { value: "OA", label: "Online assessment", short: "OA" },
  { value: "PHONE", label: "Phone screen", short: "Phone" },
  { value: "ONSITE", label: "Onsite / final", short: "Onsite" },
  { value: "OFFER", label: "Offer", short: "Offer" },
  { value: "REJECTED", label: "Rejected / closed", short: "Closed" },
];

export const JOB_STAGE_VALUES = JOB_STAGE_FLOW.map((s) => s.value) as JobStage[];

export function isJobStage(value: string): value is JobStage {
  return JOB_STAGE_VALUES.includes(value as JobStage);
}
