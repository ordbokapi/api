import { Field, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { Article } from './article.model';

@ObjectType({ description: 'Representerer eit ord med tilhøyrande artiklar.' })
export class Word {
  @Field({ description: 'Det faktiske ordet som blir representert.' })
  word: string;

  @Field(() => [Dictionary], {
    description: 'Liste av ordbøker som inneheld dette ordet.',
  })
  dictionaries: Dictionary[];

  @Field(() => [Article], {
    nullable: true,
    description: 'Artiklar som gir informasjon om ordet.',
  })
  articles?: Article[];
}
