import { Field, ObjectType } from '@nestjs/graphql';
import { Article } from '../article.model';
import { Dictionary } from '../dictionary.model';
import { ArticleGraphEdge } from './edge.model';

@ObjectType({
  description:
    'Representerer ein graf av artikkelrelasjonar, der kvar node er ein artikkel og kvar kant er ein artikkelrelasjon.',
})
export class ArticleGraph {
  constructor(graph?: Partial<ArticleGraph>) {
    Object.assign(this, graph);
  }

  @Field(() => Dictionary, {
    description: 'Ordboka som grafen er henta frå.',
  })
  dictionary: Dictionary;

  @Field(() => [Article], {
    description: 'Ei liste over artikkelane som er med i grafen.',
  })
  nodes: Article[] = [];

  @Field(() => [ArticleGraphEdge], {
    description:
      'Ei liste over artikkelidentifikatorar som er med i grafen, der kvar artikkelidentifikator er ein kant i grafen.',
  })
  edges: ArticleGraphEdge[] = [];
}
