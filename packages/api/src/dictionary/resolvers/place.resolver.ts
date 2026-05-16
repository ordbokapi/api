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
import { PlaceEntry, UibDbService } from 'ordbokapi-common';
import { Place, PlaceConnection } from '../models';
import { RawPlaceTypeMap } from '../models/place-type.model';

function placeEntryToModel(entry: PlaceEntry): Place {
  return {
    id: entry.id,
    name: entry.name || entry.code,
    code: entry.code || undefined,
    type: RawPlaceTypeMap[entry.type],
    parentId: entry.parentId,
    municipalityNr: entry.municipalityNr || undefined,
  };
}

@Injectable()
@Resolver(() => Place)
export class PlaceResolver {
  constructor(private readonly data: UibDbService) {}

  @Query(() => Place, {
    nullable: true,
    description: 'Hent ein geografisk stad etter ID.',
  })
  async place(
    @Args('id', { type: () => Int, description: 'Stad-ID.' })
    id: number,
  ): Promise<Place | null> {
    const entry = await this.data.getPlaceById(id);
    if (!entry) return null;
    return placeEntryToModel(entry);
  }

  @Query(() => PlaceConnection, {
    description: 'Søk i geografiske stader.',
  })
  async places(
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
  ): Promise<PlaceConnection> {
    const limit = Math.min(first ?? 20, 100);

    const result = await this.data.searchPlaces(query ?? '', {
      limit,
      offset: offset ?? 0,
    });

    return {
      entries: result.entries.map(placeEntryToModel),
      totalCount: result.total,
    };
  }
}

@Injectable()
@Resolver(() => Place)
export class PlaceFieldResolver {
  constructor(private readonly data: UibDbService) {}

  @ResolveField(() => Place, {
    nullable: true,
    description: 'Overordna stad i hierarkiet.',
  })
  async parent(@Parent() place: Place): Promise<Place | null> {
    if (!place.parentId) return null;
    const entry = await this.data.getPlaceById(place.parentId);
    if (!entry) return null;
    return placeEntryToModel(entry);
  }

  @ResolveField(() => [Place], {
    nullable: true,
    description: 'Underordna stader i hierarkiet.',
  })
  async children(@Parent() place: Place): Promise<Place[]> {
    const entries = await this.data.getPlaceChildren(place.id);
    return entries.map(placeEntryToModel);
  }
}
