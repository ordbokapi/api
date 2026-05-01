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

// Run with node --test api/packages/api/test/e2e-queries.test.mjs
// Remember to start the server with yarn start:dev beforehand.

import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

const endpoint = 'http://127.0.0.1:3000/graphql';

async function gql(query, variables) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    const msgs = json.errors.map((e) => e.message).join('\n');
    throw new Error(`GraphQL errors:\n${msgs}`);
  }
  return json.data;
}

// "vane"
const knownArticleId = 66381;
const knownDictionary = 'Bokmaalsordboka';

// Warm up TCP connections before measuring individual tests.
before(async () => {
  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ __typename }' }),
  });
});

describe('word query', () => {
  it('returns basic word with articles', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        word
        dictionaries
        articles { id }
      }
    }`);
    assert.ok(data.word);
    assert.equal(data.word.word, 'vane');
    assert.ok(data.word.dictionaries.includes('Bokmaalsordboka'));
    assert.ok(data.word.articles.length > 0);
  });

  it('returns articles with lemmas and paradigms', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        articles {
          id
          dictionary
          lemmas {
            id
            lemma
            meaning
            splitInfinitive
            paradigms {
              id
              tags
              inflections {
                wordForm
                tags
              }
            }
          }
        }
      }
    }`);
    const article = data.word.articles[0];
    assert.equal(article.id, knownArticleId);
    assert.equal(article.dictionary, 'Bokmaalsordboka');
    assert.ok(article.lemmas.length > 0);
    const lemma = article.lemmas[0];
    assert.equal(lemma.lemma, 'vane');
    assert.equal(typeof lemma.id, 'number');
    assert.equal(typeof lemma.meaning, 'number');
    assert.equal(typeof lemma.splitInfinitive, 'boolean');
    assert.ok(lemma.paradigms.length > 0);
    const paradigm = lemma.paradigms[0];
    assert.equal(typeof paradigm.id, 'number');
    assert.ok(Array.isArray(paradigm.tags));
    assert.ok(paradigm.inflections.length > 0);
    const inflection = paradigm.inflections[0];
    assert.equal(typeof inflection.wordForm, 'string');
    assert.ok(Array.isArray(inflection.tags));
  });

  it('returns articles with wordClass and gender', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        articles {
          wordClass
          gender
        }
      }
    }`);
    const article = data.word.articles[0];
    assert.equal(article.wordClass, 'Substantiv');
  });

  it('returns articles with definitions, examples, and sub-definitions', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        articles {
          definitions {
            id
            content { textContent richContent { type content } }
            examples { textContent richContent { type content } }
            subDefinitions {
              id
              content { textContent }
              examples { textContent }
            }
          }
        }
      }
    }`);
    const article = data.word.articles[0];
    assert.ok(article.definitions);
    assert.ok(article.definitions.length > 0);
    const def = article.definitions[0];
    assert.ok(Array.isArray(def.content));
    assert.ok(Array.isArray(def.examples));
    assert.ok(Array.isArray(def.subDefinitions));

    assert.ok(def.content.length > 0);
    const rc = def.content[0];
    assert.equal(typeof rc.textContent, 'string');
    assert.ok(Array.isArray(rc.richContent));
    assert.ok(rc.richContent.length > 0);
    assert.ok(['Text', 'Article'].includes(rc.richContent[0].type));
    assert.equal(typeof rc.richContent[0].content, 'string');
  });

  it('returns articles with etymology', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        articles {
          etymology { textContent richContent { type content } }
        }
      }
    }`);
    const article = data.word.articles[0];
    assert.ok(Array.isArray(article.etymology));
    assert.ok(article.etymology.length > 0);
  });

  it('returns articles with relationships', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        articles {
          relationships {
            type
            article { id lemmas { lemma } }
          }
        }
      }
    }`);
    const article = data.word.articles[0];
    assert.ok(Array.isArray(article.relationships));
  });

  it('returns articles with phrases', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        articles {
          phrases { id lemmas { lemma } }
        }
      }
    }`);
    const article = data.word.articles[0];
    assert.ok(Array.isArray(article.phrases));
    assert.ok(article.phrases.length > 0);
  });

  it('filters by wordClass', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}], wordClass: Substantiv) {
        articles { id wordClass }
      }
    }`);
    assert.ok(data.word);
    assert.ok(data.word.articles.length > 0);
  });

  it('returns null for non-existent word', async () => {
    const data = await gql(`{
      word(word: "xyzzy123456", dictionaries: [${knownDictionary}]) {
        word
        articles { id }
      }
    }`);
    assert.equal(data.word, null);
  });
});

