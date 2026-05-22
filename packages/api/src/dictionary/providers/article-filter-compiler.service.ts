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

import { BadRequestException, Injectable } from '@nestjs/common';
import { ArticleFilter } from '../models/article-filter/article-filter.input';
import { BibliographyFilter } from '../models/article-filter/bibliography-filter.input';
import {
  WordClassFilter,
  GenderFilter,
  EtymologyLanguageFilter,
  PlaceTypeFilter,
} from '../models/article-filter/enum-filter.input';
import { PlaceFilter } from '../models/article-filter/place-filter.input';
import { StringFilter } from '../models/article-filter/string-filter.input';
import {
  ArticleSort,
  ArticleSortField,
  SortDirection,
} from '../models/article-filter/article-sort.input';
import { WordClass } from '../models/word-class.model';
import { Gender } from '../models/gender.model';
import { InflectionTag } from '../models/inflection-tag.model';
import {
  EtymologyLanguage,
  EtymologyLanguageRawCodes,
  RawCodeToEtymologyLanguage,
} from '../models/etymology-language.model';
import { PlaceTypeToRaw } from '../models/place-type.model';

const maxFilterDepth = 3;
const maxFilterClauses = 30;

const WordClassToTag: Record<WordClass, string> = {
  [WordClass.Substantiv]: 'NOUN',
  [WordClass.Adjektiv]: 'ADJ',
  [WordClass.Adverb]: 'ADV',
  [WordClass.Verb]: 'VERB',
  [WordClass.Pronomen]: 'PRON',
  [WordClass.Preposisjon]: 'ADP',
  [WordClass.Konjunksjon]: 'CCONJ',
  [WordClass.Interjeksjon]: 'INTJ',
  [WordClass.Determinativ]: 'DET',
  [WordClass.Subjunksjon]: 'SCONJ',
  [WordClass.Symbol]: 'SYM',
  [WordClass.Forkorting]: 'ABBR',
  [WordClass.Uttrykk]: 'EXPR',
  [WordClass.Talord]: 'DET_Q',
  [WordClass.Eigennamn]: 'PROPN',
  [WordClass.Prefiks]: 'PFX',
  [WordClass.Samansetjingsled]: 'COMPPFX',
  [WordClass.Infinitivsmerke]: 'INFM',
  [WordClass.Ukjend]: 'UNKN',
};

const GenderToTag: Partial<Record<Gender, string>> = {
  [Gender.Hankjoenn]: 'Masc',
  [Gender.Hokjoenn]: 'Fem',
  [Gender.Inkjekjoenn]: 'Neuter',
  [Gender.HankjoennHokjoenn]: 'Masc/Fem',
};

const InflectionTagToMeili: Record<InflectionTag, string> = {
  [InflectionTag.Infinitiv]: 'Inf',
  [InflectionTag.Presens]: 'Pres',
  [InflectionTag.Preteritum]: 'Past',
  [InflectionTag.PerfektPartisipp]: '<PerfPart>',
  [InflectionTag.PresensPartisipp]: '<PresPart>',
  [InflectionTag.SPassiv]: '<SPass>',
  [InflectionTag.Imperativ]: 'Imp',
  [InflectionTag.Passiv]: 'Pass',
  [InflectionTag.Adjektiv]: 'Adj',
  [InflectionTag.Adverb]: 'Adv',
  [InflectionTag.Eintal]: 'Sing',
  [InflectionTag.HankjoennHokjoenn]: 'Masc/Fem',
  [InflectionTag.Hankjoenn]: 'Masc',
  [InflectionTag.Hokjoenn]: 'Fem',
  [InflectionTag.Inkjekjoenn]: 'Neuter',
  [InflectionTag.Ubestemt]: 'Ind',
  [InflectionTag.Bestemt]: 'Def',
  [InflectionTag.Fleirtal]: 'Plur',
  [InflectionTag.Superlativ]: 'Sup',
  [InflectionTag.Komparativ]: 'Cmp',
  [InflectionTag.Positiv]: 'Pos',
  [InflectionTag.Nominativ]: 'Nom',
  [InflectionTag.Akkusativ]: 'Acc',
};

const TagToWordClass: Record<string, WordClass> = Object.fromEntries(
  Object.entries(WordClassToTag).map(([k, v]) => [v, k as WordClass]),
);

const TagToGender: Record<string, Gender> = Object.fromEntries(
  Object.entries(GenderToTag).map(([k, v]) => [v, k as Gender]),
);

const MeiliToInflectionTag: Record<string, InflectionTag> = Object.fromEntries(
  Object.entries(InflectionTagToMeili).map(([k, v]) => [v, k as InflectionTag]),
);

const SortFieldMap: Record<ArticleSortField, string> = {
  [ArticleSortField.ArticleId]: 'article_id',
};

@Injectable()
export class ArticleFilterCompiler {
  compile(filter: ArticleFilter): string {
    this.#validate(filter);
    return this.#compileNode(filter);
  }

  compileSort(sort: ArticleSort): string[] {
    const field = SortFieldMap[sort.field];
    const dir = sort.direction === SortDirection.Asc ? 'asc' : 'desc';
    return [`${field}:${dir}`];
  }

