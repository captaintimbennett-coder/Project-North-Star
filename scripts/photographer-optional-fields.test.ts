import assert from 'node:assert/strict';
import test from 'node:test';
import type { FieldHook } from 'payload';
import { pathToFileURL } from 'node:url';
import { PhotographerApplications } from '../src/payload/collections/PhotographerApplications';

const { textarea } = await import(pathToFileURL(`${process.cwd()}/node_modules/payload/dist/fields/validations.js`).href);
const fields = PhotographerApplications.fields.flatMap((field) => 'tabs' in field ? field.tabs.flatMap(tab => tab.fields) : [field]);
for (const name of ['whatTheyHopeToCreate', 'retreatGoals']) {
  test(`${name} accepts omitted and blank answers while preserving database-compatible values`, async () => {
    const field = fields.find(field => 'name' in field && field.name === name);
    assert.ok(field && field.type === 'textarea');
    for (const value of [undefined, null, '', 'A creative goal']) {
      const normalize: FieldHook | undefined = field.hooks?.beforeValidate?.[0];
      assert.ok(normalize);
      const normalized = await normalize({ value } as Parameters<FieldHook>[0]);
      assert.equal(normalized, value ?? '');
      assert.equal(textarea(normalized, { ...field, req: { payload: { config: {} }, t: (key: string) => key } }), true);
    }
  });
}
test('required identity fields remain required', () => {
  for (const name of ['legalName', 'email', 'phone']) {
    const field = fields.find(field => 'name' in field && field.name === name);
    assert.ok(field && 'required' in field && field.required);
  }
});
