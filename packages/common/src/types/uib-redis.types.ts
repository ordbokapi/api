import { DateTime } from 'luxon';
import { RawArticle, RawArticleMetadata, UibDictionary } from './uib-api.types';
import { isObject } from '../utils';

/**
 * Article metadata.
 */
export interface ArticleMetadata {
  /** The ID of the article. */
  articleId: number;

  /** The primary lemma of the article. */
  primaryLemma: string;

  /** The latest revision number of the article. */
  revision: number;

  /** The update timestamp of the article. */
  updatedAt: Date;
}

/**
 * Article metadata map.
 */
export type ArticleMetadataMap = Map<
  number,
  Omit<ArticleMetadata, 'articleId'>
>;

/**
 * Converts raw article metadata to article metadata.
 * @param raw The raw article metadata.
 */
export function convertRawArticleMetadata([
  articleId,
  primaryLemma,
  revision,
  updatedAt,
]: RawArticleMetadata): ArticleMetadata {
  return {
    articleId,
    primaryLemma,
    revision,
    // necessary because the UiB API returns oddtimestamps without timezones
    // e.g. 2024-03-05 08:52:00.275423
    updatedAt: updatedAt
      ? DateTime.fromISO(updatedAt.replace(' ', 'T'), {
          zone: 'Europe/Oslo',
        }).toJSDate()
      : new Date(),
  };
}

/**
 * FT index names for articles.
 */
export enum ArticleIndex {
  /** The index for article lemmas. */
  Lemma = 'lemma',

  /** The index for exact-matching the whole lemma. */
  LemmaExact = 'lemma_exact',

  /** The index for suggestion terms for a given article. */
  Suggest = 'suggest',

  /** The index for exact-matching the whole suggestion term. */
  SuggestExact = 'suggest_exact',

  /** The index for article etymology text. */
  Etymology = 'etymology',

  /** The index for paradigm tags. */
  ParadigmTags = 'paradigm_tags',

  /** The index for inflection tags. */
  InflectionTags = 'inflection_tags',

  /** The index for inflection word forms. */
  Inflection = 'inflection',

  /** The index for exact-matching the whole inflection word form. */
  InflectionExact = 'inflection_exact',

  /** The index for split infinitive attributes. */
  SplitInfinitive = 'split_infinitive',
}

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
    - inflection word forms: body.lemmas[*].paradigm_info[*].inflection[*].word_form
dictionary:<dictionaryId>:articles - (Hash) articleId -> article metadata JSON
  (the data fetched from the article list, i.e. articleId, primaryLemma,
  revision, updatedAt)
dictionary:<dictionaryId>:concepts - (JSON) concept data
dictionary:<dictionaryId>:word_classes - (JSON) word class data
dictionary:<dictionaryId>:word_subclasses - (JSON) word subclass data
*/

/**
 * Helper functions for getting keys for the UiB data stored in Redis.
 */
export const uibKeys = {
  articleIndex: (dictionary?: UibDictionary) =>
    `idx:article${dictionary ? `:${dictionary}` : ''}`,
  article: (dictionary: UibDictionary, articleId: number) =>
    `article:${dictionary}:${articleId}`,
  dictionaryArticles: (dictionary: UibDictionary) =>
    `dictionary:${dictionary}:articles`,
  dictionaryConcepts: (dictionary: UibDictionary) =>
    `dictionary:${dictionary}:concepts`,
  dictionaryWordClasses: (dictionary: UibDictionary) =>
    `dictionary:${dictionary}:word_classes`,
  dictionaryWordSubclasses: (dictionary: UibDictionary) =>
    `dictionary:${dictionary}:word_subclasses`,
};

/**
 * Identifies a particular article in the database.
 */
export interface UibArticleIdentifier {
  /** The dictionary ID. */
  dictionary: UibDictionary;

  /** The article ID. */
  id: number;
}

/**
 * Returns whether or not the given value is a UiB article identifier.
 */
export function isUibArticleIdentifier(
  value: unknown,
): value is UibArticleIdentifier {
  return (
    isObject(value) &&
    'dictionary' in value &&
    typeof value.dictionary === 'string' &&
    Object.values(UibDictionary).includes(value.dictionary as UibDictionary) &&
    'id' in value &&
    typeof value.id === 'number'
  );
}

/**
 * Takes a key and returns the corresponding article identifier.
 * @param key The key.
 */
export const idForArticleKey = (key: string): UibArticleIdentifier => {
  const [_, dictionary, articleId] = key.split(':');

  return {
    dictionary: dictionary as UibDictionary,
    id: Number.parseInt(articleId, 10),
  };
};

/**
 * The format of article data as stored in Redis.
 */
export interface UibArticle extends RawArticle {
  /** Additional metadata used for indexing and other purposes. */
  __ordbokapi__: UibArticleMetadata;
}

/**
 * Returns whether or not the given article is a processed UiB article.
 */
export function isUibArticle(article: RawArticle): article is UibArticle {
  return '__ordbokapi__' in article;
}

/**
 * Given a raw article, returns the article with additional metadata added.
 */
export function addUibArticleMetadata(article: RawArticle): UibArticle {
  if (isUibArticle(article)) {
    return article;
  }

  return {
    ...article,
    __ordbokapi__: {
      hasSplitInf: article.lemmas?.some((lemma) => lemma?.split_inf),
    },
  };
}

/**
 * Additional metadata used for indexing and other purposes.
 */
export interface UibArticleMetadata {
  /**
   * Whether or not any of the lemmas represent a verb with a split infinitive
   * (kløyvd infinitiv).
   */
  hasSplitInf: boolean;
}
