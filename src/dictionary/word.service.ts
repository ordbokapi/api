import { Injectable } from '@nestjs/common';
import { Word } from './models/word.model';
import { Dictionary } from './models/dictionary.model';
import { Definition } from './models/definition.model';
import { Article } from './models/article.model';

@Injectable()
export class WordService {
  private concepts: { [Dictionary: string]: any } = {};

  //#region Public methods

  async getSuggestions(
    word: string,
    dictionaries: Dictionary[],
  ): Promise<Word[]> {
    const searchUrl = new URL('https://ord.uib.no/api/suggest');
    searchUrl.searchParams.set('q', word);
    searchUrl.searchParams.set('n', '10'); // Adjust 'n' as needed for the number of suggestions
    searchUrl.searchParams.set('dict', this.getDictParam(dictionaries));
    searchUrl.searchParams.set('include', 'ef');

    const response = await fetch(searchUrl.toString());
    const data = await response.json();
    return this.transformSuggestionsResponse(data);
  }

  async getWord(
    word: string,
    dictionaries: Dictionary[],
    fetchDefinitions = false,
  ): Promise<Word> {
    await this.loadConcepts();

    const articlesUrl = new URL('https://ord.uib.no/api/articles');
    articlesUrl.searchParams.set('w', word);
    articlesUrl.searchParams.set('dict', this.getDictParam(dictionaries));
    articlesUrl.searchParams.set('scope', 'e');

    // Example API response:

    // {"meta": {"bm": {"total": 1}, "nn": {"total": 2}}, "articles": {"bm": [60110], "nn": [77999, 78000]}}

    // or, if not found:

    // {"meta": {"bm": {"total": 0}, "nn": {"total": 0}}, "articles": {"bm": [], "nn": []}}

    const response = await fetch(articlesUrl.toString());
    const data = await response.json();

    console.dir(data, { depth: null });

    if (data.meta.bm.total === 0 && data.meta.nn.total === 0) {
      throw new Error('Word not found');
    }

    const foundDictionaries: Dictionary[] = [];

    if (data.meta.bm.total > 0) {
      foundDictionaries.push(Dictionary.Bokmaalsordboka);
    }

    if (data.meta.nn.total > 0) {
      foundDictionaries.push(Dictionary.Nynorskordboka);
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

    if (fetchDefinitions) {
      for (const article of wordObject.articles!) {
        article.definitions = await this.getDefinitions(article);
      }
    }

    console.dir(wordObject, { depth: null });

    return wordObject;
  }

  async getDefinitions(article: Article): Promise<Definition[]> {
    await this.loadConcepts();

    const data = await this.fetchArticleDetails(article.id, article.dictionary);

    this.transformArticleResponse(article, data);

    // Return the definitions
    return article.definitions!;
  }

  //#endregion

  //#region Private helper methods

  private async loadConcepts() {
    if (!this.concepts[Dictionary.Bokmaalsordboka]) {
      this.concepts[Dictionary.Bokmaalsordboka] = await fetch(
        'https://ord.uib.no/bm/concepts.json',
      ).then((res) => res.json());
    }

    if (!this.concepts[Dictionary.Nynorskordboka]) {
      this.concepts[Dictionary.Nynorskordboka] = await fetch(
        'https://ord.uib.no/nn/concepts.json',
      ).then((res) => res.json());
    }
  }

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

  private async fetchArticleDetails(
    articleId: number,
    dictionary: Dictionary,
  ): Promise<any> {
    await this.loadConcepts();

    const articleUrl = new URL(
      `https://ord.uib.no/${this.getDictParam(
        dictionary,
      )}/article/${articleId}.json`,
    );
    const response = await fetch(articleUrl.toString());
    const data = await response.json();
    return data;
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

      const conceptId = element.items[i].id;
      const concept = this.concepts[dictionary].concepts[conceptId];
      if (concept) {
        text += concept.expansion;
      } else {
        console.error(`Fann ikkje concept ${conceptId} i ${dictionary}`);
        text += '(?)';
      }
    }

    return text;
  }

  private transformSuggestionsResponse(data: any): Word[] {
    // Transform the response into an array of Word models

    // Example API response:
    // {"q": "tekst", "cnt": 8, "cmatch": 1, "a": {"exact": [["tekst", ["bm", "nn"]], ["teksta", ["nn"]]], "inflect": [["tekste", ["bm", "nn"]], ["takast", ["nn"]]], "freetext": [["tekst", ["bm", "nn"]], ["teksta", ["nn"]]], "similar": [["tekst-TV", ["bm"]], ["tekst-tv", ["bm"]]]}}

    const words: Word[] = [];

    for (const word of data.a.exact) {
      words.push({
        word: word[0],
        dictionaries: word[1].map((d: string) => this.getDictionary(d)),
      });
    }

    return words;
  }

