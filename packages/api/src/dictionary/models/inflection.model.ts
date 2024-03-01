import { InflectionTag } from './inflection-tag.model';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Representerer bøyingsinformasjon for eit ord, inkludert bøyingsmerke og ordform.',
})
export class Inflection {
  @Field(() => [InflectionTag], {
    description: 'Liste av bøyingsmerke assosiert med ordet.',
  })
  tags: InflectionTag[];

  @Field(() => String, {
    nullable: true,
    description: 'Den spesifikke bøygde forma av ordet.',
  })
  wordForm?: string;
}
