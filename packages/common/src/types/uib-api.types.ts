/**
 * Dictionaries supported by the UiB API.
 */
export enum UiBDictionary {
  /** The Bokmål dictionary. */
  Bokmål = 'bm',

  /** The Nynorsk dictionary. */
  Nynorsk = 'nn',

  /** The Norsk dictionary. */
  Norsk = 'no',
}

/**
 * The format of the raw data returned by the UiB API when fetching article
 * metadata.
 */
export type RawArticleMetadata = [
  articleId: number,
  primaryLemma: string,
  revision: number,
  updatedAt: string,
];

/**
 * The format of the raw data returned by the UiB API when fetching the list of
 * articles.
 */
export type RawArticleList = RawArticleMetadata[];

/**
 * The format of the raw data returned by the UiB API when fetching the word
 * class list. Keys are word class IDs and values are word class names.
 */
export type RawWordClassList = Record<WordClass, string>;

/**
 * Word classes.
 */
export enum WordClass {
  Forkorting = 'ABBR',
  Adjektiv = 'ADJ',
  Preposisjon = 'ADP',
  Adverb = 'ADV',
  Konjunksjon = 'CCONJ',
  ISammensetting = 'COMPPFX',
  Determinativ = 'DET',
  Tallord = 'DET_Q',
  Uttrykk = 'EXPR',
  Infinitivsmerke = 'INFM',
  Interjeksjon = 'INTJ',
  Substantiv = 'NOUN',
  Prefiks = 'PFX',
  Pronomen = 'PRON',
  Egennavn = 'PROPN',
  Subjunksjon = 'SCONJ',
  Suffiks = 'SFX',
  Symbol = 'SYM',
  Ukjent = 'UNKN',
  Verb = 'VERB',
  Verbstem = 'VSTEM',
}

/**
 * The format of the raw data returned by the UiB API when fetching the word
 * subclass list. Keys are word subclass IDs and values are word subclass
 * descriptions.
 */
export type RawWordSubclassList = Record<WordSubclass, string>;

/**
 * Word subclasses.
 */
export enum WordSubclass {
  Forkorting = 'ABBR',
  AdjektivAdverbtype = 'ADJ_adv',
  AdjektivUlikMF = 'ADJ_masc_fem',
  AdjektivMascFemFem = 'ADJ_masc/fem_fem',
  Adjektiv = 'ADJ_regular',
  Preposisjon = 'ADP',
  Adverb = 'ADV',
  AdverbAdjektivtype = 'ADV_adj',
  Konjunksjon = 'CCONJ',
  ISammensetting = 'COMPPFX',
  DeterminativAdj = 'DET_adj',
  Tallord = 'DET_Q',
  Determinativ = 'DET_regular',
  DeterminativEnkel = 'DET_simple',
  Uttrykk = 'EXPR',
  Infinitivsmerke = 'INFM',
  Interjeksjon = 'INTJ',
  SubstantivSvHokj = 'NOUN_reg_fem',
  Substantiv = 'NOUN_regular',
  SubstantivUbøy = 'NOUN_uninfl',
  Prefiks = 'PFX',
  PronomenNormal = 'PRON_regular',
  PronomenEnkel = 'PRON_simple',
  Egennavn = 'PROPN',
  Subjunksjon = 'SCONJ',
  Suffiks = 'SFX',
  Symbol = 'SYM',
  Ukjent = 'UNKN',
  VerbNormal = 'VERB_regular',
  VerbStVerb = 'VERB_sPass',
  VerbUbøy = 'VERB_uninfl',
  VerbStem = 'VSTEM',
}

/**
 * Concept classes.
 */
export enum ConceptClass {
  Språk = 'language',
  Grammatikk = 'grammar',
  Retorikk = 'rhetoric',
  Relasjon = 'relation',
  Domene = 'domain',
  Temporal = 'temporal',
  Eining = 'entity',
}

/**
 * The format of the raw data returned by the UiB API when fetching the concept
 * table for a given dictionary.
 */
