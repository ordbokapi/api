import { Field, ObjectType } from '@nestjs/graphql';
import { Word } from './word.model';

@ObjectType({
  description:
    'Representerer ei gruppe ordforslag basert på ulike søkjekriterium.',
})
export class Suggestions {
  @Field(() => [Word], {
    nullable: true,
    description: 'Liste av ord som matchar søkjeordet.',
  })
  exact?: Word[];

  @Field(() => [Word], {
    nullable: true,
    description: 'Liste av ord som er bøyingsformer av søkjeordet.',
  })
  inflections?: Word[];

  @Field(() => [Word], {
    nullable: true,
    description: 'Liste av ord som er funne ved fritekstsøk på søkjeordet.',
  })
  freetext?: Word[];

  @Field(() => [Word], {
    nullable: true,
    description: 'Liste av ord som liknar på søkjeordet.',
  })
  similar?: Word[];
}
