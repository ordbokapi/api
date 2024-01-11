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
} from '../models';
import {
  OrdboekeneApiService,
  OrdboekeneApiSearchType as ApiSearchType,
} from './ordboekene-api.service';

@Injectable()
export class WordService {
  private readonly logger = new Logger(WordService.name);
  constructor(private ordboekeneApiService: OrdboekeneApiService) {}

  private concepts: { [Dictionary: string]: any } = {};

  //#region Public methods

  async getSuggestions(
    word: string,
    dictionaries: Dictionary[],
    searchType?: ApiSearchType,
  ): Promise<Suggestions> {
    this.logger.debug(`Getting suggestions for word: ${word}`);

    const data = await this.ordboekeneApiService.suggest(
      word,
      dictionaries,
      undefined,
      searchType,
    );
    this.logger.debug(`Received suggestions: ${JSON.stringify(data)}`);

    return this.transformSuggestionsResponse(data);
  }

  async getWord(
    word: string,
    dictionaries: Dictionary[],
  ): Promise<Word | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting articles for word: ${word}`);

    const data = await this.ordboekeneApiService.articles(word, dictionaries);

    // Example API response:

    // {"meta": {"bm": {"total": 1}, "nn": {"total": 2}}, "articles": {"bm": [60110], "nn": [77999, 78000]}}

    // or, if not found:

    // {"meta": {"bm": {"total": 0}, "nn": {"total": 0}}, "articles": {"bm": [], "nn": []}}

    const foundDictionaries: Dictionary[] = [];

    if (data.meta.bm?.total) {
      foundDictionaries.push(Dictionary.Bokmaalsordboka);
    }

    if (data.meta.nn?.total) {
      foundDictionaries.push(Dictionary.Nynorskordboka);
    }

    if (foundDictionaries.length === 0) {
      return undefined;
    }

    const wordObject: Word = {
      word,
      dictionaries: foundDictionaries,
      articles: Object.entries(data.articles).flatMap(
        ([dictParam, ids]: [string, number[]]) =>
          ids.map((id: number) => ({
            id,
            dictionary: this.getDictionary(dictParam),
          })),
      ),
    };

    return wordObject;
  }

  async getDefinitions(article: Article): Promise<Definition[]> {
    await this.loadConcepts();

    this.logger.debug(`Getting definitions for article: ${article.id}`);

    const data = await this.ordboekeneApiService.article(
      article.id,
      article.dictionary,
    );

    this.transformArticleResponse(article, data);

    return article.definitions!;
  }

  async getArticle(
    articleId: number,
    dictionary: Dictionary,
  ): Promise<Article> {
    await this.loadConcepts();

    this.logger.debug(`Getting article: ${articleId}`);

    const data = await this.ordboekeneApiService.article(articleId, dictionary);

    const article: Article = {
      id: articleId,
      dictionary,
    };

    this.transformArticleResponse(article, data);

    return article;
  }

  async getWordClass(article: Article): Promise<WordClass | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting word class for article: ${article.id}`);

    const data = await this.ordboekeneApiService.article(
      article.id,
      article.dictionary,
    );

    return this.transformWordClass(data);
  }

  async getLemmas(article: Article): Promise<Lemma[] | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting lemmas for article: ${article.id}`);

    const data = await this.ordboekeneApiService.article(
      article.id,
      article.dictionary,
    );

    return this.transformLemmaInfo(data);
  }

  async getGender(article: Article): Promise<Gender | undefined> {
    await this.loadConcepts();

    this.logger.debug(`Getting gender for article: ${article.id}`);

    const data = await this.ordboekeneApiService.article(
      article.id,
      article.dictionary,
    );

    return this.transformGender(data);
  }

  //#endregion

  //#region Private helper methods

  private getDictParam(dictionary: Dictionary | Dictionary[]): string {
    return Array.isArray(dictionary)
      ? dictionary.map((d) => this.getDictParam(d)).join(',')
      : dictionary === Dictionary.Bokmaalsordboka
        ? 'bm'
        : 'nn';
  }

  private getDictionary(dictParam: string): Dictionary {
    return dictParam === 'bm'
      ? Dictionary.Bokmaalsordboka
      : Dictionary.Nynorskordboka;
  }

  private transformWordClass(article: any): WordClass | undefined {
    const tagMapping: { [key: string]: WordClass } = {
      NOUN: WordClass.Substantiv,
      ADJ: WordClass.Adjektiv,
      ADV: WordClass.Adverb,
      VERB: WordClass.Verb,
      PRON: WordClass.Pronomen,
      ADP: WordClass.Preposisjon,
      CCONJ: WordClass.Konjunksjon,
      INTJ: WordClass.Interjeksjon,
      DET: WordClass.Determinativ,
      SCONJ: WordClass.Subjunksjon,
      SYM: WordClass.Symbol,
      ABBR: WordClass.Forkorting,
    };

    if (article.lemmas && article.lemmas.length > 0) {
      const lemma = article.lemmas[0];
      if (lemma.paradigm_info && lemma.paradigm_info.length > 0) {
        const tags = lemma.paradigm_info[0].tags;
        if (tags && tags.length > 0) {
          const wordClassTag = tags.find((tag: string) => tagMapping[tag]);
          if (!tagMapping[wordClassTag]) {
            this.logger.warn(
              `Fann ikkje ordklasse for ${lemma.lemma} (prøvde å transformera ${tags} til ordklasse)`,
            );
          }
          return wordClassTag && tagMapping[wordClassTag];
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
      [Dictionary.Bokmaalsordboka, Dictionary.Nynorskordboka].map(
        async (dictionary) => {
          if (this.concepts[dictionary]) {
            return;
          }
          this.logger.debug(
            `Requesting concept lookup table from ${dictionary} from API`,
          );
          try {
            this.concepts[dictionary] =
              await this.ordboekeneApiService.concepts(dictionary);
          } catch (error) {
            this.logger.error(
              `Failed to fetch concepts from Ordbøkene API for ${dictionary}.`,
              error,
            );
          }
        },
      ),
    );
  }

  //#endregion

  //#region Data transformation methods

  private formatText(
    dictionary: Dictionary,
    element: {
      content: string;
      items: { type_: string; id: string; [key: string]: any }[];
    },
  ): string {
    // Format the text element
    const segments = element.content.split('$');
    let text = '';

    for (const [i, segment] of segments.entries()) {
      text += segment;
      if (i >= segments.length - 1) {
        continue;
      }

      if (element.items[i].type_ === 'article_ref') {
        const article = element.items[i];
        const lemma = article.lemmas[0].lemma;
        text += lemma;
        continue;
      }

      if (element.items[i].type_ === 'usage') {
        text += element.items[i].text;
        continue;
      }

      if (element.items[i].type_ === 'quote_inset') {
        text += this.formatText(dictionary, element.items[i] as any);
        continue;
      }

      const conceptId = element.items[i].id;
      const concept = this.concepts[dictionary].concepts[conceptId];
      if (concept) {
        text += concept.expansion;
      } else {
        this.logger.warn(
          `Fann ikkje concept ${conceptId} i ${dictionary} (prøvde å formattera ${element.items[i].type_} mens bygde opp teksten ${element.content})`,
        );
        text += '(?)';
      }
    }

    return text;
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

    if (data.body?.definitions?.length) {
      definitions.push(
        ...this.transformDefinitions(
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

  private transformDefinitionElement(
    dictionary: Dictionary,
    definition: Definition,
    element: any,
  ): Definition {
    switch (element.type_) {
      case 'explanation':
        definition.content += this.formatText(dictionary, element);
        break;
      case 'example':
        if (!definition.examples) {
          definition.examples = [];
        }
        definition.examples.push(this.formatText(dictionary, element.quote));
        break;
      case 'definition':
        for (const subElement of element.elements) {
          this.transformDefinitionElement(dictionary, definition, subElement);
        }
        break;
    }

    return definition;
  }

  private transformDefinitions(
    dictionary: Dictionary,
    elements: any[],
  ): Definition[] {
    const definitions: Definition[] = [];

    for (const def of elements) {
      const definition: Definition = {
        id: def.id,
        content: '',
        examples: [],
        subDefinitions: [],
      };

      if (def.elements) {
        for (const element of def.elements) {
          this.transformDefinitionElement(dictionary, definition, element);
        }
      } else {
        this.transformDefinitionElement(dictionary, definition, def);
      }
      definitions.push(definition);
    }

    return definitions;
  }

  //#endregion
}
