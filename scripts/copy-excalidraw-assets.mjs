// Копирует шрифты Excalidraw из node_modules в public/, чтобы они отдавались
// с нашего origin. CSP десктопной оболочки (src-tauri/tauri.conf.json) содержит
// `font-src 'self'`, поэтому дефолтная подгрузка шрифтов с CDN в собранном
// приложении блокируется. Вместе с этим в BoardCanvas.tsx выставляется
// window.EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/".
//
// Скрипт запускается из `dev` и `build`, а public/excalidraw-assets лежит в .gitignore —
// при бампе версии @excalidraw/excalidraw ничего перекопировать руками не нужно.
import { cp, mkdir, readdir, rm, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(
  root,
  "node_modules/@excalidraw/excalidraw/dist/prod/fonts",
);
const target = path.join(root, "public/excalidraw-assets/fonts");
const stampFile = path.join(target, ".excalidraw-version");

// Xiaolai — это CJK-начертание весом ~13 МБ из ~14 МБ всей папки шрифтов.
// Интерфейс у нас русскоязычный, поэтому не тащим его ни в репозиторий,
// ни в бандл приложения.
const EXCLUDED_FAMILIES = new Set(["Xiaolai"]);

const readInstalledVersion = async () => {
  const pkg = JSON.parse(
    await readFile(
      path.join(root, "node_modules/@excalidraw/excalidraw/package.json"),
      "utf8",
    ),
  );
  return pkg.version;
};

const readStamp = async () => {
  try {
    return (await readFile(stampFile, "utf8")).trim();
  } catch {
    return null;
  }
};

const main = async () => {
  if (!existsSync(source)) {
    console.error(
      "[excalidraw-assets] не найден каталог шрифтов — выполните установку зависимостей",
    );
    process.exit(1);
  }

  const version = await readInstalledVersion();
  if ((await readStamp()) === version) return;

  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });

  const families = await readdir(source, { withFileTypes: true });
  for (const family of families) {
    if (!family.isDirectory() || EXCLUDED_FAMILIES.has(family.name)) continue;
    await cp(path.join(source, family.name), path.join(target, family.name), {
      recursive: true,
    });
  }

  await writeFile(stampFile, version);
  console.log(`[excalidraw-assets] шрифты скопированы в public/excalidraw-assets/fonts (v${version})`);
};

await main();
