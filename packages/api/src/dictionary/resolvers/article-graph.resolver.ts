import { Injectable } from '@nestjs/common';
import { Resolver, Query, Args, Int, Info } from '@nestjs/graphql';
import { WordService } from '../providers';
import { Dictionary, Word, ArticleGraph, ArticleGraphEdge } from '../models';
import { GraphQLResolveInfo } from 'graphql';

@Injectable()
@Resolver(() => Word)
export class ArticleGraphResolver {
  constructor(private wordService: WordService) {}

  @Query(() => ArticleGraph, {
    nullable: true,
    description: 'Hentar ein graf av artikkelrelasjonar for eit gitt artikkel.',
  })
  async articleGraph(
    @Args('id', {
      type: () => Int,
      description: 'Id-en til artikkelen som skal hentast.',
    })
    articleId: number,
    @Args('dictionary', {
      type: () => Dictionary,
      description: 'Ordboka som artikkelen skal hentast frå.',
    })
    dictionary: Dictionary,
    @Args('depth', {
      type: () => Int,
      description: 'Kor mange nivå i grafen som skal hentast. Maks 3.',
    })
    depth: number,
    @Info() info: GraphQLResolveInfo,
  ) {
    const selections = info.fieldNodes[0].selectionSet?.selections;

    if (!selections) {
      return [];
    }

    const edgeFields: (keyof ArticleGraphEdge)[] = [];

    for (const selection of selections) {
      if (selection.kind === 'Field' && selection.name.value === 'edges') {
        for (const edgeSelection of selection.selectionSet?.selections || []) {
          if (edgeSelection.kind !== 'Field') {
            continue;
          }

          edgeFields.push(edgeSelection.name.value as keyof ArticleGraphEdge);
        }

        break;
      }
    }

    return this.wordService.getArticleGraph(
      articleId,
      dictionary,
      Math.min(depth, 3),
      edgeFields,
    );
  }
}
