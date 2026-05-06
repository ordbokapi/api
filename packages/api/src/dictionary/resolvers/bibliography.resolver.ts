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
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UibDbService } from 'ordbokapi-common';
import {
  Bibliography,
  BibliographyConnection,
  BibliographyReference,
} from '../models';

@Injectable()
@Resolver(() => Bibliography)
export class BibliographyResolver {
  constructor(private readonly data: UibDbService) {}

  @Query(() => Bibliography, {
    nullable: true,
    description: 'Hent ei bibliografisk kjelde etter ID.',
  })
  async bibliography(
    @Args('id', { type: () => Int, description: 'Bibliografisk ID.' })
    id: number,
  ): Promise<Bibliography | null> {
    return (await this.data.getBibliographyById(id)) ?? null;
  }

  @Query(() => BibliographyConnection, {
    description: 'Søk i bibliografiske kjelder.',
  })
  async bibliographies(
    @Args('query', {
      type: () => String,
      nullable: true,
      description: 'Fritekstsøk.',
    })
    query: string | undefined,
    @Args('first', {
      type: () => Int,
      nullable: true,
      description: 'Talet på resultat å hente. Maks 100.',
    })
    first: number | undefined,
    @Args('offset', {
      type: () => Int,
      nullable: true,
      description: 'Offset for paginering.',
    })
    offset: number | undefined,
  ): Promise<BibliographyConnection> {
    const limit = Math.min(first ?? 20, 100);

    const result = await this.data.searchBibliography(query ?? '', {
      limit,
      offset: offset ?? 0,
    });

    return {
      entries: result.entries,
      totalCount: result.total,
    };
  }
}

@Injectable()
@Resolver(() => Bibliography)
export class BibliographyFieldResolver {
  constructor(private readonly data: UibDbService) {}

  @ResolveField(() => String, {
    nullable: true,
    description: 'Forfattar(ar) av verket.',
  })
  async author(@Parent() bib: Bibliography): Promise<string | null> {
    if (bib.author) return bib.author;
    if (bib.author === '') return null;
    const entry = await this.data.getBibliographyById(bib.id);
    return entry?.author || null;
  }

  @ResolveField(() => String, {
    nullable: true,
    description: 'Tittelen på verket.',
  })
  async title(@Parent() bib: Bibliography): Promise<string | null> {
    if (bib.title) return bib.title;
    if (bib.title === '') return null;
    const entry = await this.data.getBibliographyById(bib.id);
    return entry?.title || null;
  }

  @ResolveField(() => String, {
    nullable: true,
    description: 'Utgjevingsår.',
  })
  async year(@Parent() bib: Bibliography): Promise<string | null> {
    if (bib.year) return bib.year;
    if (bib.year === '') return null;
    const entry = await this.data.getBibliographyById(bib.id);
    return entry?.year || null;
  }
}

@Injectable()
@Resolver(() => BibliographyReference)
export class BibliographyReferenceFieldResolver {
  constructor(private readonly data: UibDbService) {}

  @ResolveField(() => String, {
    nullable: true,
    description: 'Forfattar(ar) av verket.',
  })
  async author(@Parent() ref: BibliographyReference): Promise<string | null> {
    if (ref.author) return ref.author;
    if (ref.author === '') return null;
    const entry = await this.data.getBibliographyById(ref.id);
    return entry?.author || null;
  }

  @ResolveField(() => String, {
    nullable: true,
    description: 'Tittelen på verket.',
  })
  async title(@Parent() ref: BibliographyReference): Promise<string | null> {
    if (ref.title) return ref.title;
    if (ref.title === '') return null;
    const entry = await this.data.getBibliographyById(ref.id);
    return entry?.title || null;
  }

  @ResolveField(() => String, {
    nullable: true,
    description: 'Utgjevingsår.',
  })
  async year(@Parent() ref: BibliographyReference): Promise<string | null> {
    if (ref.year) return ref.year;
    if (ref.year === '') return null;
    const entry = await this.data.getBibliographyById(ref.id);
    return entry?.year || null;
  }
}
