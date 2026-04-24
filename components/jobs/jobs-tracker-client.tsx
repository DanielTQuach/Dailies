"use client";

import { AddJobForm } from "@/components/jobs/add-job-form";
import { JobPipelineBoard, type SerializedJobApplication } from "@/components/jobs/job-pipeline-board";
import { JobUrlConverter } from "@/components/jobs/job-url-converter";

export function JobsTrackerClient({ applications }: { applications: SerializedJobApplication[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AddJobForm />
          <JobPipelineBoard applications={applications} />
        </div>
        <div className="lg:col-span-1">
          <JobUrlConverter />
        </div>
      </div>
    </div>
  );
}