describe('article query', () => {
  it('fetches a specific article by id', async () => {
    const data = await gql(`{
      article(id: ${knownArticleId}, dictionary: ${knownDictionary}) {
        id
        dictionary
        wordClass
        gender
      }
    }`);
    assert.ok(data.article);
    assert.equal(data.article.id, knownArticleId);
    assert.equal(data.article.dictionary, 'Bokmaalsordboka');
  });

  it('fetches full article with all nested fields', async () => {
    const data = await gql(`{
      article(id: ${knownArticleId}, dictionary: ${knownDictionary}) {
        id
        dictionary
        wordClass
        gender
        lemmas {
          id
          lemma
          meaning
          splitInfinitive
          paradigms {
            id
            tags
            inflections { wordForm tags }
          }
        }
        definitions {
          id
          content { textContent richContent { type content } }
          examples { textContent richContent { type content } }
          relationships {
            type
            article { id dictionary lemmas { lemma } }
          }
          subDefinitions {
            id
            content { textContent richContent { type content } }
            examples { textContent richContent { type content } }
            relationships {
              type
              article { id }
            }
            subDefinitions {
              id
              content { textContent }
            }
          }
        }
        etymology { textContent richContent { type content } }
        relationships {
          type
          article { id dictionary lemmas { lemma } }
        }
        phrases {
          id
          dictionary
          lemmas { lemma }
        }
      }
    }`);
    assert.ok(data.article);
    assert.equal(data.article.id, knownArticleId);
  });

  it('returns null for non-existent article', async () => {
    const data = await gql(`{
      article(id: 999999999, dictionary: ${knownDictionary}) { id }
    }`);
    assert.equal(data.article, null);
  });
});

describe('randomArticle query', () => {
  it('returns a random article', async () => {
    const data = await gql(`{
      randomArticle(dictionary: ${knownDictionary}) {
        id
        dictionary
        lemmas { lemma }
      }
    }`);
    assert.ok(data.randomArticle);
    assert.equal(data.randomArticle.dictionary, 'Bokmaalsordboka');
    assert.equal(typeof data.randomArticle.id, 'number');
  });
});

