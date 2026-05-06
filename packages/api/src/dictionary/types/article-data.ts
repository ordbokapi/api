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
 * Schema inferred from all article documents in the database.
 */
export type ArticleData = BmArticle | NnArticle | NoArticle;

/**
 * Raw article data for the bm dictionary.
 */
export interface BmArticle {
  body: {
    definitions: {
      id: number;
      type_: 'definition';
      elements?: {
        id?: number;
        type_:
          | 'compound_list'
          | 'definition'
          | 'example'
          | 'explanation'
          | 'sub_article';
        elements?: {
          items?: {
            type_:
              | 'article_ref'
              | 'domain'
              | 'entity'
              | 'fraction'
              | 'grammar'
              | 'language'
              | 'relation'
              | 'rhetoric'
              | 'superscript'
              | 'temporal'
              | 'usage';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
              markdown_lemma?: string;
            }[];
            word_form?: string;
            article_id?: number;
            definition_id?: number | null;
            text?: string;
            definition_order?: number;
            id?: string;
            numerator?: string | number;
            denominator?: string | number;
            items?: never[];
          }[];
          type_:
            | 'article_ref'
            | 'compound_list'
            | 'definition'
            | 'example'
            | 'explanation'
            | 'sub_article';
          content?: string;
          quote?: {
            items: {
              text?: string;
              type_:
                | 'entity'
                | 'fraction'
                | 'quote_inset'
                | 'relation'
                | 'subscript'
                | 'superscript'
                | 'usage';
              items?: {
                id: 'el' | 'f_eks';
                type_: 'entity' | 'relation';
              }[];
              id?: 'dvs' | 'el' | 'gj' | 'pga';
              content?: string;
              numerator?: number | string;
              denominator?: number | string;
            }[];
            content: string;
          };
          explanation?: {
            items: {
              id?:
                | 'bl_a'
                | 'dvs'
                | 'e_l'
                | 'el'
                | 'f_eks'
                | 'gl'
                | 'lat'
                | 'ty';
              type_:
                | 'article_ref'
                | 'entity'
                | 'language'
                | 'relation'
                | 'temporal'
                | 'usage';
              text?: string;
              items?: never[];
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
              }[];
              article_id?: number;
              definition_id?: number | null;
              definition_order?: number;
            }[];
            content: string;
          };
          intro?: {
            items: {
              id: 'f_eks' | 'refl' | 'sms_er' | 'uttr_t';
              type_: 'entity' | 'grammar' | 'relation';
            }[];
            content: string;
          };
          lemmas?: (
            | string
            | {
                id?: number;
                hgno?: number;
                lemma?: string;
                type_?: 'lemma';
                markdown_lemma?: string;
              }
          )[];
          article?: {
            body: {
              definitions: {
                id: number;
                type_: 'definition';
                elements: {
                  items?: {
                    type_:
                      | 'article_ref'
                      | 'domain'
                      | 'entity'
                      | 'fraction'
                      | 'grammar'
                      | 'language'
                      | 'relation'
                      | 'rhetoric'
                      | 'superscript'
                      | 'temporal'
                      | 'usage';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    article_id?: number;
                    definition_id?: number | null;
                    id?:
                      | 'bl_a'
                      | 'bot'
                      | 'e_l'
                      | 'el'
                      | 'el_l'
                      | 'eng'
                      | 'f_eks'
                      | 'fl'
                      | 'fork'
                      | 'gl'
                      | 'i_jus'
                      | 'it'
                      | 'jf'
                      | 'mat'
                      | 'mots'
                      | 'o_l'
                      | 'opphl'
                      | 'osv'
                      | 'overf'
                      | 'pga'
                      | 'saerl'
                      | 'spraakv'
                      | 'sv'
                      | 't_forsk_f'
                      | 't_forskj_fra'
                      | 'trol'
                      | 'ty'
                      | 'utr';
                    definition_order?: number;
                    text?: string;
                    word_form?: string;
                    items?: never[];
                    numerator?: string;
                    denominator?: string;
                  }[];
                  type_: 'definition' | 'example' | 'explanation';
                  content?: string;
                  quote?: {
                    items: {
                      text: string;
                      type_: 'subscript' | 'usage';
                      items?: never[];
                    }[];
                    content: string;
                  };
                  explanation?: {
                    items: never[];
                    content: string;
                  };
                  id?: number;
                  elements?: {
                    items?: {
                      type_:
                        | 'article_ref'
                        | 'domain'
                        | 'entity'
                        | 'language'
                        | 'relation'
                        | 'rhetoric'
                        | 'usage';
                      lemmas?: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                      }[];
                      article_id?: number;
                      definition_id?: number | null;
                      id?:
                        | 'e_l'
                        | 'el'
                        | 'eng'
                        | 'f_eks'
                        | 'i_idr'
                        | 'iron'
                        | 'jf'
                        | 'o_l'
                        | 'overf'
                        | 't_forsk_f';
                      definition_order?: number;
                      text?: string;
                      word_form?: string;
                      items?: never[];
                    }[];
                    type_: 'example' | 'explanation';
                    content?: string;
                    quote?: {
                      items?: {
                        text: string;
                        items?: never[];
                        type_: 'usage';
                      }[];
                      content: string;
                    };
                    explanation?: {
                      items: never[];
                      content: string;
                    };
                    attest?: never[];
                    tydingstekst?: {
                      items: never[];
                      content: string;
                    };
                  }[];
                  attest?: never[];
                  sub_definition?: boolean;
                  usage?: {
                    id: number;
                    usage?: never | null;
                  }[];
                  tydingstekst?: {
                    items: never[];
                    content: string;
                  };
                }[];
                sub_definition?: boolean;
              }[];
              pronunciation?: never[];
            };
            owner: string;
            type_: 'article';
            author: string;
            lemmas: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            batches?: never[];
            dict_id: 'BM' | 'bm';
            updated?: never | null;
            version: number;
            pub_flag?: never | null;
            frontpage: boolean;
            article_id: number;
            properties?: {
              edit_state?: 'Eksisterende' | 'Ny';
              batch?: number | string;
            } | null;
            word_class?: string | null;
            article_type: 'SUB_ARTICLE';
            latest_status: number;
            referenced_by: {
              hgno: number;
              art_id: number;
              word_form: string;
            }[];
            mo_article_ids?: never[];
            no_lemmas?: never[];
            a_h_id?: never | null;
          };
          article_id?: number;
          id?: number;
          elements?: {
            items?: {
              id?:
                | 'adj'
                | 'adv'
                | 'el'
                | 'foreld'
                | 'forst'
                | 'gen'
                | 'gl'
                | 'i_gramm'
                | 'iron'
                | 'jf'
                | 'o_l'
                | 'overf'
                | 'pf_pt'
                | 'pr_pt'
                | 'prep'
                | 'pron'
                | 'refl'
                | 's_adj'
                | 's_adv'
                | 's_subst'
                | 'sms_er'
                | 'spoekt'
                | 'subj'
                | 'subst'
                | 'upers'
                | 'uttr';
              type_:
                | 'article_ref'
                | 'domain'
                | 'entity'
                | 'grammar'
                | 'relation'
                | 'rhetoric'
                | 'temporal'
                | 'usage';
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
              }[];
              article_id?: number;
              definition_id?: number | null;
              definition_order?: number;
              text?: string;
            }[];
            type_: 'article_ref' | 'example' | 'explanation';
            content?: string;
            quote?: {
              items: {
                text?: string;
                type_: 'quote_inset' | 'usage';
                items?: {
                  id: 'el';
                  type_: 'relation';
                }[];
                content?: string;
              }[];
              content: string;
            };
            explanation?: {
              items: {
                type_: 'article_ref';
                lemmas: {
                  id: number;
                  hgno: number;
                  lemma: string;
                  type_: 'lemma';
                }[];
                article_id: number;
                definition_id: number;
                definition_order: number;
              }[];
              content: string;
            };
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
              markdown_lemma?: string;
            }[];
            article_id?: number;
            attest?: never[];
            tydingstekst?: {
              items: never[];
              content: string;
            };
          }[];
          sub_definition?: boolean;
          attest?: never[];
          status?: string | null;
          tydingstekst?: {
            items: never[];
            content: string;
          };
          usage?: {
            id: number;
            usage?: never | null;
          }[];
        }[];
        items?: {
          type_:
            | 'article_ref'
            | 'domain'
            | 'entity'
            | 'fraction'
            | 'grammar'
            | 'language'
            | 'relation'
            | 'rhetoric'
            | 'subscript'
            | 'superscript'
            | 'temporal'
            | 'usage';
          lemmas?: {
            id?: number;
            hgno?: number;
            lemma: string;
            type_?: 'lemma';
            markdown_lemma?: string;
            annotated_lemma?: {
              items: {
                text: string;
                type_: 'subscript';
              }[];
              type_: 'lemma';
              content: string;
            };
          }[];
          article_id?: number;
          definition_id?: number | null;
          id?: string;
          definition_order?: number;
          text?: string;
          items?: {
            text: string;
            items?: never[];
            type_: 'subscript' | 'superscript';
          }[];
          word_form?: string;
          numerator?: number | string;
          denominator?: number | string;
          content?: never[];
        }[];
        content?: string;
        quote?: {
          items: {
            text?: string;
            type_:
              | 'article_ref'
              | 'entity'
              | 'fraction'
              | 'quote_inset'
              | 'relation'
              | 'subscript'
              | 'superscript'
              | 'usage';
            items?: {
              id: 'el' | 'overf';
              type_: 'relation' | 'rhetoric';
            }[];
            id?: 'el' | 'jf' | 'kg';
            numerator?: number | string;
            denominator?: number | string;
            content?: string;
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            article_id?: number;
          }[];
          content: string;
        };
        explanation?: {
          items: {
            text?: string;
            type_:
              | 'article_ref'
              | 'entity'
              | 'fraction'
              | 'language'
              | 'relation'
              | 'rhetoric'
              | 'usage';
            id?: 'e_l' | 'el' | 'jf' | 'overf' | 'ty';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            article_id?: number;
            definition_id?: never | null;
            numerator?: number;
            denominator?: number;
          }[];
          content: string;
        };
        attest?: never[];
        intro?: {
          items: {
            id: 'f_eks' | 'i_forb' | 'uttr';
            type_: 'entity' | 'relation';
          }[];
          content: string;
        };
        lemmas?: string[];
        article?: {
          body: {
            definitions: {
              id: number;
              type_: 'definition';
              elements: {
                items?: {
                  type_:
                    | 'article_ref'
                    | 'domain'
                    | 'entity'
                    | 'grammar'
                    | 'language'
                    | 'relation'
                    | 'rhetoric'
                    | 'superscript'
                    | 'temporal'
                    | 'usage';
                  lemmas?: {
                    id: number;
                    hgno: number;
                    lemma: string;
                    type_: 'lemma';
                  }[];
                  article_id?: number;
                  definition_id?: number | null;
                  word_form?: string;
                  definition_order?: number;
                  id?:
                    | 'bl_a'
                    | 'e'
                    | 'e_l'
                    | 'eg'
                    | 'el'
                    | 'el_l'
                    | 'eng'
                    | 'f_eks'
                    | 'fl'
                    | 'forh'
                    | 'fork'
                    | 'gl'
                    | 'i_bibl'
                    | 'i_jus'
                    | 'i_mus'
                    | 'jf'
                    | 'jur'
                    | 'lty'
                    | 'mat'
                    | 'mots'
                    | 'o_a'
                    | 'o_l'
                    | 'overf'
                    | 'p_g_a'
                    | 'pga'
                    | 'saerl'
                    | 'spoekt'
                    | 'spraakv'
                    | 't_forsk_f'
                    | 't_forskj_fra';
                  text?: string;
                  items?: never[];
                }[];
                type_: 'definition' | 'example' | 'explanation';
                content?: string;
                quote?: {
                  items: {
                    text?: string;
                    type_: 'entity' | 'usage';
                    items?: never[];
                    id?: 'el';
                  }[];
                  content: string;
                };
                explanation?: {
                  items: never[];
                  content: string;
                };
                id?: number;
                elements?: {
                  items?: {
                    type_:
                      | 'article_ref'
                      | 'entity'
                      | 'relation'
                      | 'rhetoric'
                      | 'usage';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    word_form?: string;
                    article_id?: number;
                    definition_id?: number | null;
                    id?: 'e_l' | 'el' | 'jf' | 'overf' | 'pga';
                    definition_order?: number;
                    text?: string;
                    items?: never[];
                  }[];
                  type_: 'example' | 'explanation';
                  attest?: never[];
                  content?: string;
                  quote?: {
                    items: {
                      text: string;
                      type_: 'usage';
                      items?: never[];
                    }[];
                    content: string;
                  };
                  explanation?: {
                    items: never[];
                    content: string;
                  };
                }[];
                sub_definition?: boolean;
                attest?: never[];
                tydingstekst?: {
                  items: never[];
                  content: string;
                };
              }[];
              sub_definition?: boolean;
            }[];
            pronunciation?: never[];
          };
          owner: string;
          type_: 'article';
          author: string;
          lemmas: {
            id: number;
            hgno: number;
            lemma: string;
            type_: 'lemma';
          }[];
          dict_id: 'BM' | 'bm';
          updated?: never | null;
          version: number;
          frontpage: boolean;
          article_id: number;
          properties?: {
            edit_state?: 'Eksisterende' | 'Ny';
            batch?: string | number;
            comments?: {
              date: string;
              text: string;
              user: number;
            }[];
          } | null;
          word_class: string;
          article_type: 'SUB_ARTICLE';
          latest_status: number;
          referenced_by: {
            hgno: number;
            art_id: number;
            word_form: string;
          }[];
          batches?: never[];
          pub_flag?: never | null;
          mo_article_ids?: never[];
          no_lemmas?: never[];
          a_h_id?: never | null;
        };
        article_id?: number;
        sub_definition?: boolean;
        status?: string | null;
        xrefs?: {
          type_: 'article_ref';
          inline: number;
          lemmas: {
            id: number;
            hgno: number;
            lemma: string;
            type_: 'lemma';
          }[];
          article_id: number;
          definition_id?: never | null;
        }[];
        tydingstekst?: {
          items: never[];
          content: string;
        };
        list_type?: string;
        usage?: {
          id?: number;
          usage?: never | null;
        }[];
      }[];
      sub_definition?: boolean;
    }[];
    pronunciation?: {
      items: {
        items?: {
          id: 'fl';
          type_: 'grammar';
        }[];
        type_:
          | 'entity'
          | 'grammar'
          | 'pronunciation_guide'
          | 'relation'
          | 'usage';
        content?: string;
        id?: 'el' | 'fl' | 'ty.' | 'ub' | 'utt';
        text?: string;
      }[];
      type_: 'pronunciation';
      content: string;
    }[];
    etymology?: {
      items: {
        id?: string;
        type_:
          | 'article_ref'
          | 'domain'
          | 'entity'
          | 'fraction'
          | 'grammar'
          | 'language'
          | 'relation'
          | 'temporal'
          | 'usage';
        lemmas?: {
          id?: number;
          hgno: number;
          lemma: string;
          type_?: 'lemma';
          markdown_lemma?: string;
          annotated_lemma?: {
            items: {
              text: string;
              type_: 'subscript';
            }[];
            type_: 'lemma';
            content: string;
          };
        }[];
        article_id?: number;
        definition_id?: number | null;
        text?: string;
        items?: {
          id: 'amp';
          type_: 'entity';
        }[];
        definition_order?: number;
        numerator?: string;
        denominator?: string;
        word_form?: string;
      }[];
      type_: 'etymology_language' | 'etymology_litt' | 'etymology_reference';
      content: string;
    }[];
  };
  author?: string;
  lemmas: {
    id: number;
    hgno: number;
    lemma: string;
    mo_link?: number;
    split_inf?: boolean | null;
    added_norm?: boolean;
    is_standard?: boolean;
    final_lexeme?: string;
    stress_vowel?: number;
    paradigm_info: {
      to?: never | null;
      from: string;
      tags: string[];
      inflection: {
        tags: string[];
        word_form?: string | null;
        markdown_word_form?: string | null;
      }[];
      paradigm_id: number;
      standardisation: 'REGISTERED' | 'STANDARD';
      inflection_group:
        | 'ABBR'
        | 'ADJ_masc/fem_fem'
        | 'ADJ_regular'
        | 'ADP'
        | 'ADV'
        | 'ADV_adj'
        | 'CCONJ'
        | 'COMPPFX'
        | 'DET_adj'
        | 'DET_regular'
        | 'DET_simple'
        | 'EXPR'
        | 'INTJ'
        | 'NOUN_regular'
        | 'NOUN_uninfl'
        | 'PFX'
        | 'PRON_regular'
        | 'PRON_simple'
        | 'PROPN'
        | 'SCONJ'
        | 'SYM'
        | 'VERB_regular'
        | 'VERB_sPass'
        | 'VERB_uninfl';
    }[];
    inflection_class?: string | null;
    junction?: string;
    initial_lexeme?: string;
    markdown_lemma?: string;
    annotated_lemma?: {
      items?: {
        text: string;
        type_: 'subscript' | 'superscript';
      }[];
      type_?: 'lemma';
      content?: string;
    } | null;
    neg_junction?: string | null;
  }[];
  status?: number;
  updated?: string;
  referers?: {
    hgno?: number | null;
    lemma?: string | null;
    article_id: number;
  }[];
  submitted?: string;
  article_id: number;
  edit_state?:
    | (
        | 'Eksisterende'
        | 'Ferdig'
        | 'Foreslått skjult'
        | 'Foreslått utgått'
        | 'Ny'
        | 'På vent'
        | 'Tom'
        | 'Ured'
        | 'Utgått'
        | 'Utjamning'
      )
    | null;
  mo_article_ids?: (number | null)[];
  suggest?: string[];
  to_index?: string[];
  a_h_id?: never | null;
}
/**
 * Raw article data for the nn dictionary.
 */
