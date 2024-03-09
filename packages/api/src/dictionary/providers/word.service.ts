import { Injectable, Logger } from '@nestjs/common';
import {
  Word,
  Dictionary,
  Definition,
  Article,
  WordClass,
  Inflection,
  InflectionTag,
  Paradigm,
  Gender,
  Lemma,
  Suggestions,
  RelatedArticleRelationship,
  UsageArticleRelationship,
  SynonymArticleRelationship,
  AntonymArticleRelationship,
  SeeAlsoArticleRelationship,
  RichContentArticleSegment,
  ArticleRelationship,
  ArticleGraph,
  ArticleGraphEdge,
  ArticleRelationshipType,
  PhraseArticleRelationship,
  RichContent,
  toUibDictionary,
  fromUibDictionary,
} from '../models';
import {
  OrdboekeneApiService,
  OrdboekeneApiSearchType as ApiSearchType,
} from './ordboekene-api.service';
import { TwoWayMap, RichContentBuilder } from '../types';
import {
  UiBDictionary,
  UibRedisService,
  ArticleElement,
  ArticleTextElement,
  UiBArticleIdentifier,
  SanitizationService,
  UnionIterable,
  ArticleIndex,
} from 'ordbokapi-common';
import { Asyncify, CacheWrapperService } from './cache-wrapper.service';

const wordClassMap = new TwoWayMap([
  ['NOUN', WordClass.Substantiv],
  ['ADJ', WordClass.Adjektiv],
  ['ADV', WordClass.Adverb],
  ['VERB', WordClass.Verb],
  ['PRON', WordClass.Pronomen],
  ['ADP', WordClass.Preposisjon],
  ['CCONJ', WordClass.Konjunksjon],
  ['INTJ', WordClass.Interjeksjon],
  ['DET', WordClass.Determinativ],
  ['SCONJ', WordClass.Subjunksjon],
  ['SYM', WordClass.Symbol],
  ['ABBR', WordClass.Forkorting],
  ['EXPR', WordClass.Uttrykk],
]);

@Injectable()
export class WordService {
  private readonly logger = new Logger(WordService.name);
  readonly #uibData: Asyncify<UibRedisService>;

  constructor(
    private ordboekeneApiService: OrdboekeneApiService,
    uibData: UibRedisService,
    cacheWrapper: CacheWrapperService,
    private readonly sanitizer: SanitizationService,
  ) {
    this.#uibData = cacheWrapper.createProxy(uibData);
  }

  private concepts: { [Dictionary: string]: any } = {};

  //#region Public methods

  async getSuggestions(
    word: string,
    dictionaries: Dictionary[],
    searchType?: ApiSearchType,
    maxCount?: number,
    wordClass?: WordClass,
  ): Promise<Suggestions> {
    this.logger.debug(`Getting suggestions for word: ${word}`);

    const data = await this.ordboekeneApiService.suggest(
      word,
      dictionaries,
      maxCount,
      searchType,
      wordClass ? wordClassMap.getReverse(wordClass) : undefined,
    );
    this.logger.debug(`Received suggestions: ${JSON.stringify(data)}`);

    return this.transformSuggestionsResponse(data);
  }