export type RawConceptTable = {
  /** The ID of the dictionary the concept table is for. */
  id: UiBDictionary;

  /** The name of the dictionary the concept table is for. */
  name: string;

  concepts: {
    [conceptId: string]: {
      /** The class of the concept. */
      class: ConceptClass | null;

      /** The description of the concept. */
      expansion: string;
    };
  };
};

/*
Sample article JSON:
{"article_id": 100431, "submitted": "2023-05-12 13:26:20", "suggest": ["skule", "skole"], "lemmas": [{"hgno": 1, "id": 1082941, "inflection_class": "m1", "lemma": "skule", "paradigm_info": [{"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "skule"}, {"tags": ["Sing", "Def"], "word_form": "skulen"}, {"tags": ["Plur", "Ind"], "word_form": "skular"}, {"tags": ["Plur", "Def"], "word_form": "skulane"}], "inflection_group": "NOUN_regular", "paradigm_id": 2230, "standardisation": "STANDARD", "tags": ["NOUN", "Masc"], "to": null}], "split_inf": false}, {"hgno": 1, "id": 1082940, "inflection_class": "m1", "lemma": "skole", "paradigm_info": [{"from": "1996-01-01", "inflection": [{"tags": ["Sing", "Ind"], "word_form": "skole"}, {"tags": ["Sing", "Def"], "word_form": "skolen"}, {"tags": ["Plur", "Ind"], "word_form": "skolar"}, {"tags": ["Plur", "Def"], "word_form": "skolane"}], "inflection_group": "NOUN_regular", "paradigm_id": 2230, "standardisation": "STANDARD", "tags": ["NOUN", "Masc"], "to": null}], "split_inf": false}], "body": {"etymology": [{"type_": "etymology_reference", "content": "$ $ i $", "items": [{"type_": "entity", "id": "norr."}, {"type_": "usage", "items": [], "text": "skóli, skúli"}, {"type_": "usage", "items": [], "text": "skúlameistari"}]}, {"type_": "etymology_reference", "content": "$ $ $ $", "items": [{"type_": "entity", "id": "gj"}, {"type_": "entity", "id": "g.eng."}, {"type_": "usage", "items": [], "text": "scol"}, {"type_": "entity", "id": "f"}]}, {"type_": "etymology_reference", "content": "$ $ $", "items": [{"type_": "entity", "id": "el"}, {"type_": "entity", "id": "l.ty."}, {"type_": "usage", "items": [], "text": "schole"}]}, {"type_": "etymology_reference", "content": "$ $ $ (som $-en i $ kanskje kjem av) opphavleg frå $ $ ‘fritid, kvild frå kroppsarbeid, sysselsetjing med lærdomsøvingar’", "items": [{"type_": "entity", "id": "e"}, {"type_": "entity", "id": "nederl."}, {"type_": "usage", "items": [], "text": "scoele"}, {"type_": "usage", "items": [], "text": "u"}, {"type_": "usage", "items": [], "text": "I skule"}, {"type_": "entity", "id": "gr"}, {"type_": "usage", "items": [], "text": "skhole"}]}], "definitions": [{"type_": "definition", "elements": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "(institusjon som driv regelbunden) opplæring, undervisning", "items": []}, {"type_": "example", "quote": {"content": "$ byrjar kring 20. august", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "arbeide i $", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "drive som lærar", "items": []}}, {"type_": "example", "quote": {"content": "den vidaregåande $", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}, {"type_": "sub_article", "article_id": 110535, "lemmas": ["halde skule"], "article": {"type_": "article", "article_id": 110535, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1154997, "lemma": "halde skule"}], "body": {"pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "gje undervisning", "items": []}], "id": 2}]}, "article_type": "SUB_ARTICLE", "author": "153", "dict_id": "nn", "frontpage": false, "latest_status": 8, "owner": "12", "properties": {"edit_state": "Eksisterende"}, "version": 2, "word_class": "EXPR"}, "intro": {"content": "", "items": []}, "status": null}, {"type_": "sub_article", "article_id": 117034, "lemmas": ["ein hard skule"], "article": {"type_": "article", "article_id": 117034, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1153488, "lemma": "ein hard skule"}], "body": {"pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "ein nådelaus og vond røyndom", "items": []}, {"type_": "example", "quote": {"content": "gå, lære i ein hard skule", "items": []}, "explanation": {"content": "", "items": []}}], "id": 2}]}, "article_type": "SUB_ARTICLE", "author": "28", "dict_id": "nn", "frontpage": false, "latest_status": 8, "owner": "12", "properties": {"edit_state": "Eksisterende"}, "version": 2, "word_class": "EXPR"}, "intro": {"content": "", "items": []}, "status": null}, {"type_": "compound_list", "elements": [{"type_": "article_ref", "article_id": 10923, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1013236, "lemma": "danseskule"}, {"type_": "lemma", "hgno": 0, "id": 1013235, "lemma": "danseskole"}]}, {"type_": "article_ref", "article_id": 19865, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1023778, "lemma": "folkeskule"}, {"type_": "lemma", "hgno": 0, "id": 1023777, "lemma": "folkeskole"}]}, {"type_": "article_ref", "article_id": 27221, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1032945, "lemma": "grunnskule"}, {"type_": "lemma", "hgno": 0, "id": 1032944, "lemma": "grunnskole"}]}, {"type_": "article_ref", "article_id": 32619, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1039553, "lemma": "høgskule"}, {"type_": "lemma", "hgno": 0, "id": 1039552, "lemma": "høgskole"}]}, {"type_": "article_ref", "article_id": 41970, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1050908, "lemma": "krigsskule"}, {"type_": "lemma", "hgno": 0, "id": 1050907, "lemma": "krigsskole"}]}, {"type_": "article_ref", "article_id": 68209, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1082880, "lemma": "skogskule"}, {"type_": "lemma", "hgno": 0, "id": 1082879, "lemma": "skogskole"}]}, {"type_": "article_ref", "article_id": 77922, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1095109, "lemma": "teikneskole"}, {"type_": "lemma", "hgno": 0, "id": 1095110, "lemma": "teikneskule"}]}], "intro": {"content": "òg i $ som", "items": [{"type_": "entity", "id": "sms"}]}}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "$", "items": [{"type_": "article_ref", "article_id": 47366, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1058008, "lemma": "lærebok"}], "definition_id": null}]}, {"type_": "example", "quote": {"content": "$ i gitarspel", "items": [{"type_": "usage", "items": [], "text": "skule"}]}, "explanation": {"content": "", "items": []}}], "id": 3, "sub_definition": true}], "id": 2, "sub_definition": false}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "bygning der ein held $", "items": [{"type_": "article_ref", "article_id": 100431, "lemmas": [{"type_": "lemma", "hgno": 1, "id": 1082941, "lemma": "skule"}, {"type_": "lemma", "hgno": 1, "id": 1082940, "lemma": "skole"}], "definition_id": 2, "definition_order": 1}]}, {"type_": "example", "quote": {"content": "byggje ny $", "items": [{"type_": "usage", "items": [], "text": "skule"}]}, "explanation": {"content": "", "items": []}}, {"type_": "example", "quote": {"content": "ha lang veg til $", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}], "id": 6, "sub_definition": false}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "elevar og lærarar ved ein $", "items": [{"type_": "article_ref", "article_id": 100431, "lemmas": [{"type_": "lemma", "hgno": 1, "id": 1082941, "lemma": "skule"}, {"type_": "lemma", "hgno": 1, "id": 1082940, "lemma": "skole"}], "definition_id": 6, "definition_order": 2}]}, {"type_": "example", "quote": {"content": "heile $ hadde fri i går", "items": [{"type_": "usage", "items": [], "text": "skulen"}]}, "explanation": {"content": "", "items": []}}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "$", "items": [{"type_": "article_ref", "article_id": 47349, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1057988, "lemma": "lærar"}], "definition_id": null}]}, {"type_": "example", "quote": {"content": "$ kjem borti vegen", "items": [{"type_": "usage", "items": [], "text": "skolen"}]}, "explanation": {"content": "", "items": []}}], "id": 4, "sub_definition": true}], "id": 7, "sub_definition": false}, {"type_": "definition", "elements": [{"type_": "explanation", "content": "krins, retning innanfor eit (fag)område, særleg vitskap og kunst", "items": []}, {"type_": "example", "quote": {"content": "ei bok som danna $", "items": [{"type_": "usage", "items": [], "text": "skule"}]}, "explanation": {"content": "", "items": []}}, {"type_": "sub_article", "article_id": 110536, "lemmas": ["av den gamle skulen"], "article": {"type_": "article", "article_id": 110536, "lemmas": [{"type_": "lemma", "hgno": 0, "id": 1150293, "lemma": "av den gamle skulen"}], "body": {"pronunciation": [], "definitions": [{"type_": "definition", "elements": [{"type_": "explanation", "content": "med ei meir gammaldags haldning", "items": []}], "id": 2}]}, "article_type": "SUB_ARTICLE", "author": "153", "dict_id": "nn", "frontpage": false, "latest_status": 8, "owner": "12", "properties": {"edit_state": "Eksisterende"}, "version": 2, "word_class": "EXPR"}, "intro": {"content": "", "items": []}, "status": null}], "id": 8, "sub_definition": false}], "id": 5, "sub_definition": false}]}, "to_index": ["skulen", "skulen", "skulen", "skule", "skule", "skulen", "skulen", "skolen", "skule", "skóli, skúli", "skúlameistari", "scol", "schole", "scoele", "u", "I skule", "skhole"]}
*/

