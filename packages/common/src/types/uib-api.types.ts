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

/**
 * Dictionaries supported by the UiB API.
 */
export enum UibDictionary {
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
  id: UibDictionary;

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

/**
 * An element in an article that has associated text.
 */
export type ArticleTextElement = {
  content: string | null;
  items: ArticleElement[];
};

/**
 * A literature reference on an article element.
 */
export type ArticleLiteratureReference = {
  code: string;
  bibl_id: number;
  type_: string;
  spec?: { content: string; items: ArticleElement[] } | null;
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
      type_:
        | 'quote_inset'
        | 'explanation'
        | 'etymology_language'
        | 'etymology_reference'
        | 'etymology_lang'
        | 'etymology_ref';
      content: string | null;
      items: ArticleElement[];
      lit_refs?: ArticleLiteratureReference[];
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
      lit_refs?: ArticleLiteratureReference[];
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
    }
  | {
      type_: 'pronunciation_guide';
      content: string | null;
      items: ArticleElement[];
    }
  | {
      type_: 'fraction';
      numerator: string | number;
      denominator: string | number;
    }
  | {
      type_: 'superscript';
      text: string;
    }
  | {
      type_: 'subscript';
      text: string;
    }
  | {
      type_: 'emph';
      text: string;
    };

/**
 * The format of the raw data returned by the UiB API when fetching an article.
 */
export interface RawArticle {
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
}
