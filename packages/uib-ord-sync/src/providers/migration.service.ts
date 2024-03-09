import { Injectable } from '@nestjs/common';
import {
  RedisMulti,
  RedisService,
  UiBDictionary,
  uibKeys,
  ArticleIndex,
  versionKey,
} from 'ordbokapi-common';
import { SchemaFieldTypes } from 'redis';

/**
 * Represents a migration that can be applied to a Redis database.
 */
export interface Migration {
  (transaction: RedisMulti): Promise<void> | void;
}

/**
 * Represents a version of a Redis database and the migrations that must be
 * applied to reach that version.
 */
export interface Version {
  version: number;
  migrations: Migration[];
}

/**
 * The versions of the Redis database and the migrations that must be applied to
 * reach those versions. The latest version should be last.
 */
const versions: Version[] = [
  {
    version: 1, // Initial version
    migrations: [
      (transaction) => {
        // policies to keep and retain data
        transaction.configSet('maxmemory-policy', 'noeviction');

        // use latest FT query dialect
        transaction.ft.configSet('DEFAULT_DIALECT', '3');

        /*
        Sample article JSON:
        {"article_id": 100431, "submitted": "2023-05-12 13:26:20", "suggest": ["skule", "skole"], "lemmas": [{"hgno": 1, "id": 1082941, "inflection_class": "m1", "lemma": "skule", "paradigm_info": [{"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "skule"}, {"tags": ["Sing", "Def"], "word_form": "skulen"}, {"tags": ["Plur", "Ind"], "word_form": "skular"}, {"tags": ["Plur", "Def"], "word_form": "skulane"}], "inflection_group": "NOUN_regular", "paradigm_id": 2230, "standardisation": "STANDARD", "tags": ["NOUN", "Masc"], "to": null}], "split_inf": false}, {"hgno": 1, "id": 1082940, "inflection_class": "m1", "lemma": "skole", "paradigm_info": [{"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "skole"}, {"tags": ["Sing", "Def"], "word_form": "skolen"}, {"tags": ["Plur", "Ind"], "word_form": "skolar"}, {"tags": ["Plur", "Def"], "word_form": "skolane"}], "inflection_group": "NOUN_regular", "paradigm_id": 2230, "standardisation": "STANDARD", "tags": ["NOUN", "Masc"], "to": null}], "split_inf": false}], "body": {"etymology": [{"type_": "etymology_reference", "content": "$ $ i $", "items": [{"type_": "entity", "id": "norr."}, {"type_": "usage", "items": [], "text": "skóli, skúli"}, {"type_": "usage", "items": [], "text": "skúlameistari"}]}, {"type_": "etymology_reference", "content": "$ $ $ $", "items": [{"type_": "entity", "id": "gj"}, {"type_": "entity", "id": "g.eng."}, {"type_": "usage", "items": [], "text": "scol"}, {"type_": "entity", "id": "f"}]}, {"type_": "etymology_reference", "content": "$ $ $", "items": [{"type_": "entity", "id": "el"}, {"type_": "entity", "id": "l.ty."}, {"type_": "usage", "items": [], "text": "schole"}]}, {"type_": "etymology_reference", "content": "$ $ $ (som $-en i $ kanskje kjem av) opphavleg frå $ $ ‘fritid, kvild frå kroppsarbeid, sysselsetjing med lærdomsøvingar’", "items": [{"type_": "entity", "id": "e"}, {"type_": "entity", "id": "nederl."}, {"type_": "usage", "items": [], "text": "scoele"}, {"type_": "usage", "items": [], "text": "u"}, {"type_": "usage", "items": [], "text": "I skule"}, {"type_": "entity", "id": "gr"}, {"type_": "usage", "items": [], "text": "skhole"}]}], "definitions": [{"type_": "definition", "elements": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "(institusjon som driv regelbunden) opplæring, undervisning", "items": []}, {"type_": "example", "quote": {"content": "$ byrjar kring 20. august", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "arbeide i $", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "drive som lærar", "items": []}}, {"type_": "example", "quote": {"content": "den vidaregåande $", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}, {"type_": "sub_article", "article_id": 110535, "lemmas": ["halde skule"], "article": {"type_": "article", "article_id": 110535, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1154997, "lemma": "halde skule"}], "body": {"pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "gje undervisning", "items": []}], "id": 2}]}, "article_type": "SUB_ARTICLE", "author": "153", "dict_id": "nn", "frontpage": false, "latest_status": 8, "owner": "12", "properties": {"edit_state": "Eksisterende"}, "version": 2, "word_class": "EXPR"}, "intro": {"content": "", "items": []}, "status": null}, {"type_": "sub_article", "article_id": 117034, "lemmas": ["ein hard skule"], "article": {"type_": "article", "article_id": 117034, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1153488, "lemma": "ein hard skule"}], "body": {"pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "ein nådelaus og vond røyndom", "items": []}, {"type_": "example", "quote": {"content": "gå, lære i ein hard skule", "items": []}, "explanation": {"content": "", "items": []}}], "id": 2}]}, "article_type": "SUB_ARTICLE", "author": "28", "dict_id": "nn", "frontpage": false, "latest_status": 8, "owner": "12", "properties": {"edit_state": "Eksisterende"}, "version": 2, "word_class": "EXPR"}, "intro": {"content": "", "items": []}, "status": null}, {"type_": "compound_list", "elements": [{"type_": "article_ref", "article_id": 10923, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1013236, "lemma": "danseskule"}, {"type_": "lemma", "hgno": 0, "id": 1013235, "lemma": "danseskole"}]}, {"type_": "article_ref", "article_id": 19865, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1023778, "lemma": "folkeskule"}, {"type_": "lemma", "hgno": 0, "id": 1023777, "lemma": "folkeskole"}]}, {"type_": "article_ref", "article_id": 27221, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1032945, "lemma": "grunnskule"}, {"type_": "lemma", "hgno": 0, "id": 1032944, "lemma": "grunnskole"}]}, {"type_": "article_ref", "article_id": 32619, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1039553, "lemma": "høgskule"}, {"type_": "lemma", "hgno": 0, "id": 1039552, "lemma": "høgskole"}]}, {"type_": "article_ref", "article_id": 41970, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1050908, "lemma": "krigsskule"}, {"type_": "lemma", "hgno": 0, "id": 1050907, "lemma": "krigsskole"}]}, {"type_": "article_ref", "article_id": 68209, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1082880, "lemma": "skogskule"}, {"type_": "lemma", "hgno": 0, "id": 1082879, "lemma": "skogskole"}]}, {"type_": "article_ref", "article_id": 77922, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1095109, "lemma": "teikneskole"}, {"type_": "lemma", "hgno": 0, "id": 1095110, "lemma": "teikneskule"}]}], "intro": {"content": "òg i $ som", "items": [{"type_": "entity", "id": "sms"}]}}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "$", "items": [{"type_": "article_ref", "article_id": 47366, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1058008, "lemma": "lærebok"}], "definition_id": null}]}, {"type_": "example", "quote": {"content": "$ i gitarspel", "items": [{"type_": "usage", "items": [], "text": "skule"}]}, "explanation": {"content": "", "items": []}}], "id": 3, "sub_definition": true}], "id": 2, "sub_definition": false}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "bygning der ein held $", "items": [{"type_": "article_ref", "article_id": 100431, "lemmas": [{"type_": "lemma", "hgno": 1, "id": 1082941, "lemma": "skule"}, {"type_": "lemma", "hgno": 1, "id": 1082940, "lemma": "skole"}], "definition_id": 2, "definition_order": 1}]}, {"type_": "example", "quote": {"content": "byggje ny $", "items": [{"type_": "usage", "items": [], "text": "skule"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "ha lang veg til $", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}], "id": 6, "sub_definition": false}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "elevar og lærarar ved ein $", "items": [{"type_": "article_ref", "article_id": 100431, "lemmas": [{"type_": "lemma", "hgno": 1, "id": 1082941, "lemma": "skule"}, {"type_": "lemma", "hgno": 1, "id": 1082940, "lemma": "skole"}], "definition_id": 6, "definition_order": 2}]}, {"type_": "example", "quote": {"content": "heile $ hadde fri i går", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "$", "items": [{"type_": "article_ref", "article_id": 47349, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1057988, "lemma": "lærar"}], "definition_id": null}]}, {"type_": "example", "quote": {"content": "$ kjem borti vegen", "items": [{"type_": "usage", "items": [], "text": "skolen"}]}, "explanation": {"content": "", "items": []}}], "id": 4, "sub_definition": true}], "id": 7, "sub_definition": false}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "krins, retning innanfor eit (fag)område, særleg vitskap og kunst", "items": []}, {"type_": "example", "quote": {"content": "ei bok som danna $", "items": [{"type_": "usage", "items": [], "text": "skule"}]}, "explanation": {"content": "", "items": []}}, {"type_": "sub_article", "article_id": 110536, "lemmas": ["av den gamle skulen"], "article": {"type_": "article", "article_id": 110536, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1150293, "lemma": "av den gamle skulen"}], "body": {"pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "med ei meir gammaldags haldning", "items": []}], "id": 2}]}, "article_type": "SUB_ARTICLE", "author": "153", "dict_id": "nn", "frontpage": false, "latest_status": 8, "owner": "12", "properties": {"edit_state": "Eksisterende"}, "version": 2, "word_class": "EXPR"}, "intro": {"content": "", "items": []}, "status": null}], "id": 8, "sub_definition": false}], "id": 5, "sub_definition": false}]}, "to_index": ["skulen", "skulen", "skulen", "skule", "skule", "skulen", "skulen", "skolen", "skule", "skóli, skúli", "skúlameistari", "scol", "schole", "scoele", "u", "I skule", "skhole"]}

        Redis structure:

        article:<dictionaryId>:<articleId> - (JSON) article data
          - Indexes created using the Search module for the following JSONPaths:
            - lemmas: lemmas[*].lemma
            - suggest: suggest[*]
            - etymology: body.etymology[*].items[*].text
            - paradigm tags: body.lemmas[*].paradigm_info[*].tags[*]
            - inflection tags: body.lemmas[*].paradigm_info[*].inflection[*].tags[*]
            - inflection word form: body.lemmas[*].paradigm_info[*].inflection[*].word_form
            // - split_infinitive: body.lemmas[*].split_inf // see below
            - split_infinitive: body.__ordbokapi__.hasSplitInf
        dictionary:<dictionaryId>:articles - (Hash) articleId -> article metadata JSON
          (the data fetched from the article list, i.e. articleId, primaryLemma,
          revision, updatedAt)
        dictionary:<dictionaryId>:concepts - (JSON) concept data
        dictionary:<dictionaryId>:word_classes - (JSON) word class data
        dictionary:<dictionaryId>:word_subclasses - (JSON) word subclass data

        This migration creates the FT indices for the article data.
        */
        const createIndex = (dictionary?: UiBDictionary) =>
          transaction.ft.create(
            uibKeys.articleIndex(dictionary),
            {
              '$.lemmas[*].lemma': {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: true,
                AS: ArticleIndex.Lemma,
              },
              '$.suggest[*]': {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: true,
                AS: ArticleIndex.Suggest,
              },
              '$.etymology[*].items[*].text': {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: true,
                AS: ArticleIndex.Etymology,
              },
              '$.lemmas[*].paradigm_info[*].tags[*]': {
                type: SchemaFieldTypes.TAG,
                AS: ArticleIndex.ParadigmTags,
              },
              '$.lemmas[*].paradigm_info[*].inflection[*].tags[*]': {
                type: SchemaFieldTypes.TAG,
                AS: ArticleIndex.InflectionTags,
              },
              '$.lemmas[*].paradigm_info[*].inflection[*].word_form': {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: true,
                AS: ArticleIndex.Inflection,
              },
              '$.__ordbokapi__.hasSplitInf': {
                type: SchemaFieldTypes.TAG,
                AS: ArticleIndex.SplitInfinitive,
              },
            },
            {
              ON: 'JSON',
              PREFIX: `article${dictionary ? `:${dictionary}` : ''}:`,
              STOPWORDS: [],
            },
          );

        createIndex();

        for (const dictionary of Object.values(UiBDictionary)) {
          createIndex(dictionary);
        }
      },
    ],
  },
  {
    version: 2, // Add exact match indices
    migrations: [
      (transaction) => {
        const alterIndex = (dictionary?: UiBDictionary) =>
          // modify the index to add additional aliases for exact matching
          // the entirety of the TEXT fields
          transaction.ft.alter(uibKeys.articleIndex(dictionary), {
            '$.lemmas[*].lemma': {
              type: SchemaFieldTypes.TAG,
              SORTABLE: true,
              AS: ArticleIndex.LemmaExact,
            },
            '$.suggest[*]': {
              type: SchemaFieldTypes.TAG,
              SORTABLE: true,
              AS: ArticleIndex.SuggestExact,
            },
            '$.lemmas[*].paradigm_info[*].inflection[*].word_form': {
              type: SchemaFieldTypes.TAG,
              SORTABLE: true,
              AS: ArticleIndex.InflectionExact,
            },
          });

        alterIndex();

        for (const dictionary of Object.values(UiBDictionary)) {
          alterIndex(dictionary);
        }
      },
    ],
  },
];

