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

import { Injectable } from '@nestjs/common';
import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Args,
  Int,
} from '@nestjs/graphql';
import { WordService } from '../providers';
import {
  Article,
  Definition,
  FlatDefinition,
  WordClass,
  Gender,
  Lemma,
  Dictionary,
  ArticleRelationship,
  RichContent,
  BibliographyReference,
  Dialect,
  DialectFilter,
  WrittenForm,
} from '../models';

@Injectable()
@Resolver(() => Article)
export class ArticleResolver {
  constructor(private wordService: WordService) {}

  @Query(() => Article, {
    description: 'Hentar artikkelen med ein gjeven ID.',
    nullable: true,
  })
  async article(
    @Args('id', {
      type: () => Int,
      description: 'ID-en til artikkelen som skal hentast.',
    })
    id: number,
    @Args('dictionary', {
      type: () => Dictionary,
      description: 'Ordboka som artikkelen skal hentast frå.',
    })
    dictionary: Dictionary,
  ) {
    return this.wordService.getArticle(id, dictionary);
  }

  @Query(() => Article, {
    description: 'Hentar ein tilfeldig artikkel frå ordboka.',
    nullable: true,
  })
  async randomArticle(
    @Args('dictionary', {
      type: () => Dictionary,
      description: 'Ordboka som artikkelen skal hentast frå.',
    })
    dictionary: Dictionary,
  ) {
    return this.wordService.getRandomArticle(dictionary);
  }

  @ResolveField(() => [Definition])
  async definitions(@Parent() article: Article) {
    return this.wordService.getDefinitions(article);
  }

  @ResolveField(() => [FlatDefinition])
  async flatDefinitions(
    @Parent() article: Article,
    @Args('includeHidden', { type: () => Boolean, defaultValue: false })
    includeHidden: boolean,
  ) {
    return this.wordService.getFlatDefinitions(article, includeHidden);
  }

  @ResolveField(() => WordClass)
  async wordClass(@Parent() article: Article) {
    return this.wordService.getWordClass(article);
  }

  @ResolveField(() => [Lemma])
  async lemmas(@Parent() article: Article) {
    return this.wordService.getLemmas(article);
  }

  @ResolveField(() => Gender, { nullable: true })
  async gender(@Parent() article: Article) {
    return this.wordService.getGender(article);
  }

  @ResolveField(() => [ArticleRelationship])
  async relationships(@Parent() article: Article) {
    return this.wordService.getRelationships(article);
  }

  @ResolveField(() => [Article])
  async phrases(@Parent() article: Article) {
    return this.wordService.getPhrases(article);
  }

  @ResolveField(() => [RichContent], { nullable: true })
  async etymology(@Parent() article: Article) {
    return this.wordService.getEtymology(article);
  }

  @ResolveField(() => [RichContent], { nullable: true })
  async pronunciation(@Parent() article: Article) {
    return this.wordService.getPronunciation(article);
  }

  @ResolveField(() => [Dialect], { nullable: true })
  async dialect(
    @Parent() article: Article,
    @Args('includeHidden', { type: () => Boolean, defaultValue: false })
    includeHidden: boolean,
    @Args('filter', { type: () => DialectFilter, nullable: true })
    filter?: DialectFilter,
  ) {
    return this.wordService.getDialect(article, includeHidden, filter);
  }

  @ResolveField(() => [WrittenForm], { nullable: true })
  async writtenForm(@Parent() article: Article) {
    return this.wordService.getWrittenForm(article);
  }

  @ResolveField(() => [BibliographyReference], { nullable: true })
  async olderSources(@Parent() article: Article) {
    return this.wordService.getOlderSources(article);
  }
}
