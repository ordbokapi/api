import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { Definition } from './definition.model';
import { WordClass } from './word-class.model';
import { Paradigm } from './paradigm.model';
import { Gender } from './gender.model';

@ObjectType()
export class Article {
  @Field(() => Int)
  id: number;

  @Field(() => Dictionary)
  dictionary: Dictionary;

  @Field(() => WordClass, { nullable: true })
  wordClass?: WordClass;

  @Field(() => [Paradigm], { nullable: true })
  paradigms?: Paradigm[];

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => [Definition], { nullable: 'itemsAndList' })
  definitions?: Definition[];
}
