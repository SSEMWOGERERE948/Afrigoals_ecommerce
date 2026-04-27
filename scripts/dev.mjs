import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const lockPath = path.join(projectRoot, ".next", "dev", "lock");

function removeStaleNextDevLock() {
  if (!fs.existsSync(lockPath)) {
    return;
  }

  try {
    const contents = fs.readFileSync(lockPath, "utf8");
    const lock = JSON.parse(contents);

    if (typeof lock?.pid !== "number") {
      fs.rmSync(lockPath, { force: true });
      console.warn("Removed invalid Next dev lock file.");
      return;
    }

    try {
      process.kill(lock.pid, 0);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ESRCH"
      ) {
        fs.rmSync(lockPath, { force: true });
        console.warn(`Removed stale Next dev lock for PID ${lock.pid}.`);
      }
    }
  } catch {
    fs.rmSync(lockPath, { force: true });
    console.warn("Removed unreadable Next dev lock file.");
  }
}

removeStaleNextDevLock();

const nextBin = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next",
);

const child = spawn(nextBin, ["dev", ...process.argv.slice(2)], {
  cwd: projectRoot,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
