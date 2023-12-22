import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Lemma {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  lemma: string;

  @Field(() => Int)
  meaning: number;
}
