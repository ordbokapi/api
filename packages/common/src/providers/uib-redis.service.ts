import { Injectable, Inject, Optional } from '@nestjs/common';
import { RedisJSON } from '@redis/json/dist/lib/commands';
import { FtSearchOptions as RedisSearchOptions } from 'redis';
import { RedisService, RedisMulti } from './redis.service';
import {
  UibDictionary,
  ArticleMetadata,
  RawConceptTable,
  RawWordClassList,
  RawWordSubclassList,
  ArticleMetadataMap,
  uibKeys,
  UibArticleIdentifier,
  idForArticleKey,
  DeferredIterable,
  RawArticle,
  UibArticle,
  addUibArticleMetadata,
} from '../types';

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
dictionary:<dictionaryId>:articles - (Hash) articleId -> article metadata JSON
  (the data fetched from the article list, i.e. articleId, primaryLemma,
  revision, updatedAt)
dictionary:<dictionaryId>:concepts - (JSON) concept data
dictionary:<dictionaryId>:word_classes - (JSON) word class data
dictionary:<dictionaryId>:word_subclasses - (JSON) word subclass data
*/

/**
 * Symbol for the UiB Redis service configuration provider.
 */
export const UibRedisConfig = Symbol('UibRedisConfig');

/**
 * Configuration for the UiB Redis service.
 */
export interface UibRedisConfig {
  /** If set to true, the service will allow writes to the Redis database. */
  allowWrites: boolean;
}

/**
 * Search results.
 */
export interface SearchResults<T> {
  /**
   * The total number of results.
   */
  total: number;

  /**
   * The results.
   */
  results: DeferredIterable<T>;
}

/**
 * Search options.
 */
export type SearchOptions = RedisSearchOptions;

/**
 * Search result with an identifier and the article data.
 */
export interface FullSearchResult extends UibArticleIdentifier {
  /**
   * The article data.
   */
  data: UibArticle;
}

/**
 * Provides read and write access to copies of UiB data stored in the Redis
 * database. Uses transactional semantics to ensure consistency. Takes advantage
 * of the JSON and Search modules of Redis to provide efficient access to the
 * data.
 */
@Injectable()
export class UibRedisService {
  constructor(
    private readonly redis: RedisService,
    @Optional()
    @Inject(UibRedisConfig)
    private readonly config: UibRedisConfig = { allowWrites: false },
  ) {}

