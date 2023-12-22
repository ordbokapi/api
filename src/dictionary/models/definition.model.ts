import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Definition {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field()
  content?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  examples?: string[];

  @Field(() => [Definition], { nullable: 'itemsAndList' })
  subDefinitions?: Definition[];
}
