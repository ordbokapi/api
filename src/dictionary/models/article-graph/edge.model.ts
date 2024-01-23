import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ArticleRelationshipType } from '../article-relationship';

@ObjectType({
  description: 'Representerer ein kant i ein graf av artikkelrelasjonar.',
})
export class ArticleGraphEdge {
  constructor(edge?: Partial<ArticleGraphEdge>) {
    Object.assign(this, edge);
  }

  @Field(() => Int, {
    description: 'Artikkelidentifikator for startnoden i kanten.',
  })
  sourceId: number;

  @Field(() => Int, {
    description: 'Artikkelidentifikator for sluttnoden i kanten.',
  })
  targetId: number;

  @Field(() => ArticleRelationshipType, {
    description: 'Typen til artikkelrelasjonen.',
  })
  type: ArticleRelationshipType;

  @Field(() => Int, {
    nullable: true,
    description:
      'Ein valfri unik identifikator for definisjonen der artikkelrelasjonen er definert, unik i forhold til artikkelen.',
  })
  sourceDefinitionId?: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Indeks for definisjonen der artikkelrelasjonen er definert, unik i forhold til artikkelen.',
  })
  sourceDefinitionIndex?: number;
}