/**
 * A service for migrating a Redis database to the latest version.
 */
@Injectable()
export class MigrationService {
  constructor(private readonly redis: RedisService) {
    this.#assertVersions();
  }

  /**
   * Sanity checks to ensure the version definitions are correct. Ensures that
   * a) the versions are in ascending order, b) the versions start at 1, c) the
   * versions are contiguous, d) the versions have no duplicate numbers, and e)
   * the versions are integers.
   */
  #assertVersions(): void {
    const versionSet = new Set<number>();
    let lastVersion = 0;

    if (versions[0].version !== 1) {
      throw new Error('Versions must start at 1');
    }

    for (const { version } of versions) {
      if (version <= lastVersion) {
        throw new Error('Versions must be in ascending order');
      }

      if (versionSet.has(version)) {
        throw new Error('Versions must not have duplicate numbers');
      }

      if (version !== Math.floor(version)) {
        throw new Error('Versions must be integers');
      }

      versionSet.add(version);
      lastVersion = version;
    }
  }

  /**
   * Runs when the application starts. Migrates the Redis database to the latest
   * version if necessary.
   */
  async onModuleInit(): Promise<void> {
    await this.#migrate();
  }

  /**
   * Gets the current version of the Redis database.
   */
  async version(): Promise<number> {
    const version = await this.redis.client.get(versionKey);

    return version ? Number.parseInt(version, 10) : 0;
  }

  /**
   * Sets the current version of the Redis database.
   */
  async setVersion(version: number): Promise<void> {
    await this.redis.client.set(versionKey, version.toString());
  }

  /**
   * Migrates the Redis database to the latest version if necessary.
   */
  async #migrate(): Promise<void> {
    // Get the current version of the Redis database, then get the subsequent
    // versions and their migrations.
    const currentVersion = await this.version();
    const currentVersionIndex = versions.findIndex(
      (version) => version.version === currentVersion,
    );
    const nextVersions = versions.slice(currentVersionIndex + 1);

    // Apply the migrations for each subsequent version.
    for (const { version, migrations } of nextVersions) {
      await this.#migrateToVersion(version, migrations);
    }
  }

  /**
   * Migrates the Redis database to a specific version. Uses a transaction to
   * ensure that the version is only set if all migrations are successful.
   */
  async #migrateToVersion(
    version: number,
    migrations: Migration[],
  ): Promise<void> {
    const client = this.redis.client;
    const transaction = client.multi();

    for (const migration of migrations) {
      await migration(transaction);
    }

    transaction.set(versionKey, version.toString());
    await transaction.exec();
  }
}