export interface NnArticle {
  body: {
    definitions: {
      id?: number | null;
      type_: 'definition';
      elements?: {
        id?: number;
        type_:
          | 'compound_list'
          | 'definition'
          | 'example'
          | 'explanation'
          | 'sub_article';
        elements?: {
          items?: {
            type_:
              | 'article_ref'
              | 'domain'
              | 'entity'
              | 'fraction'
              | 'grammar'
              | 'language'
              | 'relation'
              | 'rhetoric'
              | 'superscript'
              | 'temporal'
              | 'usage';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
              markdown_lemma?: string;
            }[];
            word_form?: string;
            article_id?: number;
            definition_id?: number | null;
            text?: string;
            definition_order?: number;
            id?: string;
            items?: never[];
            numerator?: number | string;
            denominator?: number | string;
          }[];
          type_:
            | 'article_ref'
            | 'compound_list'
            | 'definition'
            | 'example'
            | 'explanation'
            | 'sub_article';
          content?: string;
          quote?: {
            items: {
              text?: string;
              items?: {
                id: 'el';
                type_: 'relation';
              }[];
              type_:
                | 'entity'
                | 'fraction'
                | 'quote_inset'
                | 'subscript'
                | 'superscript'
                | 'usage';
              content?: string;
              id?: 'el' | 'gj' | 'pga';
              numerator?: number | string;
              denominator?: string | number;
            }[];
            content: string;
          };
          explanation?: {
            items: {
              id?: 'jf' | 'o_l' | 't_d';
              type_:
                | 'article_ref'
                | 'entity'
                | 'fraction'
                | 'relation'
                | 'usage';
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
              }[];
              article_id?: number;
              definition_id?: number | null;
              definition_order?: number;
              numerator?: number;
              denominator?: number;
              text?: string;
            }[];
            content: string;
          };
          intro?: {
            items: {
              id: 'refl' | 'sms' | 't_d' | 'utr';
              type_: 'entity' | 'grammar' | 'relation';
            }[];
            content: string;
          };
          lemmas?: (
            | string
            | {
                id?: number;
                hgno?: number;
                lemma?: string;
                type_?: 'lemma';
                markdown_lemma?: string;
              }
          )[];
          article?: {
            body: {
              definitions: {
                id: number;
                type_: 'definition';
                elements: {
                  items?: {
                    type_:
                      | 'article_ref'
                      | 'domain'
                      | 'entity'
                      | 'fraction'
                      | 'language'
                      | 'relation'
                      | 'rhetoric'
                      | 'superscript'
                      | 'temporal'
                      | 'usage';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    article_id?: number;
                    definition_id?: number | null;
                    id?:
                      | 'astron'
                      | 'bot'
                      | 'e_l'
                      | 'el'
                      | 'eldre'
                      | 'forh'
                      | 'fork_a'
                      | 'fork_ing'
                      | 'fys'
                      | 'jf'
                      | 'jur'
                      | 'mots'
                      | 'myt'
                      | 'o_l'
                      | 'opph'
                      | 'osv'
                      | 'overf'
                      | 'pga'
                      | 'saerl'
                      | 'spraakv'
                      | 'subst'
                      | 't_d'
                      | 't_skiln'
                      | 'ty'
                      | 'utr';
                    definition_order?: number;
                    text?: string;
                    word_form?: string;
                    items?: never[];
                    numerator?: string;
                    denominator?: string;
                  }[];
                  type_: 'definition' | 'example' | 'explanation';
                  content?: string;
                  quote?: {
                    items: {
                      text: string;
                      type_: 'subscript' | 'usage';
                      items?: never[];
                    }[];
                    content: string;
                  };
                  explanation?: {
                    items: never[];
                    content: string;
                  };
                  attest?: never[];
                  id?: number;
                  elements?: {
                    items?: {
                      type_:
                        | 'article_ref'
                        | 'domain'
                        | 'entity'
                        | 'language'
                        | 'relation'
                        | 'rhetoric'
                        | 'superscript'
                        | 'temporal'
                        | 'usage';
                      lemmas?: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                      }[];
                      article_id?: number;
                      definition_id?: number | null;
                      definition_order?: number;
                      id?:
                        | 'e_l'
                        | 'el'
                        | 'eldre'
                        | 'eng'
                        | 'forh'
                        | 'fork_a'
                        | 'gr'
                        | 'idr'
                        | 'iron'
                        | 'jf'
                        | 'myt'
                        | 'o_l'
                        | 'overf'
                        | 'saerl'
                        | 't_d'
                        | 't_skiln';
                      text?: string;
                      word_form?: string;
                      items?: never[];
                    }[];
                    type_: 'example' | 'explanation';
                    content?: string;
                    quote?: {
                      items: {
                        text: string;
                        type_: 'usage';
                        items?: never[];
                      }[];
                      content: string;
                    };
                    explanation?: {
                      items: never[];
                      content: string;
                    };
                    attest?: never[];
                  }[];
                  sub_definition?: boolean;
                  tydingstekst?: {
                    items: never[];
                    content: string;
                  };
                }[];
                sub_definition?: boolean;
              }[];
              pronunciation?: never[];
            };
            owner: string;
            type_: 'article';
            author: string;
            lemmas: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            dict_id: 'NN' | 'nn';
            updated?: never | null;
            version: number;
            frontpage: boolean;
            article_id: number;
            properties?: {
              edit_state?:
                | 'Eksisterende'
                | 'Foreslått utgått'
                | 'Ny'
                | 'Utgått';
              batch?: string | number;
            } | null;
            word_class?: string | null;
            article_type: 'SUB_ARTICLE';
            latest_status: number;
            referenced_by?: {
              hgno: number;
              art_id: number;
              word_form: string;
            }[];
            batches?: never[];
            pub_flag?: never | null;
            mo_article_ids?: never[];
            no_lemmas?: never[];
            a_h_id?: never | null;
          };
          article_id?: number;
          attest?: never[];
          id?: number;
          elements?: {
            items?: {
              id?:
                | 'adj'
                | 'adv'
                | 'e_l'
                | 'el'
                | 'forst'
                | 'gen'
                | 'gramm'
                | 'jf'
                | 'kol'
                | 'o_l'
                | 'overf'
                | 'pf_pt'
                | 'pr_pt'
                | 'prep'
                | 'pron'
                | 'refl'
                | 'saerl'
                | 'skjemt'
                | 'spraakv'
                | 'subj'
                | 'subs_isk'
                | 'subst'
                | 'upers'
                | 'utr';
              type_:
                | 'article_ref'
                | 'domain'
                | 'entity'
                | 'grammar'
                | 'relation'
                | 'rhetoric'
                | 'usage';
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
              }[];
              article_id?: number;
              definition_id?: number | null;
              definition_order?: number;
              text?: string;
            }[];
            type_: 'article_ref' | 'example' | 'explanation';
            attest?: never[];
            content?: string;
            quote?: {
              items: {
                text?: string;
                type_: 'quote_inset' | 'usage';
                items?: never[];
                content?: string;
              }[];
              content: string;
            };
            explanation?: {
              items: {
                id?: 'jf';
                type_: 'article_ref' | 'relation' | 'usage';
                lemmas?: {
                  id: number;
                  hgno: number;
                  lemma: string;
                  type_: 'lemma';
                }[];
                article_id?: number;
                definition_id?: number;
                definition_order?: number;
                text?: string;
              }[];
              content: string;
            };
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
              markdown_lemma?: string;
            }[];
            article_id?: number;
            tydingstekst?: {
              items: never[];
              content: string;
            };
          }[];
          sub_definition?: boolean;
          status?: string | null;
          tydingstekst?: {
            items: never[];
            content: string;
          };
          usage?: {
            usage?: never | null;
          }[];
        }[];
        sub_definition?: boolean;
        items?: {
          type_:
            | 'article_ref'
            | 'domain'
            | 'entity'
            | 'fraction'
            | 'grammar'
            | 'language'
            | 'relation'
            | 'rhetoric'
            | 'subscript'
            | 'superscript'
            | 'temporal'
            | 'usage';
          lemmas?: {
            id?: number;
            hgno?: number;
            lemma: string;
            type_?: 'lemma';
            markdown_lemma?: string;
            annotated_lemma?: {
              items: {
                text: string;
                type_: 'subscript';
              }[];
              type_: 'lemma';
              content: string;
            };
          }[];
          article_id?: number;
          definition_id?: number | null;
          id?: string;
          definition_order?: number;
          text?: string;
          items?: {
            text: string;
            items?: never[];
            type_: 'subscript' | 'superscript';
          }[];
          word_form?: string;
          numerator?: number | string;
          denominator?: number | string;
          content?: never[];
        }[];
        content?: string;
        quote?: {
          items: {
            text?: string;
            type_:
              | 'entity'
              | 'fraction'
              | 'quote_inset'
              | 'relation'
              | 'subscript'
              | 'superscript'
              | 'usage';
            items?: never[];
            content?: string;
            id?: 'el' | 'pga' | 't_d';
            numerator?: number | string;
            denominator?: number | string;
          }[];
          content: string;
        };
        explanation?: {
          items: {
            text?: string;
            type_: 'article_ref' | 'entity' | 'fraction' | 'relation' | 'usage';
            id?: 'jf' | 'o_l' | 't_d';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            article_id?: number;
            definition_id?: number | null;
            numerator?: number;
            denominator?: number;
            definition_order?: number;
          }[];
          content: string;
        };
        attest?: never[];
        intro?: {
          items: {
            id: 't_d';
            type_: 'entity';
          }[];
          content: string;
        };
        lemmas?: string[];
        article?: {
          body: {
            definitions: {
              id?: number | null;
              type_: 'definition';
              elements: {
                items?: {
                  type_:
                    | 'article_ref'
                    | 'domain'
                    | 'entity'
                    | 'grammar'
                    | 'relation'
                    | 'rhetoric'
                    | 'superscript'
                    | 'usage';
                  lemmas?: {
                    id?: number;
                    hgno: number;
                    lemma: string;
                    type_?: 'lemma';
                  }[];
                  word_form?: string;
                  article_id?: number;
                  definition_id?: number | null;
                  definition_order?: number;
                  id?:
                    | 'adv'
                    | 'e_l'
                    | 'el'
                    | 'fork_a'
                    | 'gramm'
                    | 'jf'
                    | 'jur'
                    | 'mots'
                    | 'mus'
                    | 'o_l'
                    | 'overf'
                    | 'pga'
                    | 'refl'
                    | 'skjemt'
                    | 'spraakv'
                    | 't_d'
                    | 't_skiln'
                    | 'utr'
                    | 'vha';
                  text?: string;
                  items?: never[];
                }[];
                type_: 'definition' | 'example' | 'explanation';
                content?: string;
                quote?: {
                  items: {
                    text?: string;
                    type_: 'quote_inset' | 'usage';
                    items?: never[];
                    content?: string;
                  }[];
                  content: string;
                };
                explanation?: {
                  items: never[];
                  content: string;
                };
                id?: number;
                elements?: {
                  items?: {
                    type_: 'article_ref' | 'entity' | 'relation' | 'rhetoric';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    article_id?: number;
                    definition_id?: number | null;
                    id?: 'e_l' | 'el' | 'jf' | 'o_l' | 'overf' | 'vha';
                    word_form?: string;
                    definition_order?: number;
                  }[];
                  type_: 'example' | 'explanation';
                  attest?: never[];
                  content?: string;
                  quote?: {
                    items: {
                      text: string;
                      type_: 'usage';
                      items?: never[];
                    }[];
                    content: string;
                  };
                  explanation?: {
                    items: never[];
                    content: string;
                  };
                }[];
                sub_definition?: boolean;
                attest?: never[];
                status?: string;
                tydingstekst?: {
                  items: never[];
                  content: string;
                };
              }[];
              sub_definition?: boolean;
            }[];
            pronunciation?: never[];
            type_?: 'article';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              junction: string;
              split_inf: boolean;
              final_lexeme: string;
              neg_junction?: never | null;
              paradigm_info: {
                to?: never | null;
                from: string;
                tags: string[];
                inflection: never[];
                paradigm_id: number;
                standardisation: 'REGISTERED';
                inflection_group: 'EXPR';
              }[];
              initial_lexeme: string;
              inflection_class?: never | null;
            }[];
            homographs?: number[];
            word_class?: never | null;
            word_forms?: string[];
          };
          owner?: string;
          type_?: 'article';
          author?: string;
          lemmas?: {
            id: number;
            hgno: number;
            lemma: string;
            type_: 'lemma';
          }[];
          dict_id?: 'NN' | 'nn';
          updated?: never | null;
          version?: number;
          frontpage?: boolean;
          article_id?: number;
          properties?: {
            edit_state?: 'Eksisterende' | 'Foreslått utgått' | 'Ny' | 'Utgått';
            batch?: number | string;
          } | null;
          word_class?: string;
          article_type?: 'SUB_ARTICLE';
          latest_status?: number;
          referenced_by?: {
            hgno: number;
            art_id: number;
            word_form: string;
          }[];
          batches?: never[];
          pub_flag?: never | null;
          mo_article_ids?: never[];
          no_lemmas?: never[];
          a_h_id?: never | null;
        };
        article_id?: number;
        status?: string | null;
        tydingstekst?: {
          items: never[];
          content: string;
        };
        list_type?: string;
        xrefs?: {
          type_: 'article_ref';
          lemmas: {
            id: number;
            hgno: number;
            lemma: string;
            type_: 'lemma';
          }[];
          article_id: number;
          definition_id?: never | null;
          inline?: number;
        }[];
        usage?: {
          usage?: never | null;
        }[];
      }[];
      sub_definition?: boolean;
      status?: string;
    }[];
    pronunciation?: {
      items: {
        items?: {
          id: 'fl';
          type_: 'grammar';
        }[];
        type_: 'entity' | 'grammar' | 'pronunciation_guide' | 'usage';
        content?: string;
        id?: 'el' | 'fl';
        text?: string;
      }[];
      type_: 'pronunciation';
      content: string;
    }[];
    etymology?: {
      items: {
        id?: string;
        type_:
          | 'article_ref'
          | 'entity'
          | 'fraction'
          | 'grammar'
          | 'language'
          | 'relation'
          | 'rhetoric'
          | 'temporal'
          | 'usage';
        lemmas?: {
          id?: number;
          hgno: number;
          lemma: string;
          type_?: 'lemma';
          markdown_lemma?: string;
          annotated_lemma?: {
            items: {
              text: string;
              type_: 'subscript';
            }[];
            type_: 'lemma';
            content: string;
          };
        }[];
        article_id?: number;
        definition_id?: number | null;
        text?: string;
        items?: {
          id: 'amp';
          type_: 'entity';
        }[];
        definition_order?: number;
        word_form?: string;
        numerator?: string;
        denominator?: string;
      }[];
      type_: 'etymology_language' | 'etymology_litt' | 'etymology_reference';
      content: string;
    }[];
  };
  author?: string;
  lemmas: {
    id: number;
    hgno: number;
    lemma: string;
    split_inf?: boolean | null;
    added_norm?: boolean;
    final_lexeme?: string;
    paradigm_info: {
      to?: string | null;
      from: string;
      tags: string[];
      inflection: {
        tags: string[];
        word_form?: string | null;
        markdown_word_form?: string | null;
      }[];
      paradigm_id: number;
      standardisation: 'REGISTERED' | 'STANDARD';
      inflection_group:
        | 'ABBR'
        | 'ADJ_masc_fem'
        | 'ADJ_regular'
        | 'ADP'
        | 'ADV'
        | 'ADV_adj'
        | 'CCONJ'
        | 'COMPPFX'
        | 'DET_adj'
        | 'DET_regular'
        | 'DET_simple'
        | 'EXPR'
        | 'INTJ'
        | 'NOUN_reg_fem'
        | 'NOUN_regular'
        | 'NOUN_uninfl'
        | 'PFX'
        | 'PRON_regular'
        | 'PROPN'
        | 'SCONJ'
        | 'SYM'
        | 'VERB_regular'
        | 'VERB_sPass';
    }[];
    inflection_class?: string | null;
    mo_link?: number;
    stress_vowel?: number;
    is_standard?: boolean;
    junction?: string;
    initial_lexeme?: string;
    neg_junction?: string | null;
    markdown_lemma?: string;
    annotated_lemma?: {
      items?: {
        text: string;
        type_: 'subscript' | 'superscript';
      }[];
      type_?: 'lemma';
      content?: string;
    } | null;
  }[];
  status?: number;
  suggest?: string[];
  updated?: string;
  referers?: {
    hgno?: number | null;
    lemma?: string | null;
    article_id: number;
  }[];
  to_index?: string[];
  submitted?: string;
  article_id: number;
  edit_state?:
    | (
        | 'Eksisterende'
        | 'Ferdig'
        | 'Foreslått skjult'
        | 'Foreslått utgått'
        | 'Ny'
        | 'På vent'
        | 'Tom'
        | 'Ured'
        | 'Utgått'
        | 'Utjamning'
      )
    | null;
  mo_article_ids?: (number | null)[];
  a_h_id?: never | null;
}
/**
 * Raw article data for the no dictionary.
 */
