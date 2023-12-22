import { InflectionTag } from './inflection-tag.model';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Inflection {
  @Field(() => [InflectionTag])
  tags: InflectionTag[];

  @Field(() => String, { nullable: true })
  wordForm?: string;
}
