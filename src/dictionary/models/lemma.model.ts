import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paradigm } from './paradigm.model';

@ObjectType()
export class Lemma {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  lemma: string;

  @Field(() => Int)
  meaning: number;

  @Field(() => [Paradigm])
  paradigms: Paradigm[];
}
