import { Inflection } from './inflection.model';
import { Int, Field, ObjectType } from '@nestjs/graphql';
import { InflectionTag } from './inflection-tag.model';

@ObjectType({
  description:
    'Representerer eit sett av bøyingsmønster for ord, inkludert spesifikke bøyingsformer og knyta til merke.',
})
export class Paradigm {
  @Field(() => Int, {
    description: 'Ein unik identifikator for bøyingsparadigmet.',
  })
  id: number;

  @Field(() => [Inflection], {
    description: 'Liste av bøyingsformer assosiert med dette paradigmet.',
  })
  inflections: Inflection[];

  @Field(() => [InflectionTag], {
    description: 'Liste av merke som er relevante for dette bøyingsparadigmet.',
  })
  tags: InflectionTag[];
}
