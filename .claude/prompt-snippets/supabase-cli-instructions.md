Supabase CLI is not globally installed. To run, use `npx supabase`.

Local Supabase runs on Podman (not Docker Desktop). Before `npx supabase start`, make sure the Podman machine is running (`podman machine list`; start it with `podman machine start`). If `podman` is not on PATH in the current shell, it is installed at `%LOCALAPPDATA%\Programs\Podman\podman.exe`.
