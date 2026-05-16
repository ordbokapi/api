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

import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ArticleRelationship } from './article-relationship';
import { RichContent } from './rich-content';
import { GeographicAttestation } from './geographic-attestation.model';
import { BibliographyReference } from './bibliography-reference.model';

@ObjectType({
  description:
    'Ein definisjon av eit ord eller uttrykk, som ligg i ei flat liste.',
})
export class FlatDefinition {
  @Field(() => Int, {
    nullable: true,
    description:
      'Ein valfri unik identifikator for definisjonen, unik i forhold til artikkelen.',
  })
  id?: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Indeksen til definisjonen i lista som denne definisjonen tilhøyrer. Er null om definisjonen er på øvste nivå.',
  })
  parentIndex?: number;

  @Field(() => [RichContent], { description: 'Innhaldet i definisjonen.' })
  content: RichContent[] = [];

  @Field(() => [RichContent], {
    description:
      'Ei liste over døme som illustrerer bruk av ordet eller uttrykket.',
  })
  examples: RichContent[] = [];

  @Field(() => [ArticleRelationship], {
    description:
      'Ei liste over artikkelrelasjonar som er relevante for definisjonen.',
  })
  relationships: ArticleRelationship[] = [];

  @Field(() => [GeographicAttestation], {
    description:
      'Ei liste over geografiske stader der tydinga er heimfesta. Tilgjengeleg for Norsk Ordbok.',
  })
  placeReferences: GeographicAttestation[] = [];

  @Field(() => [BibliographyReference], {
    description:
      'Ei liste over litteraturreferansar knytte til definisjonen. Tilgjengeleg for Norsk Ordbok.',
  })
  literatureReferences: BibliographyReference[] = [];
}