  mapFacetWordClass(tag: string): WordClass | undefined {
    return TagToWordClass[tag];
  }

  mapFacetGender(tag: string): Gender | undefined {
    return TagToGender[tag];
  }

  mapFacetInflectionTag(tag: string): InflectionTag | undefined {
    return MeiliToInflectionTag[tag];
  }

  mapFacetEtymologyLanguage(code: string): string | undefined {
    return RawCodeToEtymologyLanguage[code];
  }

  #validate(filter: ArticleFilter, depth = 0, counter = { count: 0 }): void {
    if (depth > maxFilterDepth) {
      throw new BadRequestException(
        `Filternesting er for djup (maks ${maxFilterDepth} nivå).`,
      );
    }

    counter.count++;
    if (counter.count > maxFilterClauses) {
      throw new BadRequestException(
        `For mange filteruttrykk (maks ${maxFilterClauses}).`,
      );
    }

    if (filter.AND) {
      for (const child of filter.AND) {
        this.#validate(child, depth + 1, counter);
      }
    }
    if (filter.OR) {
      for (const child of filter.OR) {
        this.#validate(child, depth + 1, counter);
      }
    }
    if (filter.NOT) {
      this.#validate(filter.NOT, depth + 1, counter);
    }
  }

  #compileNode(filter: ArticleFilter): string {
    const clauses: string[] = [];

    if (filter.wordClass) {
      this.#compileWordClassFilter(clauses, filter.wordClass);
    }
    if (filter.gender) {
      this.#compileGenderFilter(clauses, filter.gender);
    }
    if (
      filter.hasSplitInfinitive !== undefined &&
      filter.hasSplitInfinitive !== null
    ) {
      clauses.push(`has_split_inf = ${filter.hasSplitInfinitive}`);
    }
    if (filter.inflectionTags) {
      for (const tag of filter.inflectionTags) {
        clauses.push(`inflection_tags = "${InflectionTagToMeili[tag]}"`);
      }
    }
    if (filter.etymologyLanguage) {
      this.#compileEtymologyLanguageFilter(clauses, filter.etymologyLanguage);
    }

    this.#compileStringFilter(clauses, 'lemmas', filter.lemma);
    this.#compileStringFilter(clauses, 'inflections', filter.inflection);
    this.#compilePlaceFilter(clauses, 'dialect_place', filter.dialectPlace);
    this.#compilePlaceFilter(
      clauses,
      'attestation_place',
      filter.attestationPlace,
    );
    this.#compilePlaceFilter(clauses, 'place', filter.place);
    this.#compileBibliographyFilter(
      clauses,
      'older_source',
      filter.olderSource,
    );
    this.#compileBibliographyFilter(
      clauses,
      'written_form_source',
      filter.writtenFormSource,
    );
    this.#compileBibliographyFilter(
      clauses,
      'attestation_source',
      filter.attestationSource,
    );
    this.#compileStringFilter(clauses, 'etymology_text', filter.etymologyText);
    this.#compileStringFilter(
      clauses,
      'definition_text',
      filter.definitionText,
    );
    this.#compileStringFilter(clauses, 'example_text', filter.exampleText);
    this.#compileStringFilter(
      clauses,
      'pronunciation_text',
      filter.pronunciationText,
    );
    this.#compileStringFilter(clauses, 'dialect_forms', filter.dialectForm);
    this.#compileStringFilter(clauses, 'written_forms', filter.writtenForm);
    this.#compileStringFilter(
      clauses,
      'sub_article_lemmas',
      filter.subArticleLemma,
    );
    this.#compileBibliographyFilter(
      clauses,
      'bibliography',
      filter.bibliography,
    );

    if (filter.AND) {
      const sub = filter.AND.map((f) => this.#compileNode(f)).filter(Boolean);
      if (sub.length) {
        clauses.push(`(${sub.join(' AND ')})`);
      }
    }
    if (filter.OR) {
      const sub = filter.OR.map((f) => this.#compileNode(f)).filter(Boolean);
      if (sub.length) {
        clauses.push(`(${sub.join(' OR ')})`);
      }
    }
    if (filter.NOT) {
      const sub = this.#compileNode(filter.NOT);
      if (sub) {
        clauses.push(`NOT (${sub})`);
      }
    }

    return clauses.join(' AND ');
  }

  #compilePlaceFilter(
    clauses: string[],
    prefix: string,
    filter: PlaceFilter | undefined,
  ): void {
    if (!filter) return;
    const fields = [filter.name, filter.code, filter.type].filter(Boolean);
    if (fields.length === 0) {
      throw new BadRequestException(
        'PlaceFilter er tomt, men eitt felt må vera sett.',
      );
    }
    if (fields.length > 1) {
      throw new BadRequestException(
        'PlaceFilter kan berre ha eitt felt om gongen, men fleire vart sette.',
      );
    }
    this.#compileStringFilter(clauses, `${prefix}_names`, filter.name);
    this.#compileStringFilter(clauses, `${prefix}_codes`, filter.code);
    if (filter.type) {
      this.#compilePlaceTypeFilter(clauses, `${prefix}_types`, filter.type);
    }
  }

  #compileBibliographyFilter(
    clauses: string[],
    prefix: string,
    filter: BibliographyFilter | undefined,
  ): void {
    if (!filter) return;
    const fields = [
      filter.code,
      filter.author,
      filter.title,
      filter.year,
    ].filter(Boolean);
    if (fields.length === 0) {
      throw new BadRequestException(
        'BibliographyFilter er tomt, men eitt felt må vera sett.',
      );
    }
    if (fields.length > 1) {
      throw new BadRequestException(
        'BibliographyFilter kan berre ha eitt felt om gongen, men fleire vart sette.',
      );
    }
    this.#compileStringFilter(clauses, `${prefix}_codes`, filter.code);
    this.#compileStringFilter(clauses, `${prefix}_authors`, filter.author);
    this.#compileStringFilter(clauses, `${prefix}_titles`, filter.title);
    this.#compileStringFilter(clauses, `${prefix}_years`, filter.year);
  }

  #compileStringFilter(
    clauses: string[],
    attr: string,
    filter: StringFilter | undefined,
  ): void {
    if (!filter) return;

    if (filter.eq !== undefined && filter.eq !== null) {
      clauses.push(`${attr} = "${this.#escape(filter.eq)}"`);
    }
    if (filter.contains !== undefined && filter.contains !== null) {
      clauses.push(`${attr} CONTAINS "${this.#escape(filter.contains)}"`);
    }
    if (filter.startsWith !== undefined && filter.startsWith !== null) {
      clauses.push(`${attr} STARTS WITH "${this.#escape(filter.startsWith)}"`);
    }
    if (filter.in !== undefined && filter.in !== null) {
      const values = filter.in.map((v) => `"${this.#escape(v)}"`).join(', ');
      clauses.push(`${attr} IN [${values}]`);
    }
    if (filter.exists !== undefined && filter.exists !== null) {
      clauses.push(filter.exists ? `${attr} IS NOT EMPTY` : `${attr} IS EMPTY`);
    }
  }

  #compileWordClassFilter(clauses: string[], filter: WordClassFilter): void {
    if (filter.eq !== undefined && filter.eq !== null) {
      clauses.push(`paradigm_tags = "${WordClassToTag[filter.eq]}"`);
    }

    if (filter.in !== undefined && filter.in !== null) {
      const orClauses = filter.in.map(
        (wc) => `paradigm_tags = "${WordClassToTag[wc]}"`,
      );

      if (orClauses.length === 1) {
        clauses.push(orClauses[0]);
      } else {
        clauses.push(`(${orClauses.join(' OR ')})`);
      }
    }
  }

  #compileGenderFilter(clauses: string[], filter: GenderFilter): void {
    const compileOne = (g: Gender): string => {
      if (g === Gender.Ukjent) {
        return `paradigm_tags = "NOUN" AND paradigm_tags != "Masc" AND paradigm_tags != "Fem" AND paradigm_tags != "Neuter"`;
      }

      return `paradigm_tags = "${GenderToTag[g]}"`;
    };

    if (filter.eq !== undefined && filter.eq !== null) {
      clauses.push(compileOne(filter.eq));
    }

    if (filter.in !== undefined && filter.in !== null) {
      const orClauses = filter.in.map(compileOne);

      if (orClauses.length === 1) {
        clauses.push(orClauses[0]);
      } else {
        clauses.push(`(${orClauses.map((c) => `(${c})`).join(' OR ')})`);
      }
    }
  }

  #compileEtymologyLanguageFilter(
    clauses: string[],
    filter: EtymologyLanguageFilter,
  ): void {
    const compileOne = (lang: EtymologyLanguage): string[] =>
      EtymologyLanguageRawCodes[lang].map(
        (c) => `etymology_languages = "${this.#escape(c)}"`,
      );

    if (filter.eq !== undefined && filter.eq !== null) {
      const orClauses = compileOne(filter.eq);

      if (orClauses.length === 1) {
        clauses.push(orClauses[0]);
      } else {
        clauses.push(`(${orClauses.join(' OR ')})`);
      }
    }
    if (filter.in !== undefined && filter.in !== null) {
      const orClauses = filter.in.flatMap(compileOne);

      if (orClauses.length === 1) {
        clauses.push(orClauses[0]);
      } else {
        clauses.push(`(${orClauses.join(' OR ')})`);
      }
    }
  }

  #compilePlaceTypeFilter(
    clauses: string[],
    attr: string,
    filter: PlaceTypeFilter,
  ): void {
    if (filter.eq !== undefined && filter.eq !== null) {
      clauses.push(`${attr} = "${this.#escape(PlaceTypeToRaw[filter.eq])}"`);
    }

    if (filter.in !== undefined && filter.in !== null) {
      const values = filter.in
        .map((t) => `"${this.#escape(PlaceTypeToRaw[t])}"`)
        .join(', ');

      clauses.push(`${attr} IN [${values}]`);
    }
  }

  #escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
