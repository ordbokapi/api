import { registerEnumType } from '@nestjs/graphql';

export enum ArticleRelationshipType {
  Related = 'Relatert',
  SeeAlso = 'SjaaOg',
  Usage = 'Bruk',
  Synonym = 'Synonym',
  Antonym = 'Motsetning',
}

registerEnumType(ArticleRelationshipType, {
  name: 'ArticleRelationshipType',
  description: 'Typen av artikkelrelasjonen.',
});