describe('suggestions query', () => {
  it('returns all suggestion categories', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [${knownDictionary}]) {
        exact { word dictionaries articles { id } }
        inflections { word dictionaries }
        freetext { word dictionaries }
        similar { word dictionaries }
      }
    }`);
    assert.ok(data.suggestions);
    assert.ok(Array.isArray(data.suggestions.exact));
    assert.ok(Array.isArray(data.suggestions.inflections));
    assert.ok(Array.isArray(data.suggestions.freetext));
    assert.ok(Array.isArray(data.suggestions.similar));
    assert.ok(
      data.suggestions.exact.some((w) => w.word === 'vane'),
      'Expected "vane" in exact suggestions',
    );
  });

  it('returns suggestions with nested article data', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [${knownDictionary}]) {
        exact {
          word
          dictionaries
          articles {
            id
            dictionary
            wordClass
            lemmas {
              lemma
              paradigms { tags inflections { wordForm tags } }
            }
            definitions {
              content { textContent }
              examples { textContent }
            }
          }
        }
      }
    }`);
    const exact = data.suggestions.exact;
    assert.ok(exact.length > 0);
    const vane = exact.find((w) => w.word === 'vane');
    assert.ok(vane);
    assert.ok(vane.articles.length > 0);
  });

  it('filters suggestions by wordClass', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [${knownDictionary}], wordClass: Substantiv) {
        exact { word }
        freetext { word }
      }
    }`);
    assert.ok(data.suggestions);
  });

  it('limits suggestion count with maxCount', async () => {
    const data = await gql(`{
      suggestions(word: "van", dictionaries: [${knownDictionary}], maxCount: 3) {
        freetext { word }
      }
    }`);
    assert.ok(data.suggestions.freetext.length <= 3);
  });

  it('returns empty for gibberish input', async () => {
    const data = await gql(`{
      suggestions(word: "xyzzy987654", dictionaries: [${knownDictionary}]) {
        exact { word }
        inflections { word }
        freetext { word }
        similar { word }
      }
    }`);
    assert.equal(data.suggestions.exact.length, 0);
    assert.equal(data.suggestions.inflections.length, 0);
    assert.equal(data.suggestions.freetext.length, 0);
  });
});

describe('articleGraph query', () => {
  it('returns a graph at depth 1 with edges', async () => {
    const data = await gql(`{
      articleGraph(id: ${knownArticleId}, dictionary: ${knownDictionary}, depth: 1) {
        dictionary
        nodes {
          id
          dictionary
          lemmas { lemma }
          wordClass
        }
        edges {
          sourceId
          targetId
          type
          sourceDefinitionId
          sourceDefinitionIndex
        }
      }
    }`);
    assert.ok(data.articleGraph);
    assert.equal(data.articleGraph.dictionary, 'Bokmaalsordboka');
    assert.ok(Array.isArray(data.articleGraph.nodes));
    assert.ok(Array.isArray(data.articleGraph.edges));
    assert.ok(
      data.articleGraph.nodes.length > 1,
      `Expected multiple nodes, got ${data.articleGraph.nodes.length}`,
    );
    assert.ok(
      data.articleGraph.edges.length > 0,
      `Expected edges, got ${data.articleGraph.edges.length}`,
    );
    assert.ok(
      data.articleGraph.nodes.some((n) => n.id === knownArticleId),
      'Root article should be in nodes',
    );
    const nodeIds = new Set(data.articleGraph.nodes.map((n) => n.id));
    for (const edge of data.articleGraph.edges) {
      assert.ok(typeof edge.sourceId === 'number');
      assert.ok(typeof edge.targetId === 'number');
      assert.ok(
        nodeIds.has(edge.sourceId),
        `sourceId ${edge.sourceId} not in nodes`,
      );
      assert.ok(
        nodeIds.has(edge.targetId),
        `targetId ${edge.targetId} not in nodes`,
      );
      assert.ok(
        [
          'Related',
          'SeeAlso',
          'Usage',
          'Synonym',
          'Antonym',
          'Phrase',
        ].includes(edge.type),
      );
    }
  });

  it('returns a deeper graph at depth 2', async () => {
    const data = await gql(`{
      articleGraph(id: ${knownArticleId}, dictionary: ${knownDictionary}, depth: 2) {
        nodes {
          id
          lemmas { lemma paradigms { tags inflections { wordForm } } }
          definitions { content { textContent } }
        }
        edges { sourceId targetId type }
      }
    }`);
    assert.ok(data.articleGraph);
    assert.ok(
      data.articleGraph.nodes.length > 1,
      `Expected multiple nodes at depth 2, got ${data.articleGraph.nodes.length}`,
    );
    assert.ok(data.articleGraph.edges.length > 0, 'Expected edges at depth 2');
  });

  it('returns empty graph for non-existent article', async () => {
    const data = await gql(`{
      articleGraph(id: 999999999, dictionary: ${knownDictionary}, depth: 1) {
        nodes { id }
        edges { sourceId targetId type }
      }
    }`);
    assert.ok(data.articleGraph);
    assert.equal(data.articleGraph.nodes.length, 0);
    assert.equal(data.articleGraph.edges.length, 0);
  });
});

describe('deep nesting', () => {
  it('handles deeply nested definition relationships referencing articles', async () => {
    const data = await gql(`{
      article(id: ${knownArticleId}, dictionary: ${knownDictionary}) {
        definitions {
          content {
            textContent
            richContent {
              type
              content
              ... on RichContentArticleSegment {
                article {
                  id
                  lemmas { lemma }
                  definitions {
                    content { textContent }
                  }
                }
                definitionId
                definitionIndex
              }
            }
          }
          relationships {
            type
            article {
              id
              lemmas {
                lemma
                paradigms {
                  tags
                  inflections { wordForm tags }
                }
              }
              definitions {
                content { textContent }
                examples { textContent }
                subDefinitions {
                  content { textContent }
                }
              }
              relationships {
                type
                article { id lemmas { lemma } }
              }
            }
          }
          subDefinitions {
            content { textContent richContent { type content } }
            examples { textContent richContent { type content } }
            relationships {
              type
              article {
                id
                lemmas { lemma }
              }
            }
            subDefinitions {
              content { textContent }
              relationships {
                type
                article { id }
              }
            }
          }
        }
      }
    }`);
    assert.ok(data.article);
  });

  it('handles word query with full depth on articles', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [${knownDictionary}]) {
        word
        dictionaries
        articles {
          id
          dictionary
          wordClass
          gender
          lemmas {
            id
            lemma
            meaning
            splitInfinitive
            paradigms {
              id
              tags
              inflections { wordForm tags }
            }
          }
          definitions {
            id
            content { textContent richContent { type content } }
            examples { textContent richContent { type content } }
            relationships {
              type
              article {
                id
                dictionary
                lemmas { lemma }
              }
            }
            subDefinitions {
              id
              content { textContent }
              examples { textContent }
              relationships { type article { id } }
              subDefinitions { content { textContent } }
            }
          }
          etymology { textContent richContent { type content } }
          relationships {
            type
            article { id dictionary lemmas { lemma } }
          }
          phrases {
            id
            lemmas { lemma }
            definitions { content { textContent } }
          }
        }
      }
    }`);
    assert.ok(data.word);
    assert.equal(data.word.word, 'vane');
  });
});

