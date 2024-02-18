import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paradigm } from './paradigm.model';

@ObjectType({
  description:
    'Representerer grunnforma av eit ord, med tilhøyrande betyding og bøyingsparadigme.',
})
export class Lemma {
  @Field(() => Int, { description: 'Ein unik identifikator for lemmaet.' })
  id: number;

  @Field(() => String, { description: 'Grunnforma av ordet.' })
  lemma: string;

  @Field(() => Int, {
    description: 'Numerisk referansenummer til betydinga av lemmaet.',
  })
  meaning: number;

  @Field(() => [Paradigm], {
    description: 'Liste av bøyingsparadigme assosiert med lemmaet.',
  })
  paradigms: Paradigm[];

  @Field(() => Boolean, {
    description: 'Om lemmaet er eit verb med kløyvd infinitiv.',
  })
  splitInfinitive: boolean;
}
