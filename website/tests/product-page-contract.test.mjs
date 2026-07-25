import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const components = new URL("../src/components/", import.meta.url);
const [app, featureGrid, header, installation, productPreview, styles] =
  await Promise.all([
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
    readFile(new URL("FeatureGrid.tsx", components), "utf8"),
    readFile(new URL("SiteHeader.tsx", components), "utf8"),
    readFile(new URL("Installation.tsx", components), "utf8"),
    readFile(new URL("ProductPreview.tsx", components), "utf8"),
    readFile(new URL("../src/styles.css", import.meta.url), "utf8"),
  ]);

test("the product page exposes its install and privacy destinations", () => {
  assert.match(header, /href="#privacy"/);
  assert.match(header, /href="#install"/);
  assert.match(installation, /id="install"/);
  assert.match(app, /<PrivacyStatement \/>/);
});

test("shortcut copy works across supported desktop platforms", () => {
  assert.match(featureGrid, /Alt–P \(Option–P on Mac\)/);
});

test("the decorative product illustration stays out of the accessibility tree", () => {
  assert.match(
    productPreview,
    /className="product-stage" aria-hidden="true"/,
  );
});

test("interactive elements have a visible keyboard focus treatment", () => {
  assert.match(styles, /[.]download-button:focus-visible/);
  assert.match(styles, /outline:\s*3px solid var\(--red-bright\)/);
});
