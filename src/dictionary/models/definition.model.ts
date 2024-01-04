import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Representerer ein definisjon av eit ord eller uttrykk, inkludert døme og underdefinisjonar.',
})
export class Definition {
  @Field(() => Int, {
    nullable: true,
    description:
      'Ein valfri unik identifikator for definisjonen, unik i forhold til artikkelen.',
  })
  id?: number;

  @Field({ description: 'Innhaldet i definisjonen.' })
  content?: string;

  @Field(() => [String], {
    nullable: 'itemsAndList',
    description:
      'Ei liste over døme som illustrerer bruk av ordet eller uttrykket.',
  })
  examples?: string[];

  @Field(() => [Definition], {
    nullable: 'itemsAndList',
    description:
      'Ei liste over underdefinisjonar relatert til hovuddefinisjonen.',
  })
  subDefinitions?: Definition[];
}
