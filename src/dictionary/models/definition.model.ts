import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ArticleRelationship } from './article-relationship';
import { RichContent } from './rich-content';

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

  @Field(() => [Definition], {
    description:
      'Ei liste over underdefinisjonar relatert til hovuddefinisjonen.',
  })
  subDefinitions: Definition[] = [];
}