  private transformArticleResponse(article: Article, data: any): Article {
    const definitions: Definition[] = [];

    // Example API response:

    // {"article_id": 60110, "submitted": "2022-02-24 01:09:09.459492", "suggest": ["tekst"], "lemmas": [{"final_lexeme": "tekst", "hgno": 0, "id": 68771, "inflection_class": "m1, f1", "initial_lexeme": "", "junction": "", "lemma": "tekst", "neg_junction": null, "paradigm_info": [{"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "tekst"}, {"tags": ["Sing", "Def"], "word_form": "teksten"}, {"tags": ["Plur", "Ind"], "word_form": "tekster"}, {"tags": ["Plur", "Def"], "word_form": "tekstene"}], "inflection_group": "NOUN_regular", "paradigm_id": 564, "standardisation": "STANDARD", "tags": ["NOUN", "Masc"], "to": null}, {"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "tekst"}, {"tags": ["Sing", "Def"], "word_form": "teksta"}, {"tags": ["Plur", "Ind"], "word_form": "tekster"}, {"tags": ["Plur", "Def"], "word_form": "tekstene"}], "inflection_group": "NOUN_regular", "paradigm_id": 760, "standardisation": "STANDARD", "tags": ["NOUN", "Fem"], "to": null}], "split_inf": null}], "body": {"pronunciation": [], "etymology": [{"type_": "etymology_language", "content": "$ $", "items": [{"type_": "language", "id": "norr."}, {"type_": "usage", "text": "textr, texti"}]}, {"type_": "etymology_language", "content": "fra $ $ ‘sammenføyning, vev’", "items": [{"type_": "language", "id": "lat."}, {"type_": "usage", "text": "textus"}]}], "definitions": [{"type_": "definition", "elements": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "trykte $ skrevne ord satt sammen til en fortelling, skildring $, tekstutsnitt", "items": [{"type_": "relation", "id": "el"}, {"type_": "entity", "id": "e_l"}]}, {"type_": "example", "quote": {"content": "$ er uleselig flere steder", "items": [{"type_": "usage", "text": "teksten"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "en bok med mange bilder og lite $", "items": [{"type_": "usage", "text": "tekst"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "kommentere en $ fra Gammelnorsk homiliebok", "items": [{"type_": "usage", "text": "tekst"}]}, "explanation": {"content": "", "items": []}}], "id": 2}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "ordene i en sang $ opera", "items": [{"type_": "relation", "id": "el"}]}, {"type_": "example", "quote": {"content": "både $ og melodi var av Alf Prøysen", "items": [{"type_": "usage", "text": "tekst"}]}, "explanation": {"content": "", "items": []}}], "id": 4}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "bibelord (som utgangspunkt for en preken)", "items": []}, {"type_": "example", "quote": {"content": "$ i dag er hentet fra evangeliet etter Johannes", "items": [{"type_": "usage", "text": "teksten"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "holde seg til $", "items": [{"type_": "usage", "text": "teksten"}]}, "explanation": {"content": "emnet, saken", "items": []}}, {"type_": "sub_article", "article_id": 105762, "lemmas": ["lese en teksten"], "article": {"body": {"type_": "article", "lemmas": [{"final_lexeme": "lese en teksten", "hgno": 0, "id": 1147315, "inflection_class": null, "initial_lexeme": "", "junction": "", "lemma": "lese en teksten", "neg_junction": null, "paradigm_info": [{"from": "2019-01-01", "inflection": [], "inflection_group": "EXPR", "paradigm_id": 2470, "standardisation": "REGISTERED", "tags": ["EXPR"], "to": null}], "split_inf": false}], "pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "irettesette noen", "items": []}], "id": 2}], "homographs": [0], "word_class": null, "word_forms": ["lese en teksten"]}}, "intro": {"content": "", "items": []}}], "id": 5}], "id": 3}]}, "to_index": ["teksten", "tekst", "tekst", "tekst", "teksten", "teksten", "textr, texti", "textus"]}

    // console.dir(data, { depth: null });

    if (data.body && data.body.definitions) {
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

    console.dir(article, { depth: null });

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
        // if (!definition.subDefinitions) {
        //   definition.subDefinitions = [];
        // }
        // definition.subDefinitions.push(
        //   ...this.transformDefinitions(dictionary, element.elements),
        // );

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
        dictionary,
        wordClass: def.word_class,
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
