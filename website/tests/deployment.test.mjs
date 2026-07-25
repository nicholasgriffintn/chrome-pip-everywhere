import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("the production build contains the landing page and installable extension", async () => {
  const dist = new URL("../dist/", import.meta.url);
  const html = await readFile(new URL("index.html", dist), "utf8");
  const assetNames = await readdir(new URL("assets/", dist));
  const scripts = await Promise.all(
    assetNames
      .filter((name) => name.endsWith(".js"))
      .map((name) => readFile(new URL(`assets/${name}`, dist), "utf8")),
  );
  const archive = new URL("pip-everywhere.zip", dist);
  const archiveContents = execFileSync("unzip", ["-Z1", archive.pathname], {
    encoding: "utf8",
  });

  assert.match(html, /PiP Everywhere — Keep your video above everything/);
  assert.match(html, /rel="canonical" href="https:\/\/pip-everywhere[.]pashi[.]app\/"/);
  assert.match(html, /rel="icon" href="\/icon[.]svg"/);
  assert.match(html, /src="[/]assets[/]index-[^"]+[.]js"/);
  assert.ok((await stat(archive)).size > 0);
  assert.match(scripts.join("\n"), /No browsing history permission/);
  assert.match(scripts.join("\n"), /Keep the picture/);
  assert.match(scripts.join("\n"), /Download ZIP/);
  assert.match(archiveContents, /^manifest[.]json$/m);
  assert.match(archiveContents, /^lib[/]action-executor[.]js$/m);
  assert.match(archiveContents, /^lib[/]action-feedback[.]js$/m);
  assert.match(archiveContents, /^lib[/]shortcuts[.]js$/m);
  assert.doesNotMatch(archiveContents, /^website[/]/m);
});
