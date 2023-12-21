import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { WordClass } from './word-class.model';

@ObjectType()
export class Definition {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => Dictionary)
  dictionary: Dictionary;

  @Field(() => WordClass)
  wordClass: WordClass;

  @Field()
  content?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  examples?: string[];

  @Field(() => [Definition], { nullable: 'itemsAndList' })
  subDefinitions?: Definition[];
}