  #throwIfWritesNotAllowed(): void {
    if (!this.config.allowWrites) {
      throw new Error('Writes are not allowed');
    }
  }

  // #region Article data

  /**
   * Fetches the article with the given ID from the given dictionary.
   * @param dictionary The dictionary to fetch the article from.
   * @param articleId The ID of the article to fetch.
   * @returns The article data, or null if the article does not exist.
   */
  async getArticle(
    dictionary: UibDictionary,
    articleId: number,
  ): Promise<UibArticle | null>;
  /**
   * Fetches the article with the given ID from the given dictionary.
   * @param identifier The identifier of the article to fetch.
   * @returns The article data, or null if the article does not exist.
   */
  async getArticle(
    identifier: UibArticleIdentifier,
  ): Promise<UibArticle | null>;
  /**
   * Fetches the article with the given ID from the given dictionary.
   * @param dictionaryOrIdentifier The dictionary to fetch the article from, or
   * the identifier of the article to fetch.
   * @param articleId The ID of the article to fetch, if not using an
   * identifier.
   * @returns The article data, or null if the article does not exist.
   */
  async getArticle(
    dictionaryOrIdentifier: UibDictionary | UibArticleIdentifier,
    articleId?: number,
  ): Promise<UibArticle | null> {
    if (typeof dictionaryOrIdentifier === 'string') {
      return this.redis.client.json.get(
        uibKeys.article(dictionaryOrIdentifier, articleId!),
      ) as unknown as Promise<UibArticle>;
    }

    return this.redis.client.json.get(
      uibKeys.article(
        dictionaryOrIdentifier.dictionary,
        dictionaryOrIdentifier.id,
      ),
    ) as unknown as Promise<UibArticle>;
  }

  /**
   * Fetches articles from the given dictionary.
   * @param dictionary The dictionary to fetch the articles from.
   * @param articleIds The IDs of the articles to fetch.
   * @returns A map of article IDs to article data.
   */
  async getArticlesFromDictionary(
    dictionary: UibDictionary,
    articleIds: number[],
  ): Promise<Map<number, UibArticle>> {
    const articleList = await this.redis.client.json.mGet(
      articleIds.map((id) => uibKeys.article(dictionary, id)),
      '$',
    );

    const articles = new Map<number, UibArticle>();

    for (let i = 0; i < articleIds.length; i++) {
      if (articleList[i] !== null) {
        articles.set(articleIds[i], articleList[i] as unknown as UibArticle);
      }
    }

    return articles;
  }

  /**
   * Gets a random article ID from the given dictionary.
   * @param dictionary The dictionary to get the random article ID from.
   * @returns The random article ID.
   */
  async getRandomArticleId(dictionary: UibDictionary): Promise<number | null> {
    const articleId = await this.redis.client.hRandField(
      uibKeys.dictionaryArticles(dictionary),
    );

    return articleId !== null ? Number.parseInt(articleId, 10) : null;
  }

  /**
   * Sets the article with the given ID in the given dictionary.
   * @param transaction The transaction to use.
   * @param dictionary The dictionary to set the article in.
   * @param articleId The ID of the article to set.
   * @param article The article data to set.
   */
  setArticle(
    transaction: RedisMulti,
    dictionary: UibDictionary,
    articleId: number,
    article: RawArticle | UibArticle,
  ): void {
    this.#throwIfWritesNotAllowed();

    transaction.json.set(
      uibKeys.article(dictionary, articleId),
      '$',
      addUibArticleMetadata(article) as unknown as RedisJSON,
    );
  }

  // #endregion

  // #region Article metadata

  /**
   * Fetches the article metadata for the given dictionary.
   * @param dictionary The dictionary to fetch the article metadata for.
   * @returns The article metadata, or null if the article metadata does not
   * exist.
   */
  async getAllArticleMetadata(
    dictionary: UibDictionary,
  ): Promise<ArticleMetadataMap> {
    const articleList = await this.redis.client.hGetAll(
      uibKeys.dictionaryArticles(dictionary),
    );

    const metadataMap: ArticleMetadataMap = new Map();

    for (const articleId in articleList) {
      const articleData = JSON.parse(articleList[articleId]);
      metadataMap.set(Number.parseInt(articleId, 10), {
        ...articleData,
        updatedAt: new Date(articleData.updatedAt),
      });
    }

    return metadataMap;
  }

  /**
   * Fetches the article metadata for the given dictionary and article IDs.
   * @param dictionary The dictionary to fetch the article metadata for.
   * @param articleIds The IDs of the articles to fetch the metadata for.
   * @returns A map of article IDs to article metadata.
   */
  async getArticleMetadata(
    dictionary: UibDictionary,
    articleIds: number[],
  ): Promise<ArticleMetadataMap> {
    if (articleIds.length === 0) {
      return new Map();
    }

    const articleList = await this.redis.client.hmGet(
      uibKeys.dictionaryArticles(dictionary),
      articleIds.map((id) => id.toString()),
    );

    const metadataMap: ArticleMetadataMap = new Map();

    for (let i = 0; i < articleIds.length; i++) {
      const article = articleList[i];
      if (article === null) {
        continue;
      }

      const articleData = JSON.parse(article);
      metadataMap.set(articleIds[i], {
        ...articleData,
        updatedAt: new Date(articleData.updatedAt),
      });
    }

    return metadataMap;
  }

  /**
   * Sets the article metadata for the given dictionary.
   * @param transaction The transaction to use.
   * @param dictionary The dictionary to set the article metadata for.
   * @param metadataMap The article metadata to set.
   */
  setAllArticleMetadata(
    transaction: RedisMulti,
    dictionary: UibDictionary,
    metadataMap: ArticleMetadataMap,
  ): void {
    this.#throwIfWritesNotAllowed();

    transaction.del(uibKeys.dictionaryArticles(dictionary));

    for (const [articleId, metadata] of metadataMap) {
      transaction.hSet(
        uibKeys.dictionaryArticles(dictionary),
        articleId.toString(),
        JSON.stringify(metadata),
      );
    }
  }

  /**
   * Sets the article metadata for the given dictionary and article.
   * @param transaction The transaction to use.
   * @param dictionary The dictionary to set the article metadata for.
   * @param metadata The article metadata to set.
   */
  setArticleMetadata(
    transaction: RedisMulti,
    dictionary: UibDictionary,
    metadata: ArticleMetadata,
  ): void {
    this.#throwIfWritesNotAllowed();

    const { articleId, ...metadataWithoutId } = metadata;

    transaction.hSet(
      uibKeys.dictionaryArticles(dictionary),
      articleId.toString(),
      JSON.stringify(metadataWithoutId),
    );
  }

  // #endregion

  // #region Concepts

  /**
   * Fetches the concepts for the given dictionary.
   * @param dictionary The dictionary to fetch the concepts for.
   * @returns The concepts, or null if the concepts do not exist.
   */
  async getConcepts(
    dictionary: UibDictionary,
  ): Promise<RawConceptTable | null> {
    return this.redis.client.json.get(
      uibKeys.dictionaryConcepts(dictionary),
    ) as Promise<RawConceptTable>;
  }

  /**
   * Sets the concepts for the given dictionary.
   * @param transaction The transaction to use.
   * @param dictionary The dictionary to set the concepts for.
   * @param concepts The concepts to set.
   */
  setConcepts(
    transaction: RedisMulti,
    dictionary: UibDictionary,
    concepts: RawConceptTable,
  ): void {
    this.#throwIfWritesNotAllowed();

    transaction.json.set(
      uibKeys.dictionaryConcepts(dictionary),
      '$',
      concepts as RedisJSON,
    );
  }

  // #endregion

  // #region Word classes

  /**
   * Fetches the word classes for the given dictionary.
   * @param dictionary The dictionary to fetch the word classes for.
   * @returns The word classes, or null if the word classes do not exist.
   */
  async getWordClasses(
    dictionary: UibDictionary,
  ): Promise<RawWordClassList | null> {
    return this.redis.client.json.get(
      uibKeys.dictionaryWordClasses(dictionary),
    ) as Promise<RawWordClassList>;
  }

  /**
   * Sets the word classes for the given dictionary.
   * @param transaction The transaction to use.
   * @param dictionary The dictionary to set the word classes for.
   * @param wordClasses The word classes to set.
   */
  setWordClasses(
    transaction: RedisMulti,
    dictionary: UibDictionary,
    wordClasses: RawWordClassList,
  ): void {
    this.#throwIfWritesNotAllowed();

    transaction.json.set(
      uibKeys.dictionaryWordClasses(dictionary),
      '$',
      wordClasses as RedisJSON,
    );
  }

  // #endregion

  // #region Word subclasses

  /**
   * Fetches the word subclasses for the given dictionary.
   * @param dictionary The dictionary to fetch the word subclasses for.
   * @returns The word subclasses, or null if the word subclasses do not exist.
   */
  async getWordSubclasses(
    dictionary: UibDictionary,
  ): Promise<RawWordSubclassList | null> {
    return this.redis.client.json.get(
      uibKeys.dictionaryWordSubclasses(dictionary),
    ) as Promise<RawWordSubclassList>;
  }

  /**
   * Sets the word subclasses for the given dictionary.
   * @param transaction The transaction to use.
   * @param dictionary The dictionary to set the word subclasses for.
   * @param wordSubclasses The word subclasses to set.
   */
  setWordSubclasses(
    transaction: RedisMulti,
    dictionary: UibDictionary,
    wordSubclasses: RawWordSubclassList,
  ): void {
    this.#throwIfWritesNotAllowed();

    transaction.json.set(
      uibKeys.dictionaryWordSubclasses(dictionary),
      '$',
      wordSubclasses as RedisJSON,
    );
  }

  // #endregion

  // #region Search

  /*
  for reference, the index creation command is:

  FT.CREATE idx:article:dict ON JSON SCHEMA
    $.lemmas[*].lemma AS lemma TEXT SORTABLE
    $.suggest[*] AS suggest TEXT SORTABLE
    $.etymology[*].items[*].text AS etymology TEXT SORTABLE
    $.lemmas[*].paradigm_info[*].tags[*] AS paradigm_tags TAG
    $.lemmas[*].paradigm_info[*].inflection[*].tags[*] AS inflection_tags TAG
    $.lemmas[*].split_inf AS split_infinitive TAG

  Example search:

  FT.SEARCH idx:article:dict @lemma:skule
  */

  /**
   * Performs a search.
   * @param query The search query.
   * @param dictionary The dictionary to search in. If not provided, searches in
   * all dictionaries.
   * @param options The search options.
   * @returns The search results.
   */
  async search(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<SearchResults<UibArticleIdentifier>> {
    const response = await this.redis.client.ft.searchNoContent(
      uibKeys.articleIndex(dictionary),
      query,
      options,
    );

    if (
      !response ||
      !(typeof response === 'object') ||
      !('total' in response) ||
      !(typeof response.total === 'number') ||
      !('documents' in response) ||
      !Array.isArray(response.documents)
    ) {
      return {
        total: 0,
        results: new DeferredIterable<UibArticleIdentifier>([]),
      };
    }

    const { total, documents } = response;

    return {
      total,
      results: new DeferredIterable(documents).map((key) =>
        idForArticleKey(key as string),
      ),
    };
  }

  /**
   * Takes a search result and returns one with all articles fetched.
   * @param searchResult The search result to fetch articles for.
   * @returns The search result with all articles fetched.
   */
  async fetchArticles(
    searchResult: SearchResults<UibArticleIdentifier>,
  ): Promise<SearchResults<FullSearchResult>> {
    return {
      total: searchResult.total,
      results: new DeferredIterable(
        await Promise.all(
          Array.from(searchResult.results).map((id) =>
            this.getArticle(id).then((article) => ({
              id: id.id,
              dictionary: id.dictionary,
              data: article!,
            })),
          ),
        ),
      ),
    };
  }

  /**
   * Performs a search with article data included in the results.
   * @param query The search query.
   * @param dictionary The dictionary to search in. If not provided, searches in
   * all dictionaries.
   * @param options The search options.
   * @returns The search results.
   */
  async searchWithData(
    query: string,
    dictionary?: UibDictionary,
    options?: SearchOptions,
  ): Promise<SearchResults<FullSearchResult>> {
    const response = await this.redis.client.ft.search(
      uibKeys.articleIndex(dictionary),
      query,
      options,
    );

    if (
      !response ||
      !(typeof response === 'object') ||
      !('total' in response) ||
      !(typeof response.total === 'number') ||
      !('documents' in response) ||
      !Array.isArray(response.documents)
    ) {
      return {
        total: 0,
        results: new DeferredIterable<FullSearchResult>([]),
      };
    }

    const { total, documents } = response;

    return {
      total,
      results: new DeferredIterable(documents).map((obj) => {
        const { id, value } = obj as { id: string; value: unknown };
        return {
          ...idForArticleKey(id),
          data: value as UibArticle,
        };
      }),
    };
  }

  // #endregion
}
