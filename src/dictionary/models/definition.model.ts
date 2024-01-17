import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ArticleRelationship } from './article-relationship.model';

@ObjectType({
  description:
    'Representerer ein definisjon av eit ord eller uttrykk, inkludert døme og underdefinisjonar.',
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

  @Field({ description: 'Innhaldet i definisjonen.' })
  content?: string;

  @Field(() => [String], {
    description:
      'Ei liste over døme som illustrerer bruk av ordet eller uttrykket.',
  })
  examples: string[] = [];

  @Field(() => [ArticleRelationship], {
    description:
      'Ei liste over bruksområde for ordet eller uttrykket, som kan vera nyttig for å forstå konteksten det blir brukt i.',
  })
  usages: ArticleRelationship[] = [];

  @Field(() => [ArticleRelationship], {
    description: 'Ei liste over artiklar som er relatert til definisjonen.',
  })
  seeAlso: ArticleRelationship[] = [];

  @Field(() => [Definition], {
    description:
      'Ei liste over underdefinisjonar relatert til hovuddefinisjonen.',
  })
  subDefinitions: Definition[] = [];
}
