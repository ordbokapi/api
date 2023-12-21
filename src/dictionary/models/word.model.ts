import { Field, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { Article } from './article.model';

@ObjectType()
export class Word {
  @Field()
  word: string;

  @Field(() => [Dictionary])
  dictionaries: Dictionary[];

  @Field(() => [Article], { nullable: true })
  articles?: Article[];
}