export interface NoArticle {
  body: {
    definitions: {
      id?: number;
      type_: 'definition';
      elements?: {
        items?: {
          type_:
            | 'article_ref'
            | 'entity'
            | 'fraction'
            | 'quote_inset'
            | 'superscript'
            | 'usage';
          lemmas?: {
            id?: number;
            hgno?: number;
            lemma: string;
            type_?: 'lemma';
            markdown_lemma?: string;
          }[];
          article_id?: number;
          definition_id?: number;
          definition_order?: number[] | number;
          text?: string;
          id?:
            | 'd_e'
            | 'd_s'
            | 'dvs'
            | 'el-l'
            | 'el_l'
            | 'm_a'
            | 'm_m'
            | 'm_oms_t'
            | 'o-l'
            | 'o_a'
            | 'o_l'
            | 'p-g-a'
            | 'p_g_a'
            | 's_d'
            | 'svar._t'
            | 't-skiln'
            | 't_d'
            | 't_skiln';
          word_form?: string;
          items?: {
            type_: 'article_ref' | 'superscript';
            lemmas?: never[];
            article_id?: number;
            text?: string;
            items?: never[];
            content?: never[];
          }[];
          content?: never[];
          numerator?: string;
          denominator?: string;
        }[];
        type_:
          | 'compound_list'
          | 'definition'
          | 'example'
          | 'explanation'
          | 'sub_article';
        attest?: {
          id: number;
          type_: 'attestation';
          ref_id: number;
          ref_title: string;
          ref_target: string;
        }[];
        content?: string | null;
        place_refs?: {
          id?: string | number;
          vis?: number;
          auto: number | boolean;
          code?: string | null;
          place?: {
            type_?: 'place';
            place_id: number;
            place_name: string;
            place_type:
              | 'del av fylke'
              | 'del av landsdel'
              | 'del av landskap'
              | 'fylke'
              | 'kommune'
              | 'land'
              | 'landsdel'
              | 'landskap'
              | 'region'
              | 'tvillingkommune';
            place_order?: number;
            municipality_nr?: number | null;
            parent_place_id?: number;
            place_name_full?: string;
            weight_threshold?: number;
          };
          type_: 'meaning_place';
          attest?:
            | {
                type_: 'attestation';
                ref_id: number;
                ref_title: string;
                ref_target: string;
              }[]
            | null;
          bibl_id?: number | null;
          place_id?: number | null;
          place_name: string;
          _formatertKode?: string;
          spec?:
            | string
            | {
                items?: {
                  text?: string;
                  type_: 'entity' | 'superscript' | 'usage';
                  items?: never[];
                  content?: never[];
                  id?: 'o_a';
                }[];
                content?: string;
              }
            | null;
          show?: boolean | never[];
          _code?: never | null;
          place_name_full?: never[];
        }[];
        id?: number;
        elements?: {
          items?: {
            type_:
              | 'article_ref'
              | 'entity'
              | 'fraction'
              | 'quote_inset'
              | 'superscript'
              | 'usage';
            lemmas?: {
              id?: number;
              hgno?: number;
              lemma: string;
              type_: 'lemma';
              markdown_lemma?: string;
            }[];
            article_id?: number;
            definition_id?: number;
            definition_order?: number[] | number;
            text?: string;
            id?:
              | 'el-l'
              | 'el_l'
              | 'm_a'
              | 'm_m'
              | 'm_oms_t'
              | 'o-a'
              | 'o-l'
              | 'o_a'
              | 'o_l'
              | 'p-g-a'
              | 'p_g_a'
              | 'svar._t'
              | 't-d'
              | 't-skiln'
              | 't_d'
              | 't_skiln';
            items?: {
              type_: 'article_ref' | 'entity';
              lemmas?: never[];
              article_id?: number;
              id?: 'amp';
            }[];
            word_form?: string;
            content?: never[];
            numerator?: string;
            denominator?: string;
          }[];
          type_:
            | 'article_ref'
            | 'compound_list'
            | 'definition'
            | 'example'
            | 'explanation'
            | 'sub_article';
          attest?: {
            id: number;
            type_: 'attestation';
            ref_id: number;
            ref_title?: string;
            ref_target: string;
          }[];
          content?: string | null;
          xrefs?: {
            intro?:
              | string
              | {
                  items?: {
                    id?: 'svar._t' | 't_d' | 't_skiln';
                    type_: 'entity' | 'usage';
                    text?: string;
                  }[];
                  content?: string;
                };
            type_: 'article_ref';
            inline: number;
            lemmas: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
              markdown_lemma?: string;
              annotated_lemma?: string;
            }[];
            article_id: number;
            definition_id?: number;
            definition_order?: number[] | number;
            coda?:
              | {
                  items?: {
                    text?: string;
                    type_: 'entity' | 'usage';
                    id?: 't_d';
                  }[];
                  content?: string;
                }
              | string;
          }[];
          place_refs?: {
            id?: string | number;
            vis?: number;
            auto: number | boolean;
            spec?:
              | string
              | {
                  items?: {
                    text?: string;
                    type_: 'entity' | 'usage';
                    id?: 'o_a';
                  }[];
                  content?: string;
                }
              | null;
            place?: {
              type_?: 'place';
              place_id: number;
              place_name: string;
              place_type:
                | 'del av fylke'
                | 'del av landsdel'
                | 'del av landskap'
                | 'fylke'
                | 'kommune'
                | 'land'
                | 'landsdel'
                | 'landskap'
                | 'region'
                | 'tvillingkommune';
              place_order?: number;
              municipality_nr?: number;
              parent_place_id?: number;
              place_name_full?: string;
              weight_threshold?: number;
            };
            type_: 'meaning_place';
            attest?:
              | {
                  type_: 'attestation';
                  ref_id: number;
                  ref_title: string;
                  ref_target: string;
                }[]
              | null;
            place_id?: number | null;
            place_name: string;
            code?: string | null;
            bibl_id?: number | null;
            _formatertKode?: string;
            show?: boolean;
            place_name_full?: never[];
            _code?: never | null;
          }[];
          quote?: {
            items: {
              text?: string;
              type_:
                | 'entity'
                | 'fraction'
                | 'quote_inset'
                | 'subscript'
                | 'superscript'
                | 'usage';
              items?: {
                id?: 'd-e' | 'el_l' | 'm_m' | 'o-l' | 'o_l' | 'p-g-a' | 't-d';
                type_: 'entity' | 'superscript';
                text?: string;
                items?: never[];
                content?: never[];
              }[];
              content?: string | never[];
              numerator?: string;
              denominator?: string;
              id?: 'amp' | 'o_l' | 't_d';
            }[];
            content: string | never[];
          };
          lit_refs?: {
            code: string;
            spec?: {
              items?: {
                text: string;
                type_: 'quote_inset' | 'usage';
                items?: never[];
                content?: never[];
              }[];
              content?: string;
            } | null;
            intro?:
              | string
              | {
                  items?: {
                    id: 't_d';
                    type_: 'entity';
                  }[];
                  content?: string;
                }
              | null;
            type_: 'meaning_lit';
            attest?:
              | {
                  type_: 'attestation' | 'meaning_lit_attest';
                  ref_id: number;
                  ref_title?: string;
                  ref_target: string;
                }[]
              | null;
            bibl_id?: number | null;
            id?: number;
            kode?: never | null;
          }[];
          explanation?: {
            items: {
              id?:
                | 'd_s'
                | 'el_l'
                | 'm_a'
                | 'm_m'
                | 'm_oms_t'
                | 'o_a'
                | 'o_l'
                | 'p_g_a'
                | 's_d'
                | 't_d';
              type_: 'article_ref' | 'entity' | 'superscript' | 'usage';
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
              }[];
              article_id?: number;
              definition_id?: number;
              definition_order?: number[];
              text?: string;
              items?: never[];
              content?: never[];
            }[];
            content: string;
          };
          id?: number;
          elements?: {
            items?: {
              id?:
                | 'el-l'
                | 'el_l'
                | 'm_a'
                | 'm_m'
                | 'm_oms_t'
                | 'o-l'
                | 'o_a'
                | 'o_l'
                | 'p-g-a'
                | 'p_g_a'
                | 's_d'
                | 'svar._t'
                | 't-d'
                | 't-skiln'
                | 't_d'
                | 't_skiln';
              type_:
                | 'article_ref'
                | 'entity'
                | 'quote_inset'
                | 'superscript'
                | 'usage';
              text?: string;
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
                markdown_lemma?: string;
              }[];
              article_id?: number;
              definition_id?: number;
              definition_order?: number[] | number;
              word_form?: string;
              items?: never[];
              content?: never[];
            }[];
            type_:
              | 'article_ref'
              | 'compound_list'
              | 'definition'
              | 'example'
              | 'explanation'
              | 'sub_article';
            attest?: {
              id: number;
              type_: 'attestation';
              ref_id: number;
              ref_title?: string;
              ref_target: string;
            }[];
            content?: string | null;
            quote?: {
              items: {
                text?: string;
                type_:
                  | 'entity'
                  | 'fraction'
                  | 'quote_inset'
                  | 'subscript'
                  | 'superscript'
                  | 'usage';
                id?: 'amp' | 'o_l' | 't_d';
                items?: {
                  id?:
                    | 'd_e'
                    | 'dvs'
                    | 'el-l'
                    | 'el_l'
                    | 'm_a'
                    | 'o-a'
                    | 'o-l'
                    | 'o_a'
                    | 'o_l'
                    | 'p-g-a'
                    | 't-d'
                    | 't_d';
                  type_: 'entity' | 'subscript' | 'superscript';
                  text?: string;
                  items?: never[];
                  content?: never[];
                }[];
                content?: never[] | string;
                numerator?: string;
                denominator?: string;
              }[];
              content: string | never[];
            };
            place_refs?: {
              id?: string | number;
              vis?: number;
              auto: number | boolean;
              spec?:
                | string
                | {
                    items?: {
                      text?: string;
                      type_: 'entity' | 'usage';
                      id?: 'o_a';
                    }[];
                    content?: string;
                  }
                | null;
              place?: {
                type_?: 'place';
                place_id: number;
                place_name: string;
                place_type:
                  | 'del av fylke'
                  | 'del av landsdel'
                  | 'del av landskap'
                  | 'fylke'
                  | 'kommune'
                  | 'land'
                  | 'landsdel'
                  | 'landskap'
                  | 'region'
                  | 'tvillingkommune';
                place_order?: number;
                municipality_nr?: number;
                parent_place_id?: number;
                place_name_full?: string;
                weight_threshold?: number;
              };
              type_: 'meaning_place';
              attest?:
                | {
                    type_: 'attestation' | 'meaning_place_attest';
                    ref_id: number;
                    ref_title?: string;
                    ref_target: string;
                  }[]
                | null;
              place_id?: number | null;
              place_name: string;
              code?: string | null;
              bibl_id?: number | null;
              _formatertKode?: string;
              show?: boolean;
              place_name_full?: never[];
              _code?: never | null;
            }[];
            explanation?: {
              items: {
                type_: 'article_ref' | 'entity' | 'superscript' | 'usage';
                lemmas?: {
                  id: number;
                  hgno: number;
                  lemma: string;
                  type_: 'lemma';
                }[];
                article_id?: number;
                definition_id?: number;
                definition_order?: number[];
                id?:
                  | 'd_e'
                  | 'd_s'
                  | 'el_l'
                  | 'o_a'
                  | 'o_l'
                  | 'p_g_a'
                  | 't-d'
                  | 't_d'
                  | 't_skiln';
                text?: string;
                items?: never[];
                content?: never[];
              }[];
              content: string;
            };
            lit_refs?: {
              code: string;
              spec?: {
                items?: {
                  text: string;
                  type_: 'quote_inset' | 'superscript' | 'usage';
                  items?: never[];
                  content?: never[];
                }[];
                content?: string;
              } | null;
              intro?:
                | string
                | {
                    items?: {
                      id: 'm_a' | 't_d';
                      type_: 'entity';
                    }[];
                    content?: string;
                  }
                | null;
              type_: 'meaning_lit';
              attest?:
                | {
                    type_: 'attestation' | 'meaning_lit_attest';
                    ref_id: number;
                    ref_title?: string;
                    ref_target: string;
                  }[]
                | null;
              bibl_id?: number | null;
              id?: number;
              kode?: never | null;
            }[];
            editorial_exp?: {
              items: {
                type_: 'article_ref' | 'entity' | 'superscript' | 'usage';
                lemmas?: {
                  id: number;
                  hgno: number;
                  lemma: string;
                  type_: 'lemma';
                }[];
                article_id?: number;
                text?: string;
                word_form?: string;
                items?: never[];
                content?: never[];
                definition_id?: number;
                definition_order?: number[];
                id?: 'd_s' | 'el_l' | 'o_l' | 'p_g_a' | 't_d' | 't_skiln';
              }[];
              content: string;
            };
            lemmas?: (
              | {
                  id?: number;
                  hgno?: number;
                  lemma?: string;
                  type_?: 'lemma';
                  markdown_lemma?: string;
                }
              | string
            )[];
            article_id?: number;
            intro?: {
              items: {
                id?: 'm_a' | 't_d';
                type_: 'entity' | 'usage';
                text?: string;
              }[];
              content: string;
            };
            article?: {
              body: {
                definitions: {
                  id?: number;
                  type_: 'definition';
                  elements?: {
                    items?: {
                      text?: string;
                      type_: 'article_ref' | 'entity' | 'superscript' | 'usage';
                      lemmas?: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                        markdown_lemma?: string;
                      }[];
                      article_id?: number;
                      definition_id?: number;
                      definition_order?: number[] | number;
                      id?:
                        | 'd_s'
                        | 'el_l'
                        | 'm_m'
                        | 'o-l'
                        | 'o_a'
                        | 'o_l'
                        | 'p_g_a'
                        | 's_d'
                        | 't_d';
                      word_form?: string;
                      items?: never[];
                      content?: never[];
                    }[];
                    type_: 'definition' | 'example' | 'explanation';
                    xrefs?: {
                      intro?:
                        | string
                        | {
                            items?: {
                              text: string;
                              type_: 'usage';
                            }[];
                            content?: string;
                          };
                      type_: 'article_ref';
                      inline: number;
                      lemmas: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                        markdown_lemma?: string;
                      }[];
                      article_id: number;
                      definition_id?: number;
                      definition_order?: number[] | number;
                      coda?:
                        | string
                        | {
                            items?: never[];
                            content?: string;
                          };
                    }[];
                    attest?: {
                      id: number;
                      type_: 'attestation';
                      ref_id: number;
                      ref_title: string;
                      ref_target: string;
                    }[];
                    content?: string | null;
                    quote?: {
                      items?: {
                        text: string;
                        type_: 'usage';
                        items?: {
                          id: 'el-l';
                          type_: 'entity';
                        }[];
                      }[];
                      content: string | never[];
                    };
                    explanation?: {
                      items: {
                        id: 'd_s' | 'p_g_a' | 't_d';
                        type_: 'entity';
                      }[];
                      content: string;
                    };
                    id?: number;
                    elements?: {
                      items?: {
                        text?: string;
                        type_: 'article_ref' | 'entity' | 'usage';
                        lemmas?: {
                          id: number;
                          hgno: number;
                          lemma: string;
                          type_: 'lemma';
                        }[];
                        article_id?: number;
                        definition_id?: number;
                        definition_order?: number[] | number;
                        id?:
                          | 'el_l'
                          | 'm_a'
                          | 'm_m'
                          | 'o_a'
                          | 'o_l'
                          | 'p_g_a'
                          | 'svar._t'
                          | 't_d';
                        word_form?: string;
                        items?: {
                          id: 'amp';
                          type_: 'entity';
                        }[];
                      }[];
                      type_: 'definition' | 'example' | 'explanation';
                      attest?: {
                        id: number;
                        type_: 'attestation';
                        ref_id: number;
                        ref_title: string;
                        ref_target: string;
                      }[];
                      content?: string | null;
                      quote?: {
                        items: {
                          text?: string;
                          type_: 'entity' | 'usage';
                          items?: {
                            text?: string;
                            items?: never[];
                            type_: 'entity' | 'superscript';
                            content?: never[];
                            id?: 'p-g-a';
                          }[];
                          id?: 'amp';
                        }[];
                        content: string;
                      };
                      explanation?: {
                        items: {
                          id?: 't_d';
                          type_: 'entity' | 'superscript';
                          text?: string;
                          items?: never[];
                          content?: never[];
                        }[];
                        content: string;
                      };
                      usage?: {
                        value: string;
                        expansion?: string;
                      }[];
                      lit_refs?: {
                        code: string;
                        spec?: {
                          items?: {
                            text: string;
                            type_: 'quote_inset' | 'usage';
                            items?: never[];
                            content?: never[];
                          }[];
                          content?: string;
                        } | null;
                        intro?:
                          | string
                          | {
                              items?: {
                                id: 't_d';
                                type_: 'entity';
                              }[];
                              content?: string;
                            }
                          | null;
                        type_: 'meaning_lit';
                        attest?:
                          | {
                              type_: 'attestation';
                              ref_id: number;
                              ref_title: string;
                              ref_target: string;
                            }[]
                          | null;
                        bibl_id: number;
                      }[];
                      place_refs?: {
                        id?: string;
                        vis?: number;
                        auto: number | boolean;
                        place?: {
                          type_: 'place';
                          place_id: number;
                          place_name: string;
                          place_type:
                            | 'del av fylke'
                            | 'del av landsdel'
                            | 'del av landskap'
                            | 'fylke'
                            | 'kommune'
                            | 'land'
                            | 'landsdel'
                            | 'landskap'
                            | 'region'
                            | 'tvillingkommune';
                        };
                        type_: 'meaning_place';
                        attest?:
                          | {
                              type_: 'attestation';
                              ref_id: number;
                              ref_title: string;
                              ref_target: string;
                            }[]
                          | null;
                        place_id: number;
                        place_name: string;
                        code?: string | null;
                        bibl_id?: number;
                        _formatertKode?: string;
                        spec?:
                          | string
                          | {
                              items?: {
                                text: string;
                                type_: 'usage';
                              }[];
                              content?: string;
                            }
                          | null;
                        show?: boolean;
                        place_name_full?: never[];
                      }[];
                      xrefs?: {
                        intro?:
                          | string
                          | {
                              items?: never[];
                              content?: string;
                            };
                        type_: 'article_ref';
                        inline: number;
                        lemmas: {
                          id: number;
                          hgno: number;
                          lemma: string;
                          type_: 'lemma';
                        }[];
                        article_id: number;
                        definition_id?: number;
                        definition_order?: number[];
                        coda?:
                          | {
                              items?: {
                                text: string;
                                type_: 'usage';
                              }[];
                              content?: string;
                            }
                          | string;
                      }[];
                      editorial_exp?: {
                        items: {
                          type_: 'article_ref' | 'entity';
                          lemmas?: {
                            id: number;
                            hgno: number;
                            lemma: string;
                            type_: 'lemma';
                          }[];
                          article_id?: number;
                          definition_id?: number;
                          definition_order?: number[];
                          id?: 'o_l';
                        }[];
                        content: string;
                      };
                      alt_place?: string;
                      id?: number;
                      elements?: {
                        items?: {
                          text?: string;
                          type_: 'article_ref' | 'usage';
                          lemmas?: {
                            id: number;
                            hgno: number;
                            lemma: string;
                            type_: 'lemma';
                          }[];
                          article_id?: number;
                          definition_id?: number;
                          definition_order?: number[];
                        }[];
                        type_: 'example' | 'explanation';
                        content?: string;
                        quote?: {
                          items: {
                            text: string;
                            type_: 'usage';
                          }[];
                          content: string;
                        };
                        lit_refs?: {
                          code: string;
                          spec?: {
                            items: never[];
                            content: string;
                          } | null;
                          intro?: never | null;
                          type_: 'meaning_lit';
                          attest?: never[] | null;
                          bibl_id: number;
                        }[];
                        explanation?: {
                          items: never[];
                          content: string;
                        };
                        attest?: never[];
                        place_refs?: {
                          id: '370406-243' | '370406-282' | '755331-558';
                          vis: number;
                          auto: number;
                          spec?: string;
                          place: {
                            type_: 'place';
                            place_id: number;
                            place_name: string;
                            place_type: 'fylke' | 'kommune';
                          };
                          type_: 'meaning_place';
                          attest?: never | null;
                          place_id: number;
                          place_name: string;
                        }[];
                        editorial_exp?: {
                          items: never[];
                          content: string;
                        };
                        xrefs?: {
                          intro: string;
                          type_: 'article_ref';
                          inline: number;
                          lemmas: {
                            id: number;
                            hgno: number;
                            lemma: string;
                            type_: 'lemma';
                          }[];
                          article_id: number;
                          definition_id: number;
                          definition_order: number[];
                        }[];
                      }[];
                      sub_definition?: boolean;
                      tydingstekst?: {
                        items: never[];
                        content: string;
                      };
                    }[];
                    sub_definition?: boolean;
                    lit_refs?: {
                      code: string;
                      spec?: {
                        items?: {
                          text: string;
                          type_: 'usage';
                        }[];
                        content?: string;
                      } | null;
                      intro?:
                        | string
                        | {
                            items?: {
                              id: 't_d';
                              type_: 'entity';
                            }[];
                            content?: string;
                          }
                        | null;
                      type_: 'meaning_lit';
                      attest?:
                        | {
                            type_: 'attestation';
                            ref_id: number;
                            ref_title: string;
                            ref_target: string;
                          }[]
                        | null;
                      bibl_id: number;
                    }[];
                    usage?: {
                      value: string;
                      expansion?: string;
                    }[];
                    place_refs?: {
                      id: string;
                      vis: number;
                      auto: number;
                      place: {
                        type_: 'place';
                        place_id: number;
                        place_name: string;
                        place_type:
                          | 'del av fylke'
                          | 'del av landsdel'
                          | 'del av landskap'
                          | 'fylke'
                          | 'kommune'
                          | 'landsdel'
                          | 'landskap'
                          | 'region'
                          | 'tvillingkommune';
                      };
                      type_: 'meaning_place';
                      attest?:
                        | {
                            type_: 'attestation';
                            ref_id: number;
                            ref_title: string;
                            ref_target: string;
                          }[]
                        | null;
                      place_id: number;
                      place_name: string;
                      spec?:
                        | string
                        | {
                            items?: {
                              text: string;
                              type_: 'usage';
                            }[];
                            content?: string;
                          }
                        | null;
                      code?: string;
                      bibl_id?: number;
                      _formatertKode?: string;
                    }[];
                    alt_place?: string;
                    editorial_exp?: {
                      items: {
                        id?: 't_d';
                        type_: 'article_ref' | 'entity';
                        lemmas?: {
                          id: number;
                          hgno: number;
                          lemma: string;
                          type_: 'lemma';
                        }[];
                        article_id?: number;
                        definition_id?: number;
                        definition_order?: number[];
                      }[];
                      content: string;
                    };
                    tydingstekst?: {
                      items: {
                        id: 'el_l' | 'o_l';
                        type_: 'entity';
                      }[];
                      content: string;
                    };
                  }[];
                  sub_definition: boolean;
                }[];
              };
              owner: string;
              type_: 'article';
              author: string;
              lemmas: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
                markdown_lemma?: string;
              }[];
              batches?: never[];
              dict_id: 'no';
              updated?: never | null;
              version: number;
              pub_flag?: never | null;
              frontpage: boolean;
              no_lemmas?: never[];
              article_id: number;
              properties?: {
                comments?: {
                  date: string;
                  text?: string | null;
                  user: number;
                  title: string;
                }[];
              } | null;
              word_class?: string | null;
              article_type: 'SUB_ARTICLE';
              latest_status: number;
              referenced_by: {
                hgno: number;
                art_id: number;
                word_form: string;
              }[];
              mo_article_ids?: never[];
              a_h_id?: never | null;
            };
            id?: number;
            elements?: {
              items?: {
                type_: 'article_ref' | 'entity' | 'usage';
                lemmas?: {
                  id: number;
                  hgno: number;
                  lemma: string;
                  type_: 'lemma';
                }[];
                article_id?: number;
                definition_id?: number;
                definition_order?: number[];
                text?: string;
                id?:
                  | 'el-l'
                  | 'el_l'
                  | 'm_a'
                  | 'm_oms_t'
                  | 'o_a'
                  | 'o_l'
                  | 'p_g_a'
                  | 'svar._t'
                  | 't-d'
                  | 't_d'
                  | 't_skiln';
                items?: {
                  text: string;
                  items: never[];
                  type_: 'superscript';
                  content: never[];
                }[];
              }[];
              type_:
                | 'article_ref'
                | 'compound_list'
                | 'example'
                | 'explanation';
              usage?: {
                value: string;
                expansion?: string;
              }[];
              attest?: {
                id: number;
                type_: 'attestation';
                ref_id: number;
                ref_title: string;
                ref_target: string;
              }[];
              content?: string | null;
              quote?: {
                items: {
                  text?: string;
                  type_: 'entity' | 'quote_inset' | 'superscript' | 'usage';
                  items?: {
                    id: 'el-l' | 'el_l' | 'o_l' | 't-d' | 't_d';
                    type_: 'entity';
                  }[];
                  content?: never[] | string;
                  id?: 'o_l';
                }[];
                content: string;
              };
              explanation?: {
                items: {
                  id?: 'd_s' | 'el_l' | 'o_l' | 'p_g_a' | 't_d';
                  type_: 'article_ref' | 'entity' | 'usage';
                  text?: string;
                  lemmas?: {
                    id: number;
                    hgno: number;
                    lemma: string;
                    type_: 'lemma';
                  }[];
                  article_id?: number;
                  definition_id?: number;
                  definition_order?: number[];
                }[];
                content: string;
              };
              lit_refs?: {
                code: string;
                spec?: {
                  items?: {
                    text: string;
                    type_: 'quote_inset' | 'usage';
                    items?: never[];
                    content?: never[];
                  }[];
                  content?: string;
                } | null;
                intro?:
                  | string
                  | {
                      items?: {
                        id: 'm_a' | 't_d';
                        type_: 'entity';
                      }[];
                      content?: string;
                    }
                  | null;
                type_: 'meaning_lit';
                attest?:
                  | {
                      type_: 'attestation' | 'meaning_lit_attest';
                      ref_id: number;
                      ref_title?: string;
                      ref_target: string;
                    }[]
                  | null;
                bibl_id: number;
                id?: number;
                kode?: never | null;
              }[];
              xrefs?: {
                intro?:
                  | string
                  | {
                      items?: {
                        text: string;
                        type_: 'usage';
                      }[];
                      content?: string;
                    };
                type_: 'article_ref';
                inline: number;
                lemmas: {
                  id?: number;
                  hgno?: number;
                  lemma: string;
                  type_: 'lemma';
                  markdown_lemma?: string;
                }[];
                article_id?: number;
                definition_id?: number;
                definition_order?: number[] | number;
                coda?:
                  | {
                      items?: never[];
                      content?: string;
                    }
                  | string;
              }[];
              place_refs?: {
                id?: string | number;
                vis?: number;
                auto: number | boolean;
                spec?:
                  | string
                  | {
                      items?: {
                        text: string;
                        type_: 'usage';
                      }[];
                      content?: string;
                    }
                  | null;
                place?: {
                  type_?: 'place';
                  place_id: number;
                  place_name: string;
                  place_type:
                    | 'del av fylke'
                    | 'del av landsdel'
                    | 'del av landskap'
                    | 'fylke'
                    | 'kommune'
                    | 'land'
                    | 'landsdel'
                    | 'landskap'
                    | 'region'
                    | 'tvillingkommune';
                  place_order?: number;
                  municipality_nr?: never | null;
                  parent_place_id?: number;
                  place_name_full?: string;
                  weight_threshold?: number;
                };
                type_: 'meaning_place';
                attest?:
                  | {
                      type_: 'attestation' | 'meaning_place_attest';
                      ref_id: number;
                      ref_title?: string;
                      ref_target: string;
                    }[]
                  | null;
                place_id: number | never[];
                place_name: string;
                code?: string | null;
                show?: boolean;
                bibl_id?: number | null;
                _formatertKode?: string;
                _code?: never | null;
                place_name_full?: never[];
              }[];
              editorial_exp?: {
                items: {
                  type_: 'article_ref' | 'entity' | 'usage';
                  lemmas?: {
                    id: number;
                    hgno: number;
                    lemma: string;
                    type_: 'lemma';
                  }[];
                  article_id?: number;
                  definition_id?: number;
                  definition_order?: number[];
                  id?: 'd_s' | 'el_l' | 'o_l' | 's_d' | 't_d';
                  text?: string;
                }[];
                content: string;
              };
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
                markdown_lemma?: string;
              }[];
              article_id?: number;
              intro?: {
                items: never[];
                content: string;
              };
              elements?: {
                type_: 'article_ref';
                lemmas: {
                  id: number;
                  hgno: number;
                  lemma: string;
                  type_: 'lemma';
                }[];
                article_id: number;
              }[];
              list_type?: string;
              alt_place?: string;
              tydingstekst?: {
                items: never[];
                content: string;
              };
            }[];
            sub_definition?: boolean;
            usage?: {
              value: string;
              expansion?: string | never[];
              id?: number;
              usage?: never | null;
            }[];
            xrefs?: {
              intro?:
                | string
                | {
                    items?: {
                      id?: 'svar._t' | 't_d' | 't_skiln';
                      type_: 'entity' | 'usage';
                      text?: string;
                    }[];
                    content?: string;
                  };
              type_: 'article_ref';
              inline: number;
              lemmas: {
                id?: number;
                hgno?: number;
                lemma: string;
                type_: 'lemma';
                markdown_lemma?: string;
              }[];
              article_id?: number;
              definition_id?: number;
              definition_order?: number[] | number;
              coda?:
                | string
                | {
                    items?: {
                      text: string;
                      type_: 'usage';
                    }[];
                    content?: string;
                  };
            }[];
            list_type?: string;
            alt_segment?: string;
            alt_place?: string;
            tydingstekst?: {
              items: never[];
              content: string;
            };
          }[];
          sub_definition?: boolean;
          intro?: {
            items: {
              id?: 'm_a' | 't_d';
              type_: 'entity' | 'usage';
              text?: string;
            }[];
            content: string;
          };
          lemmas?: (
            | string
            | {
                id?: number;
                hgno?: number;
                lemma?: string;
                type_?: 'lemma';
                markdown_lemma?: string;
              }
          )[];
          article?: {
            body: {
              definitions: {
                id?: number;
                type_: 'definition';
                elements?: {
                  items?: {
                    type_: 'article_ref' | 'entity' | 'usage';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                      markdown_lemma?: string;
                    }[];
                    article_id?: number;
                    definition_id?: number;
                    definition_order?: number[] | number;
                    text?: string;
                    word_form?: string;
                    id?:
                      | 'd_s'
                      | 'el-l'
                      | 'el_l'
                      | 'm_a'
                      | 'o_a'
                      | 'o_l'
                      | 'p-g-a'
                      | 'p_g_a'
                      | 'svar._t'
                      | 't-skiln'
                      | 't_d'
                      | 't_skiln';
                  }[];
                  type_: 'definition' | 'example' | 'explanation';
                  attest?: {
                    id: number;
                    type_: 'attestation';
                    ref_id: number;
                    ref_title: string;
                    ref_target: string;
                  }[];
                  content?: string | null;
                  place_refs?: {
                    id: string | number;
                    vis?: number;
                    auto: number | boolean;
                    place: {
                      type_?: 'place';
                      place_id: number;
                      place_name: string;
                      place_type:
                        | 'del av fylke'
                        | 'del av landsdel'
                        | 'del av landskap'
                        | 'fylke'
                        | 'kommune'
                        | 'land'
                        | 'landsdel'
                        | 'landskap'
                        | 'region'
                        | 'tvillingkommune';
                      place_order?: number;
                      municipality_nr?: number;
                      parent_place_id?: number;
                      place_name_full?: string;
                      weight_threshold?: number;
                    };
                    type_: 'meaning_place';
                    attest?:
                      | {
                          type_: 'attestation';
                          ref_id: number;
                          ref_title: string;
                          ref_target: string;
                        }[]
                      | null;
                    place_id: number;
                    place_name: string;
                    spec?:
                      | string
                      | {
                          items?: {
                            text: string;
                            type_: 'usage';
                          }[];
                          content?: string;
                        }
                      | null;
                    code?: string;
                    bibl_id?: number | null;
                    _formatertKode?: string;
                    show?: boolean;
                    _code?: never | null;
                  }[];
                  quote?: {
                    items?: {
                      text: string;
                      type_: 'subscript' | 'usage';
                    }[];
                    content: string | never[];
                  };
                  lit_refs?: {
                    code: string;
                    spec?: {
                      items?: {
                        text: string;
                        type_: 'quote_inset' | 'usage';
                        items?: never[];
                        content?: never[];
                      }[];
                      content?: string;
                    } | null;
                    intro?:
                      | string
                      | {
                          items?: never[];
                          content?: string;
                        }
                      | null;
                    type_: 'meaning_lit';
                    attest?:
                      | {
                          type_: 'attestation';
                          ref_id: number;
                          ref_title: string;
                          ref_target: string;
                        }[]
                      | null;
                    bibl_id: number;
                    id?: number;
                    kode?: never | null;
                  }[];
                  explanation?: {
                    items: {
                      id: 'd_s' | 'p_g_a' | 't_d';
                      type_: 'entity';
                    }[];
                    content: string;
                  };
                  id?: number;
                  elements?: {
                    items?: {
                      type_: 'article_ref' | 'entity' | 'usage';
                      lemmas?: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                        markdown_lemma?: string;
                      }[];
                      article_id?: number;
                      definition_id?: number;
                      definition_order?: number[];
                      text?: string;
                      id?:
                        | 'el_l'
                        | 'm_a'
                        | 'o-l'
                        | 'o_a'
                        | 'o_l'
                        | 'p-g-a'
                        | 'p_g_a'
                        | 't_d';
                      word_form?: string;
                    }[];
                    type_: 'definition' | 'example' | 'explanation';
                    attest?: {
                      id: number;
                      type_: 'attestation';
                      ref_id: number;
                      ref_title: string;
                      ref_target: string;
                    }[];
                    content?: string | null;
                    place_refs?: {
                      id?: string;
                      vis?: number;
                      auto: number | boolean;
                      place?: {
                        type_: 'place';
                        place_id: number;
                        place_name: string;
                        place_type:
                          | 'del av fylke'
                          | 'del av landsdel'
                          | 'del av landskap'
                          | 'fylke'
                          | 'kommune'
                          | 'landsdel'
                          | 'landskap'
                          | 'region'
                          | 'tvillingkommune';
                      };
                      type_: 'meaning_place';
                      attest?:
                        | {
                            type_: 'attestation';
                            ref_id: number;
                            ref_title: string;
                            ref_target: string;
                          }[]
                        | null;
                      place_id: number;
                      place_name: string;
                      spec?:
                        | string
                        | {
                            items?: never[];
                            content?: string;
                          }
                        | null;
                      code?: string | null;
                      bibl_id?: number;
                      _formatertKode?: string;
                      show?: boolean;
                    }[];
                    xrefs?: {
                      intro?:
                        | string
                        | {
                            items?: never[];
                            content?: string;
                          };
                      type_: 'article_ref';
                      inline: number;
                      lemmas: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                      }[];
                      article_id: number;
                      definition_id?: number;
                      definition_order?: number[];
                      coda?: {
                        items: never[];
                        content: string;
                      };
                    }[];
                    usage?: {
                      value: string;
                      expansion?: string;
                      id?: number;
                      usage?: never | null;
                    }[];
                    lit_refs?: {
                      code: string;
                      spec?: {
                        items?: {
                          text: string;
                          type_: 'quote_inset' | 'usage';
                          items?: never[];
                          content?: never[];
                        }[];
                        content?: string;
                      } | null;
                      intro?:
                        | string
                        | {
                            items?: never[];
                            content?: string;
                          }
                        | null;
                      type_: 'meaning_lit';
                      attest?:
                        | {
                            type_: 'attestation';
                            ref_id: number;
                            ref_title: string;
                            ref_target: string;
                          }[]
                        | null;
                      bibl_id: number;
                      id?: number;
                      kode?: never | null;
                    }[];
                    quote?: {
                      items: {
                        text: string;
                        type_: 'quote_inset' | 'usage';
                        items?: {
                          id: 'o-l';
                          type_: 'entity';
                        }[];
                        content?: never[];
                      }[];
                      content: never[] | string;
                    };
                    explanation?: {
                      items: {
                        id: 't_d';
                        type_: 'entity';
                      }[];
                      content: string;
                    };
                    editorial_exp?: {
                      items: {
                        type_: 'article_ref' | 'entity';
                        lemmas?: {
                          id: number;
                          hgno: number;
                          lemma: string;
                          type_: 'lemma';
                        }[];
                        article_id?: number;
                        id?: 'o_l';
                      }[];
                      content: string;
                    };
                    tydingstekst?: {
                      items: never[];
                      content: string;
                    };
                    alt_place?: string;
                    id?: number;
                    elements?: {
                      items?: {
                        text?: string;
                        type_: 'article_ref' | 'entity' | 'usage';
                        id?: 'el_l' | 'o_l';
                        lemmas?: {
                          id: number;
                          hgno: number;
                          lemma: string;
                          type_: 'lemma';
                        }[];
                        article_id?: number;
                        definition_id?: number;
                        definition_order?: number[];
                      }[];
                      type_: 'example' | 'explanation';
                      attest?: never[];
                      content?: string | null;
                      quote?: {
                        items: {
                          text: string;
                          type_: 'usage';
                        }[];
                        content: string;
                      };
                      lit_refs?: {
                        code: string;
                        spec?: {
                          items?: {
                            text: string;
                            type_: 'usage';
                          }[];
                          content?: string;
                        } | null;
                        intro?: {
                          items?: never[];
                          content?: string;
                        } | null;
                        type_: 'meaning_lit';
                        attest?: never[] | null;
                        bibl_id: number;
                      }[];
                      explanation?: {
                        items: never[];
                        content: string;
                      };
                      place_refs?: {
                        id: string;
                        vis: number;
                        auto: number;
                        place: {
                          type_: 'place';
                          place_id: number;
                          place_name: string;
                          place_type:
                            | 'del av landsdel'
                            | 'fylke'
                            | 'kommune'
                            | 'landskap'
                            | 'tvillingkommune';
                        };
                        type_: 'meaning_place';
                        place_id: number;
                        place_name: string;
                        spec?: never | null;
                        attest?: never | null;
                        code?: string;
                        bibl_id?: number;
                        _formatertKode?: string;
                      }[];
                      editorial_exp?: {
                        items: never[];
                        content: string;
                      };
                      usage?: {
                        value: string;
                        expansion: string;
                      }[];
                      alt_place?: string;
                      xrefs?: {
                        coda: {
                          items: never[];
                          content: string;
                        };
                        intro: {
                          items: never[];
                          content: string;
                        };
                        type_: 'article_ref';
                        inline: number;
                        lemmas: {
                          id: number;
                          hgno: number;
                          lemma: string;
                          type_: 'lemma';
                        }[];
                        article_id: number;
                      }[];
                    }[];
                    sub_definition?: boolean;
                  }[];
                  sub_definition?: boolean;
                  xrefs?: {
                    intro?:
                      | string
                      | {
                          items?: {
                            text: string;
                            type_: 'usage';
                          }[];
                          content?: string;
                        };
                    type_: 'article_ref';
                    inline: number;
                    lemmas: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                      markdown_lemma?: string;
                    }[];
                    article_id: number;
                    definition_id?: number;
                    definition_order?: number[] | number;
                    coda?:
                      | string
                      | {
                          items?: never[];
                          content?: string;
                        };
                  }[];
                  usage?: {
                    value: string;
                    expansion?: string;
                    id?: number;
                    usage?: never | null;
                  }[];
                  alt_place?: string;
                  editorial_exp?: {
                    items: {
                      type_: 'article_ref';
                      lemmas: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                      }[];
                      article_id: number;
                      definition_id: number;
                      definition_order: number[];
                    }[];
                    content: string;
                  };
                  tydingstekst?: {
                    items: {
                      type_: 'article_ref';
                      lemmas: {
                        id: number;
                        hgno: number;
                        lemma: string;
                        type_: 'lemma';
                      }[];
                      article_id: number;
                      definition_id: number;
                      definition_order: number[];
                    }[];
                    content: string;
                  };
                }[];
                sub_definition: boolean;
              }[];
              older_source?: {
                code: string;
                type_: 'older_source';
                attest?: never | null;
                bibl_id: number;
                _ordning: string;
              }[];
            };
            owner: string;
            type_: 'article';
            author: string;
            lemmas: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            batches?: never[];
            dict_id: 'no';
            updated?: never | null;
            version: number;
            pub_flag?: never | null;
            frontpage: boolean;
            no_lemmas?: never[];
            article_id: number;
            properties?: {
              comments?: {
                date: string;
                text?: string | null;
                user: number;
                title: string;
              }[];
              edit_state?: 'Ny';
            } | null;
            word_class?: string | null;
            article_type: 'SUB_ARTICLE';
            latest_status: number;
            referenced_by: {
              hgno: number;
              art_id: number;
              word_form: string;
            }[];
            mo_article_ids?: never[];
            a_h_id?: never | null;
          };
          article_id?: number;
          list_type?: string;
          alt_segment?: string;
          usage?: {
            value?: string;
            expansion?: string | never[];
            id?: number;
            usage?: never | null;
          }[];
          editorial_exp?: {
            items: {
              type_: 'article_ref' | 'entity' | 'usage';
              lemmas?: {
                id: number;
                hgno: number;
                lemma: string;
                type_: 'lemma';
              }[];
              article_id?: number;
              id?:
                | 'd_s'
                | 'el_l'
                | 'o_a'
                | 'o_l'
                | 'p_g_a'
                | 's_d'
                | 't_d'
                | 't_skiln';
              text?: string;
              definition_id?: number;
              definition_order?: number[];
            }[];
            content: string;
          };
          alt_place?: string;
          tydingstekst?: {
            items: never[];
            content: string;
          };
        }[];
        sub_definition?: boolean;
        quote?: {
          items: {
            text?: string;
            type_:
              | 'entity'
              | 'fraction'
              | 'quote_inset'
              | 'subscript'
              | 'superscript'
              | 'usage';
            items?: {
              id?: 'd-e' | 'el-l' | 'o_l' | 't-d';
              type_: 'entity' | 'quote_inset';
              items?: never[];
              content?: string;
            }[];
            content?: never[] | string;
            numerator?: string;
            denominator?: string;
            id?: 'amp' | 'm_a' | 'o_l' | 't_d';
          }[];
          content: string | never[];
        };
        explanation?: {
          items: {
            type_:
              | 'article_ref'
              | 'entity'
              | 'fraction'
              | 'superscript'
              | 'usage';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            article_id?: number;
            id?:
              | 'd_e'
              | 'd_s'
              | 'el_l'
              | 'm_a'
              | 'o_a'
              | 'o_l'
              | 'p_g_a'
              | 't_d';
            text?: string;
            items?: never[];
            content?: never[];
            numerator?: string;
            denominator?: string;
          }[];
          content: string;
        };
        usage?: {
          value: string;
          expansion?: string | never[];
          id?: number;
          usage?: never | null;
        }[];
        lit_refs?: {
          code: string;
          spec?: {
            items?: {
              text: string;
              type_: 'quote_inset' | 'superscript' | 'usage';
              items?: {
                id?: 'amp';
                type_: 'entity' | 'quote_inset';
                text?: string;
                items?: never[];
                content?: never[];
              }[];
              content?: never[];
            }[];
            content?: string;
          } | null;
          intro?:
            | string
            | {
                items?: {
                  id: 'm_a' | 't_d';
                  type_: 'entity';
                }[];
                content?: string;
              }
            | null;
          type_: 'meaning_lit';
          attest?:
            | {
                type_: 'attestation';
                ref_id: number;
                ref_title: string;
                ref_target: string;
              }[]
            | null;
          bibl_id?: number | null;
          id?: number;
          kode?: never | null;
        }[];
        intro?: {
          items: {
            id?: 'm_a' | 't_d';
            type_: 'entity' | 'usage';
            text?: string;
          }[];
          content: string;
        };
        lemmas?: string[];
        article?: {
          body: {
            definitions: {
              id?: number;
              type_: 'definition';
              elements?: {
                items?: {
                  type_: 'article_ref' | 'entity' | 'usage';
                  lemmas?: {
                    id: number;
                    hgno: number;
                    lemma: string;
                    type_: 'lemma';
                  }[];
                  article_id?: number;
                  text?: string;
                  definition_id?: number;
                  definition_order?: number[];
                  id?:
                    | 'd_s'
                    | 'el_l'
                    | 'm_a'
                    | 'o_a'
                    | 'o_l'
                    | 'p_g_a'
                    | 't_d'
                    | 't_skiln';
                  word_form?: string;
                }[];
                type_: 'definition' | 'example' | 'explanation';
                usage?: {
                  value: string;
                  expansion?: string;
                }[];
                attest?: {
                  id: number;
                  type_: 'attestation';
                  ref_id: number;
                  ref_title: string;
                  ref_target: string;
                }[];
                content?: string | null;
                quote?: {
                  items: {
                    text: string;
                    type_: 'usage';
                  }[];
                  content: string | never[];
                };
                lit_refs?: {
                  code: string;
                  spec?: {
                    items?: {
                      text: string;
                      type_: 'usage';
                    }[];
                    content?: string;
                  } | null;
                  intro?: string | null;
                  type_: 'meaning_lit';
                  attest?:
                    | {
                        type_: 'attestation';
                        ref_id: number;
                        ref_title: string;
                        ref_target: string;
                      }[]
                    | null;
                  bibl_id: number;
                }[];
                explanation?: {
                  items: {
                    id: 'd_s';
                    type_: 'entity';
                  }[];
                  content: string;
                };
                place_refs?: {
                  id?: string | number;
                  vis?: number;
                  auto: number | boolean;
                  place?: {
                    type_?: 'place';
                    place_id: number;
                    place_name: string;
                    place_type:
                      | 'del av fylke'
                      | 'del av landsdel'
                      | 'del av landskap'
                      | 'fylke'
                      | 'kommune'
                      | 'land'
                      | 'landsdel'
                      | 'landskap'
                      | 'tvillingkommune';
                    place_order?: number;
                    municipality_nr?: number;
                    parent_place_id?: number;
                    place_name_full?: string;
                    weight_threshold?: number;
                  };
                  type_: 'meaning_place';
                  attest?:
                    | {
                        type_: 'attestation';
                        ref_id: number;
                        ref_title: string;
                        ref_target: string;
                      }[]
                    | null;
                  place_id?: number | null;
                  place_name: string;
                  spec?: string | null;
                  code?: string | null;
                  show?: boolean;
                  _code?: never | null;
                  bibl_id?: number | null;
                  _formatertKode?: string;
                  place_name_full?: never[];
                }[];
                xrefs?: {
                  intro?:
                    | string
                    | {
                        items?: {
                          text: string;
                          type_: 'usage';
                        }[];
                        content?: string;
                      };
                  type_: 'article_ref';
                  inline: number;
                  lemmas: {
                    id?: number;
                    hgno?: number;
                    lemma: string;
                    type_: 'lemma';
                    markdown_lemma?: string;
                  }[];
                  article_id: number;
                  definition_id?: number;
                  definition_order?: number[] | number;
                  coda?:
                    | string
                    | {
                        items?: {
                          text: string;
                          type_: 'usage';
                        }[];
                        content?: string;
                      };
                }[];
                alt_place?: string;
                id?: number;
                elements?: {
                  items?: {
                    id?:
                      | 'el-l'
                      | 'el_l'
                      | 'o_l'
                      | 'p_g_a'
                      | 't-d'
                      | 't_d'
                      | 't_skiln';
                    type_: 'article_ref' | 'entity' | 'usage';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    article_id?: number;
                    definition_id?: number;
                    definition_order?: number[];
                    text?: string;
                  }[];
                  type_: 'example' | 'explanation';
                  attest?: never[];
                  content?: string | null;
                  quote?: {
                    items: {
                      text: string;
                      type_: 'usage';
                    }[];
                    content: string;
                  };
                  lit_refs?: {
                    code: string;
                    spec?: {
                      items?: {
                        text: string;
                        type_: 'usage';
                      }[];
                      content?: string;
                    } | null;
                    intro?: string | null;
                    type_: 'meaning_lit';
                    attest?:
                      | {
                          type_: 'attestation' | 'meaning_lit_attest';
                          ref_id: number;
                          ref_title?: string;
                          ref_target: string;
                        }[]
                      | null;
                    bibl_id: number;
                  }[];
                  explanation?: {
                    items: never[];
                    content: string;
                  };
                  usage?: {
                    value: string;
                    expansion?: string;
                  }[];
                  place_refs?: {
                    id: string;
                    vis: number;
                    auto: number;
                    place: {
                      type_: 'place';
                      place_id: number;
                      place_name: string;
                      place_type:
                        | 'del av fylke'
                        | 'del av landsdel'
                        | 'del av landskap'
                        | 'fylke'
                        | 'kommune'
                        | 'landsdel'
                        | 'landskap'
                        | 'region'
                        | 'tvillingkommune';
                    };
                    type_: 'meaning_place';
                    attest?:
                      | {
                          type_: 'attestation';
                          ref_id: number;
                          ref_title: string;
                          ref_target: string;
                        }[]
                      | null;
                    place_id: number;
                    place_name: string;
                    code?: string;
                    bibl_id?: number;
                    _formatertKode?: string;
                    spec?: string | null;
                  }[];
                  tydingstekst?: {
                    items: never[];
                    content: string;
                  };
                  xrefs?: {
                    intro: string;
                    type_: 'article_ref';
                    inline: number;
                    lemmas: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    article_id: number;
                    definition_id?: number;
                    definition_order?: number[];
                  }[];
                  alt_place?: string;
                }[];
                sub_definition?: boolean;
                tydingstekst?: {
                  items: {
                    type_: 'article_ref' | 'entity';
                    lemmas?: {
                      id: number;
                      hgno: number;
                      lemma: string;
                      type_: 'lemma';
                    }[];
                    article_id?: number;
                    definition_id?: number;
                    definition_order?: number[];
                    id?: 't_d';
                  }[];
                  content: string;
                };
                editorial_exp?: {
                  items: {
                    text?: string;
                    type_: 'entity' | 'usage';
                    id?: 's_d';
                  }[];
                  content: string;
                };
              }[];
              sub_definition: boolean;
            }[];
          };
          owner: string;
          type_: 'article';
          author: string;
          lemmas: {
            id: number;
            hgno: number;
            lemma: string;
            type_: 'lemma';
          }[];
          batches?: never[];
          dict_id: 'no';
          updated?: never | null;
          version: number;
          pub_flag?: never | null;
          frontpage: boolean;
          no_lemmas?: never[];
          article_id: number;
          properties?: {
            edit_state?: 'Ny';
            comments?: {
              date: string;
              text?: never | null;
              user: number;
              title: string;
            }[];
          } | null;
          word_class?: string | null;
          article_type: 'SUB_ARTICLE';
          latest_status: number;
          referenced_by: {
            hgno: number;
            art_id: number;
            word_form: string;
          }[];
          mo_article_ids?: never[];
          a_h_id?: never | null;
        };
        article_id?: number;
        xrefs?: {
          intro?:
            | string
            | {
                items?: {
                  id?: 't_d' | 't_skiln';
                  type_: 'entity' | 'usage';
                  text?: string;
                }[];
                content?: string;
              };
          type_: 'article_ref';
          inline: number;
          lemmas: {
            id: number;
            hgno: number;
            lemma: string;
            type_: 'lemma';
            markdown_lemma?: string;
          }[];
          article_id: number;
          definition_id?: number;
          definition_order?: number[] | number;
          coda?:
            | {
                items?: {
                  text?: string;
                  type_: 'entity' | 'usage';
                  id?: 'm_a' | 'o_a';
                }[];
                content?: string;
              }
            | string;
        }[];
        list_type?: string;
        alt_segment?: string;
        editorial_exp?: {
          items: {
            type_: 'article_ref' | 'entity' | 'usage';
            lemmas?: {
              id: number;
              hgno: number;
              lemma: string;
              type_: 'lemma';
            }[];
            article_id?: number;
            id?: 'd_s' | 'el_l' | 'm_a' | 'o_l' | 's_d' | 't_d' | 't_skiln';
            text?: string;
            definition_id?: number;
            definition_order?: number[];
          }[];
          content: string;
        };
        alt_place?: string;
        tydingstekst?: {
          items: never[];
          content: string;
        };
      }[];
      sub_definition: boolean;
    }[];
    older_source?: {
      code?: string;
      spec?:
        | {
            items?: {
              text?: string;
              type_: 'entity' | 'subscript' | 'usage';
              id?: 'm_a' | 'o_a';
            }[];
            content?: string;
          }
        | string
        | null;
      type_: 'older_source';
      attest?:
        | {
            type_: 'attestation';
            ref_id: number;
            ref_title: string;
            ref_target: string;
          }[]
        | null;
      bibl_id?: number;
      _ordning?: string;
      intro?: string;
      sources?: never[];
      id?: number;
    }[];
    dialect?: {
      id?: number;
      intro?: string | null;
      type_?: 'dialect';
      subcats: {
        id: number;
        forms: {
          id?: number;
          form?:
            | string
            | {
                items?: {
                  text: string;
                  type_: 'usage';
                }[];
                content?: string;
              };
          type_: 'dialect_form';
          attest?:
            | {
                type_: 'attestation';
                ref_id: number;
                ref_title?: string;
                ref_target: string;
              }[]
            | null;
          sources: {
            id?: number;
            auto?: number;
            show?: number;
            spec?:
              | {
                  items?: {
                    text?: string;
                    type_: 'entity' | 'usage';
                    id?: 'el_l';
                  }[];
                  content?: string;
                }
              | string;
            type_: 'dialect_source' | 'older_source';
            attest?:
              | {
                  type_: 'attestation';
                  ref_id: number;
                  ref_title?: string;
                  ref_target: string;
                }[]
              | null;
            place_id?: number;
            place_name?: string;
            code?: string;
            bibl_id?: number;
            infix?: string;
            spec_?: string;
            place?: {
              place_id: number;
              place_name: string;
              place_type:
                | 'del av landsdel'
                | 'del av landskap'
                | 'fylke'
                | 'kommune'
                | 'land'
                | 'landsdel'
                | 'landskap'
                | 'tvillingkommune';
              place_order: number;
              municipality_nr?: number | null;
              parent_place_id: number;
              place_name_full: string;
              weight_threshold: number;
            };
            place_name_no?: string;
          }[];
        }[];
        type_?: 'dialect_subcat';
        subcat?: string | null;
        type?: string;
      }[];
      freetext?:
        | string
        | {
            items?: {
              text?: string;
              type_: 'entity' | 'usage';
              id?: 'el_l' | 'o_l' | 's_d' | 't_d';
            }[];
            content?: string;
          }
        | null;
      rekkefolge?: number;
      type?: string;
    }[];
    etymology?: {
      items: {
        id?: string;
        type_:
          | 'article_ref'
          | 'entity'
          | 'fraction'
          | 'language'
          | 'quote_inset'
          | 'subscript'
          | 'usage';
        text?: string;
        lemmas?: {
          id?: number;
          hgno?: number;
          lemma: string;
          type_: 'lemma';
          markdown_lemma?: string;
        }[];
        article_id?: number;
        definition_id?: number;
        definition_order?: number[];
        items?: {
          id: 'oslashcirc';
          type_: 'entity';
        }[];
        content?: never[];
        numerator?: string;
        denominator?: string;
      }[];
      type_:
        | 'etymology_lang'
        | 'etymology_language'
        | 'etymology_lit'
        | 'etymology_ref'
        | 'etymology_reference';
      content: string;
      sources?: {
        code: string;
        type_: 'etymology_source' | 'written_form_source';
        attest?: never | null;
        bibl_id: number;
        spec?:
          | {
              items?: {
                text: string;
                type_: 'subscript' | 'usage';
                items?: {
                  text: string;
                  type_: 'emph';
                }[];
              }[];
              content?: string;
            }
          | string;
        id?: number;
      }[];
    }[];
    pronunciation?: {
      items: {
        items: never[];
        type_: 'pronunciation_guide';
        content: string;
      }[];
      type_: 'pronunciation';
      content: string;
    }[];
    written_form?: {
      forms: {
        id: number;
        type_: 'written_form_form';
        attest?:
          | {
              type_?: 'attestation';
              ref_id: number;
              ref_title?: string;
              ref_target: string;
              type?: string;
            }[]
          | null;
        sources: {
          id: number;
          code?: string;
          spec?:
            | {
                items?: {
                  text?: string;
                  type_: 'entity' | 'usage';
                  id?: 't_d';
                }[];
                content?: string;
              }
            | string;
          type_: 'source' | 'written_form_source';
          attest?:
            | {
                type_: 'attestation';
                ref_id: number;
                ref_title: string;
                ref_target: string;
              }[]
            | null;
          bibl_id?: number;
          spec_?: string;
        }[];
        written_form: string;
        form?: never | null;
      }[];
      intro?: string | null;
      type_: 'written_form';
      id?: number;
    }[];
  };
  a_h_id?: number;
  author?: string;
  lemmas: {
    id?: number | null;
    hgno?: number | null;
    lemma: string;
    mo_link?: string | null;
    split_inf?: boolean;
    added_norm?: boolean;
    inflection?: (string | ((string | null)[] | string)[] | null)[] | null;
    is_standard?: boolean;
    final_lexeme?: string;
    paradigm_info: {
      to?: string | null;
      from: string;
      tags: string[];
      inflection: {
        tags: string[];
        word_form?: string | null;
        markdown_word_form?: string | null;
      }[];
      paradigm_id: number;
      standardisation: 'REGISTERED' | 'STANDARD';
      inflection_group:
        | 'ABBR'
        | 'ADJ_masc_fem'
        | 'ADJ_regular'
        | 'ADP'
        | 'ADV'
        | 'ADV_adj'
        | 'CCONJ'
        | 'COMPPFX'
        | 'DET_Q'
        | 'DET_regular'
        | 'EXPR'
        | 'INFM'
        | 'INTJ'
        | 'NOUN_reg_fem'
        | 'NOUN_regular'
        | 'NOUN_uninfl'
        | 'PFX'
        | 'PRON_regular'
        | 'PRON_simple'
        | 'PROPN'
        | 'SCONJ'
        | 'SYM'
        | 'UNKN'
        | 'VERB_regular'
        | 'VERB_sPass';
    }[];
    stress_vowel?: string | null;
    inflection_class?: string;
    initial_lexeme?: string;
    markdown_lemma?: string;
    junction?: string;
    neg_junction?: string;
    annotated_lemma?: never | null;
  }[];
  status?: number;
  updated?: string;
  referers?: {
    hgno?: number | null;
    lemma?: string | null;
    article_id: number;
  }[];
  submitted: string;
  article_id: number;
  edit_state?: string | null;
  mo_article_ids?: (number | null)[];
  suggest?: string[];
  to_index?: string[];
}
