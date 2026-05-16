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
    'Ein definisjon av eit ord eller uttrykk, inkludert døme og underdefinisjonar.',
})
export class Definition {
  constructor(definiton?: Partial<Definition>) {
    Object.assign(this, definiton);
  }

  @Field(() => Int, {
    nullable: true,
    description:
      'Ein valfri unik identifikator for definisjonen, unik i forhold til artikkelen.',
  })
  id?: number;

  @Field(() => [RichContent], { description: 'Innhaldet i definisjonen.' })
  content: RichContent[] = [];

  @Field(() => [RichContent], {
    description:
      'Ei liste over døme som illustrerer bruk av ordet eller uttrykket.',
  })
  examples: RichContent[] = [];

  @Field(() => [ArticleRelationship], {
    description:
      'Ei liste over artiklar som er relaterte til denne definisjonen.',
  })
  relationships: ArticleRelationship[] = [];

  @Field(() => [Definition], {
    deprecationReason:
      'Bruk flatDefinitions på artikkelen i staden. Dette feltet skal tidlegast fjernast 2026-08-01.',
    description:
      'Ei liste over underdefinisjonar som tilhøyrer denne definisjonen.',
  })
  subDefinitions: Definition[] = [];

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