  async getWord(
    word: string,
    dictionaries: Dictionary[],
    wordClass?: WordClass,
  ): Promise<Word | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting articles for word: ${word}`);

    // const data = await this.ordboekeneApiService.articles(
    //   word,
    //   dictionaries,
    //   ApiSearchType.Exact,
    //   wordClass ? wordClassMap.getReverse(wordClass) : undefined,
    // );

    // console.log(data);

    // Example API response:

    // {"meta": {"bm": {"total": 1}, "nn": {"total": 2}}, "articles": {"bm": [60110], "nn": [77999, 78000]}}

    // or, if not found:

    // {"meta": {"bm": {"total": 0}, "nn": {"total": 0}}, "articles": {"bm": [], "nn": []}}

    // const foundDictionaries: Dictionary[] = [];

    // for (const dict of Object.values(UiBDictionary)) {
    //   if (data.meta[dict]?.total) {
    //     foundDictionaries.push(fromUibDictionary(dict));
    //   }
    // }

    // if (foundDictionaries.length === 0) {
    //   return undefined;
    // }

    // const wordObject: Word = {
    //   word,
    //   dictionaries: foundDictionaries,
    //   articles: Object.entries(data.articles).flatMap(
    //     ([dictParam, ids]: [string, number[]]) =>
    //       ids.map((id: number) => ({
    //         id,
    //         dictionary: this.getDictionary(dictParam),
    //       })),
    //   ),
    // };

    const sanitized = this.sanitizer.sanitize(word);
    const articles: UnionIterable<UiBArticleIdentifier> = new UnionIterable();

    let query = `((@${ArticleIndex.LemmaExact}:{${sanitized}}) | (@${ArticleIndex.InflectionExact}:{${sanitized}}))`;

    if (wordClass) {
      query += ` (@${ArticleIndex.ParadigmTags}:{${wordClassMap.getReverse(wordClass)}})`;
    }

    for (const dict of dictionaries) {
      const { total, results } = await this.#uibData.search(
        query,
        toUibDictionary(dict),
      );

      if (total > 0) {
        articles.concat(results);
      }
    }

    if (articles.size === 0) {
      return undefined;
    }

    const wordObject: Word = {
      word,
      dictionaries,
      articles: [
        ...articles.map((article) => ({
          id: article.id,
          dictionary: fromUibDictionary(article.dictionary),
        })),
      ],
    };

    return wordObject;
  }

  async getDefinitions(article: Article): Promise<Definition[]> {
    await this.loadConcepts();

    this.logger.debug(`Getting definitions for article: ${article.id}`);

    // const data = await this.ordboekeneApiService.article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    if (!data) {
      return [];
    }

    this.transformArticleResponse(article, data);

    return article.definitions!;
  }

  async getRelationships(article: Article): Promise<ArticleRelationship[]> {
    await this.loadConcepts();

    this.logger.debug(`Getting relationships for article: ${article.id}`);

    // const data = await this.ordboekeneApiService.article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    if (!data) {
      return [];
    }

    return this.transformRelationships(article, data);
  }

  async getArticle(
    articleId: number,
    dictionary: Dictionary,
  ): Promise<Article | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting article: ${articleId}`);

    // const data = await this.ordboekeneApiService.article(articleId, dictionary);
    const data = await this.#uibData.getArticle(
      toUibDictionary(dictionary),
      articleId,
    );

    if (!data) {
      return undefined;
    }

    this.logger.debug(`Received article: ${articleId}`);

    const article: Article = {
      id: articleId,
      dictionary,
    };

    this.transformArticleResponse(article, data);

    this.logger.debug(`Transformed article: ${articleId}`);

    return article;
  }

  async getWordClass(article: Article): Promise<WordClass | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting word class for article: ${article.id}`);

    // const data = await this.ordboekeneApiService .article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    return data ? this.transformWordClass(data) : undefined;
  }

  async getLemmas(article: Article): Promise<Lemma[] | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting lemmas for article: ${article.id}`);

    // const data = await this.ordboekeneApiService.article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    return data ? this.transformLemmaInfo(data) : undefined;
  }

  async getGender(article: Article): Promise<Gender | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting gender for article: ${article.id}`);

    // const data = await this.ordboekeneApiService.article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    return data ? this.transformGender(data) : undefined;
  }

  async getPhrases(article: Article): Promise<Article[]> {
    await this.loadConcepts();

    this.logger.debug(`Getting phrases for article: ${article.id}`);

    // const data = await this.ordboekeneApiService.article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    return data ? this.transformPhrases(article, data) : [];
  }

  async getEtymology(article: Article): Promise<RichContent[]> {
    await this.loadConcepts();

    this.logger.debug(`Getting etymology for article: ${article.id}`);

    // const data = await this.ordboekeneApiService.article(
    //   article.id,
    //   article.dictionary,
    // );

    const data = await this.#uibData.getArticle(
      toUibDictionary(article.dictionary),
      article.id,
    );

    return data ? this.transformEtymology(article, data) : [];
  }

  async getArticleGraph(
    articleId: number,
    dictionary: Dictionary,
    depth: number,
    edgeFields: (keyof ArticleGraphEdge)[],
  ): Promise<ArticleGraph> {
    await this.loadConcepts();

    this.logger.debug(
      `Getting article graph for article ${articleId} in ${dictionary}`,
    );

    return this.walkArticleGraph(
      articleId,
      dictionary,
      Math.min(depth, 3),
      edgeFields,
    );
  }

  //#endregion

  //#region Private helper methods

  private getDictParam(dictionary: Dictionary | Dictionary[]): string {
    return Array.isArray(dictionary)
      ? dictionary.map((d) => this.getDictParam(d)).join(',')
      : toUibDictionary(dictionary);
  }

  private getDictionary(dictParam: string): Dictionary {
    return fromUibDictionary(dictParam as UiBDictionary);
  }

  private transformWordClass(article: any): WordClass | undefined {
    if (article.lemmas && article.lemmas.length > 0) {
      const lemma = article.lemmas[0];
      if (lemma.paradigm_info && lemma.paradigm_info.length > 0) {
        const tags = lemma.paradigm_info[0].tags;
        if (tags && tags.length > 0) {
          const wordClassTag = tags.find((tag: string) =>
            wordClassMap.has(tag),
          );
          if (!wordClassTag) {
            this.logger.warn(
              `Fann ikkje ordklasse for ${lemma.lemma} (prøvde å transformera ${tags} til ordklasse)`,
            );
          }
          return wordClassTag && wordClassMap.get(wordClassTag);
        }
      }
    }

    return undefined;
  }

  private transformLemmaInfo(article: any): Lemma[] | undefined {
    const inflectionTagMapping: { [key: string]: InflectionTag } = {
      Inf: InflectionTag.Infinitiv,
      Pres: InflectionTag.Presens,
      Past: InflectionTag.Preteritum,
      '<PerfPart>': InflectionTag.PerfektPartisipp,
      '<PresPart>': InflectionTag.PresensPartisipp,
      '<SPass>': InflectionTag.SPassiv,
      Imp: InflectionTag.Imperativ,
      Pass: InflectionTag.Passiv,
      Adj: InflectionTag.Adjektiv,
      Adv: InflectionTag.Adverb,
      Neuter: InflectionTag.Inkjekjoenn,
      Ind: InflectionTag.Ubestemt,
      Sing: InflectionTag.Eintal,
      'Masc/Fem': InflectionTag.HankjoennHokjoenn,
      Masc: InflectionTag.Hankjoenn,
      Fem: InflectionTag.Hokjoenn,
      Def: InflectionTag.Bestemt,
      Plur: InflectionTag.Fleirtal,
      Pos: InflectionTag.Positiv,
      Cmp: InflectionTag.Komparativ,
      Sup: InflectionTag.Superlativ,
      Nom: InflectionTag.Nominativ,
      Acc: InflectionTag.Akkusativ,
    };

    // words can have multiple paradigms, e.g. feminine gender words in Bokmål, which have both
    // a masculine and a feminine paradigm

    const lemmas: Lemma[] = [];

    article.lemmas?.forEach((lemma: any) => {
      const lemmaEntity: Lemma = {
        id: lemma.id,
        lemma: lemma.lemma,
        meaning: lemma.hgno,
        paradigms: [],
        splitInfinitive: Boolean(lemma.split_inf),
      };

      lemma.paradigm_info?.forEach((paradigmInfo: any) => {
        const paradigm = new Paradigm();
        paradigm.id = paradigmInfo.paradigm_id;
        paradigm.inflections = paradigmInfo.inflection
          .filter((inf: any) => inf.tags.length > 0 || inf.word_form)
          .map(
            (inf: any): Inflection => ({
              tags: inf.tags.map((tag: string) => inflectionTagMapping[tag]),
              wordForm: inf.word_form,
            }),
          );
        paradigm.tags = paradigmInfo.tags
          .map((tag: string) => inflectionTagMapping[tag])
          .filter((tag: InflectionTag | undefined) => tag !== undefined);

        lemmaEntity.paradigms.push(paradigm);
      });

      lemmas.push(lemmaEntity);
    });

    return lemmas;
  }

  private transformGender(article: any): Gender | undefined {
    // Gender is determined by the paradigms. If paradigms exist for both masculine and feminine
    // grammatical genders, then the word is both masculine and feminine. If paradigms exist for
    // only one grammatical gender, then the word is just of that gender.

    let foundMasc = false;
    let foundFem = false;

    for (const lemma of article.lemmas ?? []) {
      for (const paradigmInfo of lemma.paradigm_info ?? []) {
        for (const tag of paradigmInfo.tags ?? []) {
          if (tag === 'Neuter') {
            return Gender.Inkjekjoenn;
          } else if (tag === 'Masc') {
            foundMasc = true;
          } else if (tag === 'Fem') {
            foundFem = true;
          }
        }
      }
    }

    return foundMasc && foundFem
      ? Gender.HankjoennHokjoenn
      : foundMasc
        ? Gender.Hankjoenn
        : foundFem
          ? Gender.Hokjoenn
          : undefined;
  }

  private async loadConcepts() {
    await Promise.all(
      Object.values(Dictionary).map(async (dictionary) => {
        if (this.concepts[dictionary]) {
          return;
        }
        this.logger.debug(
          `Requesting concept lookup table from ${dictionary} from API`,
        );
        try {
          this.concepts[dictionary] =
            // await this.ordboekeneApiService.concepts(dictionary);
            await this.#uibData.getConcepts(toUibDictionary(dictionary));
        } catch (error) {
          this.logger.error(
            `Failed to fetch concepts from Ordbøkene API for ${dictionary}.`,
            error,
          );
        }
      }),
    );
  }

  //#endregion

  //#region Data transformation methods

  private formatText(
    dictionary: Dictionary,
    element: ArticleTextElement,
  ): RichContentBuilder {
    const richContent = new RichContentBuilder();

    if (!element.content) {
      return richContent;
    }

    // Format the text element
    const segments = element.content.split('$');

    for (const [i, segment] of segments.entries()) {
      richContent.append(segment);
      if (i >= segments.length - 1) {
        continue;
      }

      richContent.append(this.formatElement(dictionary, element.items[i]));
    }

    return richContent;
  }

  private formatElement(
    dictionary: Dictionary,
    element: ArticleElement,
  ): RichContentBuilder {
    const richContent = new RichContentBuilder();

    switch (element.type_) {
      case 'domain':
      case 'entity':
      case 'grammar':
      case 'language':
      case 'relation':
      case 'rhetoric':
      case 'temporal': {
        const conceptId = element.id;
        const concept = this.concepts[dictionary].concepts[conceptId];

        if (concept) {
          return concept.expansion;
        } else {
          this.logger.warn(
            `Fann ikkje concept ${conceptId} i ${dictionary} (prøvde å formattera ${element.type_})`,
          );
          richContent.append('(?)');
        }

        break;
      }

      case 'compound_list': {
        richContent
          .append(this.formatText(dictionary, element.intro))
          .append(' ');
        element.elements.forEach((item: any, index: number) => {
          richContent.append(this.formatElement(dictionary, item));
          if (index < element.elements.length - 1) {
            richContent.append(', ');
          }
        });
        break;
      }

      case 'article_ref': {
        const article = element;
        const lemma = article.lemmas[0].lemma;

        richContent.append(
          new RichContentArticleSegment({
            content: lemma,
            article: {
              id: article.article_id,
              dictionary,
            },
            definitionId: article.definition_id,
            definitionIndex: article.definition_order - 1,
          }),
        );

        break;
      }

      case 'sub_article': {
        const article = element.article;
        const lemma = article.lemmas[0].lemma;

        richContent.append(
          new RichContentArticleSegment({
            content: lemma,
            article: {
              id: article.article_id,
              dictionary,
            },
          }),
        );
        break;
      }

      case 'usage': {
        richContent.append(element.text);
        break;
      }

      case 'quote_inset':
      case 'explanation':
      case 'etymology_language':
      case 'etymology_reference': {
        richContent.append(this.formatText(dictionary, element));
        break;
      }

      case 'definition': {
        element.elements?.forEach((item: any) =>
          richContent.append(this.formatElement(dictionary, item)),
        );
        break;
      }

      case 'example': {
        richContent.append(this.formatText(dictionary, element.quote));
        break;
      }

      default: {
        this.logger.warn(
          `Kunne ikkje formattera element av type ${(element as any).type_}`,
        );
        richContent.append('(?)');
        break;
      }
    }

    return richContent;
  }

  private transformSuggestionsResponse(data: any): Suggestions {
    // Transform the response into an array of Word models

    // Example API response:
    // {"q": "tekst", "cnt": 8, "cmatch": 1, "a": {"exact": [["tekst", ["bm", "nn"]], ["teksta", ["nn"]]], "inflect": [["tekste", ["bm", "nn"]], ["takast", ["nn"]]], "freetext": [["tekst", ["bm", "nn"]], ["teksta", ["nn"]]], "similar": [["tekst-TV", ["bm"]], ["tekst-tv", ["bm"]]]}}

    const suggestions = new Suggestions();

    suggestions.exact = this.mapSuggestionsToWords(data.a?.exact);
    suggestions.inflections = this.mapSuggestionsToWords(data.a?.inflect);
    suggestions.freetext = this.mapSuggestionsToWords(data.a?.freetext);
    suggestions.similar = this.mapSuggestionsToWords(data.a?.similar);

    return suggestions;
  }

  private mapSuggestionsToWords(rawWords: any) {
    return (
      rawWords?.map((rawWord: any) => {
        return {
          word: rawWord[0],
          dictionaries: rawWord[1].map((d: string) => this.getDictionary(d)),
        };
      }) ?? []
    );
  }

  private transformArticleResponse(article: Article, data: any): Article {
    const definitions: Definition[] = [];

    // Example API response:

    // {"article_id": 60110, "submitted": "2022-02-24 01:09:09.459492", "suggest": ["tekst"], "lemmas": [{"final_lexeme": "tekst", "hgno": 0, "id": 68771, "inflection_class": "m1, f1", "initial_lexeme": "", "junction": "", "lemma": "tekst", "neg_junction": null, "paradigm_info": [{"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "tekst"}, {"tags": ["Sing", "Def"], "word_form": "teksten"}, {"tags": ["Plur", "Ind"], "word_form": "tekster"}, {"tags": ["Plur", "Def"], "word_form": "tekstene"}], "inflection_group": "NOUN_regular", "paradigm_id": 564, "standardisation": "STANDARD", "tags": ["NOUN", "Masc"], "to": null}, {"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "tekst"}, {"tags": ["Sing", "Def"], "word_form": "teksta"}, {"tags": ["Plur", "Ind"], "word_form": "tekster"}, {"tags": ["Plur", "Def"], "word_form": "tekstene"}], "inflection_group": "NOUN_regular", "paradigm_id": 760, "standardisation": "STANDARD", "tags": ["NOUN", "Fem"], "to": null}], "split_inf": null}], "body": {"pronunciation": [], "etymology": [{"type_": "etymology_language", "content": "$ $", "items": [{"type_": "language", "id": "norr."}, {"type_": "usage", "text": "textr, texti"}]}, {"type_": "etymology_language", "content": "fra $ $ ‘sammenføyning, vev’", "items": [{"type_": "language", "id": "lat."}, {"type_": "usage", "text": "textus"}]}], "definitions": [{"type_": "definition", "elements": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "trykte $ skrevne ord satt sammen til en fortelling, skildring $, tekstutsnitt", "items": [{"type_": "relation", "id": "el"}, {"type_": "entity", "id": "e_l"}]}, {"type_": "example", "quote": {"content": "$ er uleselig flere steder", "items": [{"type_": "usage", "text": "teksten"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "en bok med mange bilder og lite $", "items": [{"type_": "usage", "text": "tekst"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "kommentere en $ fra Gammelnorsk homiliebok", "items": [{"type_": "usage", "text": "tekst"}]}, "explanation": {"content": "", "items": []}}], "id": 2}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "ordene i en sang $ opera", "items": [{"type_": "relation", "id": "el"}]}, {"type_": "example", "quote": {"content": "både $ og melodi var av Alf Prøysen", "items": [{"type_": "usage", "text": "tekst"}]}, "explanation": {"content": "", "items": []}}], "id": 4}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "bibelord (som utgangspunkt for en preken)", "items": []}, {"type_": "example", "quote": {"content": "$ i dag er hentet fra evangeliet etter Johannes", "items": [{"type_": "usage", "text": "teksten"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "holde seg til $", "items": [{"type_": "usage", "text": "teksten"}]}, "explanation": {"content": "emnet, saken", "items": []}}, {"type_": "sub_article", "article_id": 105762, "lemmas": ["lese en teksten"], "article": {"body": {"type_": "article", "lemmas": [{"final_lexeme": "lese en teksten", "hgno": 0, "id": 1147315, "inflection_class": null, "initial_lexeme": "", "junction": "", "lemma": "lese en teksten", "neg_junction": null, "paradigm_info": [{"from": "2019-01-01", "inflection": [], "inflection_group": "EXPR", "paradigm_id": 2470, "standardisation": "REGISTERED", "tags": ["EXPR"], "to": null}], "split_inf": false}], "pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "irettesette noen", "items": []}], "id": 2}], "homographs": [0], "word_class": null, "word_forms": ["lese en teksten"]}}, "intro": {"content": "", "items": []}}], "id": 5}], "id": 3}]}, "to_index": ["teksten", "tekst", "tekst", "tekst", "teksten", "teksten", "textr, texti", "textus"]}

    // console.dir(data, { depth: null });

    if (data?.body?.definitions?.[0]?.elements?.length) {
      definitions.push(
        ...this.transformDefinitions(
          article.id,
          article.dictionary,
          data.body.definitions[0].elements.some(
            (d: any) => d.type_ === 'definition',
          )
            ? data.body.definitions[0].elements
            : data.body.definitions,
        ),
      );
    }

    article.definitions = definitions;

    article.wordClass = this.transformWordClass(data);

    return article;
  }

  private getRelationshipConstructors(
    element:
      | (ArticleElement & { type_: 'explanation' })
      | Extract<ArticleElement, { type_: 'compound_list' }>,
  ): {
    from: number;
    to?: number; // exclusive. if undefined, then until end of array
    constructor: new (article: Article) => ArticleRelationship;
  }[] {
    const constructorRanges: {
      from: number;
      to?: number; // exclusive. if undefined, then until end of array
      constructor: new (article: Article) => ArticleRelationship;
    }[] = [];

    if (element.type_ === 'compound_list') {
      constructorRanges.push({
        from: 0,
        constructor: UsageArticleRelationship,
      });

      return constructorRanges;
    }

    if (element.content?.match(/^(S(?:e|jå): )\$/)) {
      constructorRanges.push({
        from: 0,
        constructor: SeeAlsoArticleRelationship,
      });

      return constructorRanges;
    }

    // match first part of the explanation that only has references,
    // i.e. it only contains $ and surrounding whitespace or punctuation
    // e.g. "$, $, $: xxx $ xxx" -> "$, $, $:"
    const match = element.content?.match(/^(\s*\$\s*[,:;]?\s*)+/);
    if (match) {
      // count the number of references
      const refCount = match[0].match(/\$/g)?.length ?? 0;

      constructorRanges.push({
        from: 0,
        to: refCount,
        constructor: SynonymArticleRelationship,
      });

      return constructorRanges;
    }

    if (element.content?.match(/^\s*ikkj?e \$(?:\b|$)/)) {
      constructorRanges.push({
        from: 0,
        to: 1,
        constructor: AntonymArticleRelationship,
      });

      constructorRanges.push({
        from: 1,
        constructor: RelatedArticleRelationship,
      });

      return constructorRanges;
    }

    constructorRanges.push({
      from: 0,
      constructor: RelatedArticleRelationship,
    });

    return constructorRanges;
  }

  private transformDefinitionElement(
    articleId: number,
    dictionary: Dictionary,
    definition: Definition,
    element: ArticleElement,
  ): Definition {
    switch (element.type_) {
      case 'explanation':
      case 'compound_list': {
        const richContent = this.formatElement(dictionary, element);

        definition.content.push(richContent.build());

        const constructorRanges = this.getRelationshipConstructors(
          element as ArticleElement & {
            type_: 'explanation' | 'compound_list';
          },
        );

        let index = 0;
        let range = constructorRanges.shift();
        richContent.forEachArticleSegment((segment) => {
          const { article } = segment as RichContentArticleSegment;

          if (article.id === articleId) {
            index++;
            return;
          }

          while (
            range &&
            (index < range.from || (range.to && index >= range.to))
          ) {
            range = constructorRanges.shift();
          }

          const constructor = range?.constructor ?? RelatedArticleRelationship;

          definition.relationships.push(new constructor(article));

          index++;
        });

        break;
      }

      case 'example': {
        const richContent = this.formatElement(dictionary, element);

        definition.examples.push(richContent.build());
        break;
      }

      case 'definition': {
        const subDefinition = new Definition({ id: element.id });

        for (const subElement of element.elements ?? []) {
          this.transformDefinitionElement(
            articleId,
            dictionary,
            subDefinition,
            subElement,
          );
        }

        definition.subDefinitions.push(subDefinition);
        break;
      }
    }

    return definition;
  }

  private transformDefinitions(
    articleId: number,
    dictionary: Dictionary,
    elements: any[],
  ): Definition[] {
    const definitions: Definition[] = [];

    for (const def of elements) {
      // Skip if this is a phrase
      if (
        def.type_ === 'definition' &&
        def.elements?.every((e: any) => e.type_ === 'sub_article')
      ) {
        continue;
      }

      // if the current element is an example and we have a definition at the
      // end of the array of definitions we're building, then add the example
      // to the last definition instead of creating a new one
      const [definition, isNew] =
        definitions.length > 0 && def.type_ === 'example'
          ? [definitions[definitions.length - 1], false]
          : [new Definition({ id: def.id }), true];

      if (def.elements) {
        for (const element of def.elements) {
          this.transformDefinitionElement(
            articleId,
            dictionary,
            definition,
            element,
          );
        }
      } else {
        this.transformDefinitionElement(articleId, dictionary, definition, def);
      }

      if (isNew) {
        definitions.push(definition);
      }
    }

    return definitions;
  }

  private transformPhrases(article: Article, data: any): Article[] {
    // Phrases are in the definitions array but are 'definition' elements with
    // a single 'sub_article' element in the 'elements' array

    const phrases: Article[] = [];

    for (const element of data?.body?.definitions?.[0]?.elements ?? []) {
      if (element.type_ === 'definition') {
        for (const subElement of element.elements) {
          if (subElement.type_ === 'sub_article') {
            phrases.push({
              id: subElement.article_id,
              dictionary: article.dictionary,
            });
          }
        }
      }
    }

    return phrases;
  }

  private transformRelationships(
    article: Article,
    data: any,
  ): ArticleRelationship[] {
    const relationships: ArticleRelationship[] = [];

    if (!article.definitions?.length) {
      this.transformArticleResponse(article, data);
    }

    const articleIds = new Set<number>();
    articleIds.add(article.id);

    for (const definition of article.definitions ?? []) {
      for (const relationship of definition.relationships ?? []) {
        if (!articleIds.has(relationship.article.id)) {
          relationships.push(relationship);
          articleIds.add(relationship.article.id);
        }
      }

      for (const subDefinition of definition.subDefinitions ?? []) {
        for (const relationship of subDefinition.relationships ?? []) {
          if (!articleIds.has(relationship.article.id)) {
            relationships.push(relationship);
            articleIds.add(relationship.article.id);
          }
        }
      }
    }

    for (const phrase of this.transformPhrases(article, data)) {
      if (!articleIds.has(phrase.id)) {
        relationships.push(new PhraseArticleRelationship(phrase));
        articleIds.add(phrase.id);
      }
    }

    return relationships;
  }

  private transformEtymology(article: Article, data: any): RichContent[] {
    const content: RichContent[] = [];

    for (const element of data?.body?.etymology ?? []) {
      if (
        element.type_ === 'etymology_language' ||
        element.type_ === 'etymology_reference'
      ) {
        content.push(this.formatElement(article.dictionary, element).build());
      }
    }

    return content;
  }

  private async walkArticleGraph(
    articleId: number,
    dictionary: Dictionary,
    depth: number,
    edgeFields: (keyof ArticleGraphEdge)[],
  ): Promise<ArticleGraph> {
    const articleIdSet = new Set<number>();
    const edgeSet = new Set<string>();

    const computeEdgeKey = (edge: ArticleGraphEdge) => {
      // only include the fields that are specified in edgeFields, except for
      // sourceId and targetId, which are always included
      const keyFields = new Set(['sourceId', 'targetId', ...edgeFields]);

      return Object.entries(edge)
        .filter(([key]) => keyFields.has(key))
        .map(([key, value]) => `${key}:${value}`)
        .join('-');
    };

    const graph = new ArticleGraph();

    const addEdge = (edge: ArticleGraphEdge) => {
      const key = computeEdgeKey(edge);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        graph.edges.push(edge);
      }
    };

    const addArticle = async (nodeId: number, currentDepth: number) => {
      if (articleIdSet.has(nodeId)) {
        return;
      }

      articleIdSet.add(nodeId);

      const article = await this.getArticle(nodeId, dictionary);

      if (!article) {
        return;
      }

      graph.nodes.push(article);

      if (currentDepth === depth) {
        return;
      }

      const articleIdsToProcess = new Set<number>();

      // iterate through definitions and add edges

      for (const [
        definitionIndex,
        definition,
      ] of article.definitions?.entries() ?? []) {
        for (const relationship of definition.relationships ?? []) {
          addEdge(
            new ArticleGraphEdge({
              sourceId: article.id,
              targetId: relationship.article.id,
              type: relationship.type,
              sourceDefinitionId: definition.id,
              sourceDefinitionIndex: definitionIndex,
            }),
          );

          articleIdsToProcess.add(relationship.article.id);
        }

        for (const subDefinition of definition.subDefinitions ?? []) {
          for (const relationship of subDefinition.relationships ?? []) {
            addEdge(
              new ArticleGraphEdge({
                sourceId: article.id,
                targetId: relationship.article.id,
                type: relationship.type,
                sourceDefinitionId: definition.id,
                sourceDefinitionIndex: definitionIndex,
              }),
            );

            articleIdsToProcess.add(relationship.article.id);
          }
        }
      }

      // iterate through phrases and add edges

      for (const phrase of await this.getPhrases(article)) {
        addEdge(
          new ArticleGraphEdge({
            sourceId: article.id,
            targetId: phrase.id,
            type: ArticleRelationshipType.Phrase,
          }),
        );

        articleIdsToProcess.add(phrase.id);
      }

      await Promise.all(
        Array.from(articleIdsToProcess).map(async (id) => {
          await addArticle(id, currentDepth + 1);
        }),
      );
    };

    await addArticle(articleId, 0);

    return graph;
  }

  //#endregion
}
