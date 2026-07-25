import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

test("editorial section headings share one top-aligned desktop grid", () => {
  assert.match(
    css,
    /[.]product-caption,\s*[.]feature-heading\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)[^}]*align-items:\s*start/s,
  );
  assert.match(
    css,
    /[.]feature-heading h2\s*\{[^}]*grid-column:\s*2\s*[/]\s*-1/s,
  );
});
