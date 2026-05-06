// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This file is part of Ordbok API.
//
// Ordbok API is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { configDotenv } from 'dotenv';
import { Pool } from 'pg';
import { compile } from 'json-schema-to-typescript';
import prettier from 'prettier';

configDotenv();

const pkgRoot = resolve(import.meta.dirname, '..');
const schemaOutPath = resolve(
  pkgRoot,
  'src/dictionary/types/article-data.schema.json',
);
const typesOutPath = resolve(pkgRoot, 'src/dictionary/types/article-data.ts');

const args = process.argv.slice(2);
const dictFilter = args
  .find((a) => a.startsWith('--dictionary='))
  ?.split('=')[1];
const limit = Number(
  args.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0,
);
const batchSize = Number(
  args.find((a) => a.startsWith('--batch='))?.split('=')[1] || 5000,
);

const EnumFields = new Set([
  'type_',
  'article_type',
  'edit_state',
  'standardisation',
  'inflection_group',
  'place_type',
  'dict_id',
  'id',
]);

const LicenceHeader = `// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This file is part of Ordbok API.
//
// Ordbok API is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

`;

const DictNames = { bm: 'BmArticle', nn: 'NnArticle', no: 'NoArticle' };

class SchemaNode {
  types = new Set();
  properties = new Map();
  items = null;
  nullable = false;
  enumValues = null;
  minNumber = Infinity;
  maxNumber = -Infinity;
  count = 0;
  parentCount = 0;

  merge(value) {
    this.count++;

    if (value === null || value === undefined) {
      this.nullable = true;
      return;
    }

    if (Array.isArray(value)) {
      this.types.add('array');
      if (!this.items) {
        this.items = new SchemaNode();
      }
      for (const item of value) {
        this.items.merge(item);
      }
      return;
    }

    const type = typeof value;

    if (type === 'object') {
      this.types.add('object');

      for (const [key, val] of Object.entries(value)) {
        if (!this.properties.has(key)) {
          this.properties.set(key, new SchemaNode());
        }
        this.properties.get(key).merge(val);
      }

      return;
    }

    if (type === 'number') {
      this.types.add(Number.isInteger(value) ? 'integer' : 'number');

      if (value < this.minNumber) {
        this.minNumber = value;
      }

      if (value > this.maxNumber) {
        this.maxNumber = value;
      }

      return;
    }

    if (type === 'boolean') {
      this.types.add('boolean');

      return;
    }

    if (type === 'string') {
      this.types.add('string');

      if (this.enumValues !== null && this.enumValues.size > 100) {
        this.enumValues = null;
      } else if (this.enumValues !== null || this.count <= 2) {
        if (!this.enumValues) {
          this.enumValues = new Set();
        }

        this.enumValues.add(value);
      }

      return;
    }

    this.types.add(type);
  }

  toJsonSchema(propertyName) {
    const schemas = [];

    for (const type of this.types) {
      if (type === 'object') {
        const properties = {};
        const required = [];

        for (const [key, node] of this.properties) {
          properties[key] = node.toJsonSchema(key);
        }

        const objSchema = { type: 'object', properties };
        const objectCount = this.count - (this.nullable ? 1 : 0);

        for (const [key, node] of this.properties) {
          if (node.count >= objectCount && !node.nullable) {
            required.push(key);
          }
        }

        if (required.length > 0) {
          objSchema.required = required.sort();
        }

        schemas.push(objSchema);
      } else if (type === 'array') {
        const arrSchema = { type: 'array' };

        if (this.items && this.items.count > 0) {
          arrSchema.items = this.items.toJsonSchema();
        } else {
          arrSchema.items = { not: {} };
        }

        schemas.push(arrSchema);
      } else if (type === 'integer') {
        schemas.push({ type: 'integer' });
      } else if (type === 'number') {
        schemas.push({ type: 'number' });
      } else if (type === 'string') {
        const strSchema = { type: 'string' };

        if (
          propertyName &&
          EnumFields.has(propertyName) &&
          this.enumValues &&
          this.enumValues.size > 0 &&
          this.enumValues.size <= 50
        ) {
          strSchema.enum = [...this.enumValues].sort();
        }

        schemas.push(strSchema);
      } else if (type === 'boolean') {
        schemas.push({ type: 'boolean' });
      } else {
        schemas.push({ type });
      }
    }

    let result;

    if (schemas.length === 0) {
      result = { not: {} };
    } else if (schemas.length === 1) {
      result = schemas[0];
    } else {
      const hasInt = schemas.some((s) => s.type === 'integer');
      const hasNum = schemas.some((s) => s.type === 'number');

      if (hasInt && hasNum) {
        const filtered = schemas.filter((s) => s.type !== 'integer');

        result = filtered.length === 1 ? filtered[0] : { anyOf: filtered };
      } else {
        result = { anyOf: schemas };
      }
    }

    if (this.nullable) {
      if (result.type) {
        result.type = [result.type, 'null'];
      } else if (result.anyOf) {
        result.anyOf.push({ type: 'null' });
      } else {
        result = { anyOf: [result, { type: 'null' }] };
      }
    }

    return result;
  }
}

