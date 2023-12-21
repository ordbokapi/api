import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { Definition } from './definition.model';

@ObjectType()
export class Article {
  @Field(() => Int)
  id: number;

  @Field(() => Dictionary)
  dictionary: Dictionary;

  @Field(() => [Definition], { nullable: 'itemsAndList' })
  definitions?: Definition[];
}
