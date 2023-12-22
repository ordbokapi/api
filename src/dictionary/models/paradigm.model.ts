import { Inflection } from './inflection.model';
import { Int, Field, ObjectType } from '@nestjs/graphql';
import { InflectionTag } from './inflection-tag.model';

@ObjectType()
export class Paradigm {
  @Field(() => Int)
  id: number;

  @Field(() => [Inflection])
  inflections: Inflection[];

  @Field(() => [InflectionTag])
  tags: InflectionTag[];
}
