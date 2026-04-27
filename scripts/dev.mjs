import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const nextRoot = path.join(projectRoot, ".next");
const nextDevPath = path.join(nextRoot, "dev");
const nextCachePath = path.join(nextRoot, "cache");
const lockPath = path.join(projectRoot, ".next", "dev", "lock");
const watchedPaths = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "postcss.config.mjs",
  "scripts/dev.mjs",
  "tsconfig.json",
  "app/globals.css",
].map((relativePath) => path.join(projectRoot, relativePath));

function getNewestMtime(paths) {
  let newestMtime = 0;

  for (const filePath of paths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const { mtimeMs } = fs.statSync(filePath);
    newestMtime = Math.max(newestMtime, mtimeMs);
  }

  return newestMtime;
}

function removeStaleNextDevArtifacts() {
  if (!fs.existsSync(nextDevPath)) {
    return;
  }

  const devBuildStampPath = path.join(nextDevPath, "build", "package.json");
  const devStampPath = fs.existsSync(devBuildStampPath)
    ? devBuildStampPath
    : path.join(nextDevPath, "package.json");

  if (!fs.existsSync(devStampPath)) {
    return;
  }

  const cacheStamp = fs.statSync(devStampPath).mtimeMs;
  const sourceStamp = getNewestMtime(watchedPaths);

  if (sourceStamp <= cacheStamp) {
    return;
  }

  fs.rmSync(nextDevPath, { force: true, recursive: true });
  fs.rmSync(nextCachePath, { force: true, recursive: true });
  console.warn("Cleared stale Next dev cache after manifest/config changes.");
}

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

removeStaleNextDevArtifacts();
removeStaleNextDevLock();

const nextBin = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const child = spawn(
  process.execPath,
  [nextBin, "dev", ...process.argv.slice(2)],
  {
    cwd: projectRoot,
    stdio: "inherit",
  },
);

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
