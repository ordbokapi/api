import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Dictionary } from './dictionary.model';
import { Definition } from './definition.model';
import { WordClass } from './word-class.model';
import { Gender } from './gender.model';
import { Lemma } from './lemma.model';

@ObjectType({
  description:
    'Representerer ein artikkel i eit leksikon eller ordbok, med detaljert informasjon om ord og deira bruk.',
})
export class Article {
  constructor(article?: Partial<Article>) {
    Object.assign(this, article);
  }

  @Field(() => Int, { description: 'Ein unik identifikator for artikkelen.' })
  id: number;

  @Field(() => Dictionary, { description: 'Ordboka som artikkelen tilhøyrer.' })
  dictionary: Dictionary;

  @Field(() => WordClass, {
    nullable: true,
    description: 'Ordklassen til ordet i artikkelen, om tilgjengeleg.',
  })
  wordClass?: WordClass;

  @Field(() => [Lemma], {
    nullable: true,
    description:
      'Liste over lemmaer (grunnformer av ord) som artikkelen omhandlar.',
  })
  lemmas?: Lemma[];

  @Field(() => Gender, {
    nullable: true,
    description: 'Kjønn av ordet i artikkelen, om relevant.',
  })
  gender?: Gender;

  @Field(() => [Definition], {
    nullable: true,
    description: 'Liste over definisjonar av ordet i artikkelen.',
  })
  definitions?: Definition[];

  @Field(() => [Article], {
    nullable: true,
    description:
      'Liste over artiklar som inkluderar denne artikkelen som ein del av eit uttrykk.',
  })
  phrases?: Article[];
}
