import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { Definition } from './definition.model';
import { WordClass } from './word-class.model';
import { Gender } from './gender.model';
import { Lemma } from './lemma.model';

@ObjectType()
export class Article {
  @Field(() => Int)
  id: number;

  @Field(() => Dictionary)
  dictionary: Dictionary;

  @Field(() => WordClass, { nullable: true })
  wordClass?: WordClass;

  @Field(() => [Lemma], { nullable: true })
  lemmas?: Lemma[];

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => [Definition], { nullable: true })
  definitions?: Definition[];
}
