# Project-centric file processing API

This service uses PostgreSQL through Sequelize. Projects, files, and jobs are
separate relational entities:

- `projects` stores project metadata.
- `files` stores project ownership, display metadata, size, MIME type, and a
  relative disk/object-storage path. Binary content is never stored in
  PostgreSQL.
- `jobs` stores the project, job type, lifecycle status, progress, timestamps,
  failure reason, and the generated ZIP's `output_file_id`.

Uploaded files are stored under `uploads/<projectId>/files`, while generated
job outputs are stored under `uploads/<projectId>/jobs`. `files.project_id` and
`jobs.project_id` are foreign keys with cascade delete.
The project and status indexes support project-scoped file lists, project
details counts, and active-job monitoring. The composite
`jobs(project_id, status)` index avoids scanning unrelated projects. Output
files are ordinary file records marked with `is_output = true`, so download
ownership is checked through the same project-scoped file query as uploaded
files.

## Job processing

`POST /api/projects/:projectId/jobs/zip` validates every requested file against
both its project ID and file ID, creates a `PENDING` job, and starts a
Worker Thread. The worker receives only source paths and a destination path;
it has no HTTP context. It sends progress, completion, and failure messages to
the application thread. The application thread performs conditional
Sequelize updates (`WHERE id = ... AND status = ...`) so stale or concurrent
messages cannot move a job backwards in its lifecycle.

The worker creates the ZIP on disk. On completion, its output is registered in
`files` and linked from the job. A failed worker produces a `FAILED` job with
an error message and never returns a success-shaped response.

## Job endpoints

- `POST /api/projects/:projectId/jobs/zip` with
  `{ "fileIds": [1, 2] }` returns `202 Accepted` and the job status.
- `GET /api/projects/:projectId/jobs/:jobId` returns status and progress.
- `GET /api/projects/:projectId/files/:fileId/download` downloads the ZIP
  after completion (and also supports uploaded files).

Run migrations with `npm run db:migrate`, build with `npm run build`, and start
the compiled service with `npm start`.