try {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('DATABASE_URL not set.');
    process.exit(1);
  }

  const dictionaries = dictFilter ? [dictFilter] : ['bm', 'nn', 'no'];
  const dictSchemas = {};

  const pool = new Pool({ connectionString: dbUrl, max: 2 });

  for (const dict of dictionaries) {
    const root = new SchemaNode();
    let offset = 0;
    let total = 0;

    const countQuery = limit
      ? `SELECT LEAST(count(*)::int, ${limit}) as cnt FROM articles WHERE dictionary = $1`
      : `SELECT count(*)::int as cnt FROM articles WHERE dictionary = $1`;
    const {
      rows: [{ cnt }],
    } = await pool.query(countQuery, [dict]);
    const articleCount = Number(cnt);

    process.stderr.write(`[${dict}] Processing ${articleCount} articles...\n`);

    while (true) {
      const currentLimit = limit
        ? Math.min(batchSize, limit - offset)
        : batchSize;
      if (currentLimit <= 0) break;

      const { rows } = await pool.query(
        `SELECT data FROM articles WHERE dictionary = $1 ORDER BY id LIMIT $2 OFFSET $3`,
        [dict, currentLimit, offset],
      );

      if (rows.length === 0) break;

      for (const row of rows) {
        root.merge(row.data);
      }

      offset += rows.length;
      total += rows.length;
      process.stderr.write(`\r     ${total}/${articleCount}`);

      if (rows.length < currentLimit) break;
    }

    process.stderr.write(`\r     ${total}/${articleCount} done\n`);
    dictSchemas[dict] = root.toJsonSchema();
  }

  await pool.end();

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ArticleData',
    description: 'Schema inferred from all article documents in the database.',
    $defs: {},
    anyOf: [],
  };

  for (const [dict, dictSchema] of Object.entries(dictSchemas)) {
    const name = DictNames[dict] || `${dict}Article`;
    schema.$defs[name] = {
      title: name,
      description: `Raw article data for the ${dict} dictionary.`,
      ...dictSchema,
    };
    schema.anyOf.push({ $ref: `#/$defs/${name}` });
  }

  const writeFormatted = async (content, filepath) => {
    const config = await prettier.resolveConfig(filepath);
    const formatted = await prettier.format(content, { ...config, filepath });

    await writeFile(filepath, formatted);

    process.stderr.write(`Formatted ${filepath}\n`);
  };

  const schemaJson = JSON.stringify(schema, null, 2);
  await writeFormatted(schemaJson + '\n', schemaOutPath);
  process.stderr.write(`\nSchema written to ${schemaOutPath}\n`);

  let tsSource = await compile(schema, 'ArticleData', {
    bannerComment: '',
    additionalProperties: false,
    strictIndexSignatures: true,
    unknownAny: true,
  });

  // If anything was unresolved, that's because it was never found in the source
  // data. Therefore, it should be typed as never, as it never contains data.
  tsSource = tsSource.replace(/\bunknown\b/g, 'never');

  // Replace empty index signature objects with never.
  tsSource = tsSource.replace(
    /\{\s*\[k: string\]: never \| undefined;\s*\}/g,
    'never',
  );

  await writeFormatted(LicenceHeader + tsSource, typesOutPath);
  process.stderr.write(`Types written to ${typesOutPath}\n`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