/**
 * An element in an article that has associated text.
 */
export type ArticleTextElement = {
  content: string | null;
  items: ArticleElement[];
};

/**
 * An element in an article.
 */
export type ArticleElement =
  | {
      type_:
        | 'domain'
        | 'entity'
        | 'grammar'
        | 'language'
        | 'relation'
        | 'rhetoric'
        | 'temporal';
      id: string;
    }
  | {
      type_: 'usage';
      items: [];
      text: string;
    }
  | {
      type_: 'quote_inset' | 'explanation' | 'etymology_language';
      content: string | null;
      items: ArticleElement[];
    }
  | {
      type_: 'definition';
      elements?: ArticleElement[];
      id: number;
      sub_definition: boolean;
    }
  | {
      type_: 'example';
      quote: ArticleTextElement;
      explanation: ArticleTextElement;
    }
  | {
      type_: 'compound_list';
      elements: ArticleElement[];
      intro: ArticleTextElement;
    }
  | {
      type_: 'article_ref';
      article_id: number;
      lemmas: {
        type_: 'lemma';
        hgno: number;
        id: number;
        lemma: string;
      }[];
      definition_id: number;
      definition_order: number;
    }
  | {
      type_: 'sub_article';
      article_id: number;
      lemmas: string[];
      article: {
        type_: 'article';
        article_id: number;
        lemmas: {
          type_: 'lemma';
          hgno: number;
          id: number;
          lemma: string;
        }[];
        body: {
          pronunciation: ArticleElement[];
          definitions: ArticleElement[];
        };
        article_type: string;
        author: string;
        dict_id: string;
        frontpage: boolean;
        latest_status: number;
        owner: string;
        properties: {
          edit_state: string;
        };
        version: number;
        word_class: string;
      };
      intro: {
        content: string | null;
        items: ArticleElement[];
      };
      status: null | string;
    };

/**
 * The format of the raw data returned by the UiB API when fetching an article.
 */
export type RawArticle = {
  article_id: number;
  submitted?: string;
  suggest: string[];
  lemmas: {
    hgno: number;
    id: number;
    inflection_class: string;
    lemma: string;
    paradigm_info: {
      from: string;
      inflection: {
        tags: string[];
        word_form: string;
      }[];
      inflection_group: string;
      paradigm_id: number;
      standardisation: string;
      tags: string[];
      to: null;
    }[];
    split_inf: boolean;
  }[];
  body: {
    etymology: ArticleElement[];
    definitions: ArticleElement[];
  };
  to_index: string[];
};