describe('enum values', () => {
  it('accepts all Dictionary enum values', async () => {
    const dicts = ['Bokmaalsordboka', 'Nynorskordboka', 'NorskOrdbok'];
    const query = `{
${dicts
  .map(
    (
      dict,
    ) => `      ${dict}: suggestions(word: "test", dictionaries: [${dict}]) {
        exact { word }
      }`,
  )
  .join('\n')}
    }`;
    const data = await gql(query);
    for (const dict of dicts) {
      assert.ok(data[dict]);
    }
  });

  it('accepts all WordClass enum values in suggestions', async () => {
    const wordClasses = [
      'Substantiv',
      'Adjektiv',
      'Adverb',
      'Verb',
      'Pronomen',
      'Preposisjon',
      'Konjunksjon',
      'Interjeksjon',
      'Determinativ',
      'Subjunksjon',
      'Symbol',
      'Forkorting',
      'Uttrykk',
    ];
    const query = `{
${wordClasses
  .map(
    (
      wc,
    ) => `      ${wc}: suggestions(word: "vane", dictionaries: [${knownDictionary}], wordClass: ${wc}) {
        exact { word }
      }`,
  )
  .join('\n')}
    }`;
    const data = await gql(query);
    for (const wc of wordClasses) {
      assert.ok(data[wc]);
    }
  });

  it('accepts all WordClass enum values in word query', async () => {
    const wordClasses = [
      'Substantiv',
      'Adjektiv',
      'Adverb',
      'Verb',
      'Pronomen',
      'Preposisjon',
      'Konjunksjon',
      'Interjeksjon',
      'Determinativ',
      'Subjunksjon',
      'Symbol',
      'Forkorting',
      'Uttrykk',
    ];
    const query = `{
${wordClasses
  .map(
    (
      wc,
    ) => `      ${wc}: word(word: "vane", dictionaries: [${knownDictionary}], wordClass: ${wc}) {
        word
      }`,
  )
  .join('\n')}
    }`;
    const data = await gql(query);
    for (const wc of wordClasses) {
      assert.ok(data[wc] === null || typeof data[wc].word === 'string');
    }
  });
});

describe('edge cases', () => {
  it('handles special characters in word query', async () => {
    const data = await gql(`{
      word(word: "van-", dictionaries: [${knownDictionary}]) {
        word
        articles { id }
      }
    }`);
    assert.ok(data.word === null || typeof data.word.word === 'string');
  });

  it('handles multiple dictionaries in word query', async () => {
    const data = await gql(`{
      word(word: "vane", dictionaries: [Bokmaalsordboka, Nynorskordboka, NorskOrdbok]) {
        word
        dictionaries
        articles { id dictionary }
      }
    }`);
    assert.ok(data.word);
    assert.ok(data.word.articles.length > 0);
  });

  it('handles multiple dictionaries in suggestions', async () => {
    const data = await gql(`{
      suggestions(word: "vane", dictionaries: [Bokmaalsordboka, Nynorskordboka]) {
        exact { word dictionaries }
        freetext { word }
      }
    }`);
    assert.ok(data.suggestions);
  });
});
