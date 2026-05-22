// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This file is part of Ordbok API.
//
// Ordbok API is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { AppController } from './app.controller';
import { DictionaryModule } from './dictionary/dictionary.module';
import { RequestLoggerMiddleware } from './request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          embed: {
            initialState: {
              pollForSchemaUpdates: process.env.NODE_ENV !== 'production',
            },
          },
          document: `# Slå opp eit ord.
query LookUp($word: String!) {
  suggestions(word: $word) {
    exact {
      word
      articles {
        id
        dictionary
        wordClass
        gender
        flatDefinitions {
          parentIndex
          content {
            textContent
          }
          examples {
            textContent
          }
        }
      }
    }
  }
}

# Søk etter ord.
query Search($query: String!) {
  articles(
    query: $query
    dictionaries: [Bokmaalsordboka, Nynorskordboka]
    first: 10
  ) {
    totalCount
    facets {
      wordClass {
        value
        count
      }
      gender {
        value
        count
      }
    }
    edges {
      node {
        id
        dictionary
        lemmas {
          lemma
        }
        wordClass
        gender
        flatDefinitions {
          parentIndex
          content {
            textContent
          }
          examples {
            textContent
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Kva ord finst i bergensk?
query DialectWords($place: String!) {
  articles(
    dictionaries: [NorskOrdbok]
    filter: {
      wordClass: { eq: Substantiv }
      dialectPlace: { name: { eq: $place } }
    }
    first: 10
  ) {
    totalCount
    edges {
      node {
        id
        lemmas {
          lemma
        }
        flatDefinitions {
          parentIndex
          content {
            textContent
          }
          examples {
            textContent
          }
        }
        dialect {
          subcategories {
            forms {
              form
              sources {
                place {
                  name
                  type
                }
              }
            }
          }
        }
      }
    }
  }
}

# Kva ord har Ivar Aasen skrive i sine verk?
query WordsAttestedByAuthor($author: String!) {
  articles(
    dictionaries: [NorskOrdbok]
    filter: { writtenFormSource: { author: { contains: $author } } }
    first: 10
  ) {
    totalCount
    edges {
      node {
        id
        lemmas {
          lemma
        }
        writtenForm {
          intro
          variants {
            writtenForm
            sources {
              title
              author
              id
            }
          }
        }
      }
    }
  }
}

# Kva substantiv kjem frå norrønt?
query NorseOriginNouns {
  articles(
    dictionaries: [Bokmaalsordboka]
    filter: { wordClass: { eq: Substantiv }, etymologyLanguage: { eq: Norroent } }
    first: 10
  ) {
    totalCount
    facets {
      gender {
        value
        count
      }
    }
    edges {
      node {
        id
        lemmas {
          lemma
        }
        gender
      }
    }
  }
}

# Slå opp eit ord med strukturert tekst og lenkjer til andre artiklar i definisjonane.
query LookUpRichContent($word: String!) {
  suggestions(word: $word) {
    exact {
      word
      articles {
        id
        dictionary
        wordClass
        gender
        flatDefinitions {
          parentIndex
          content {
            ...richContentFields
          }
          examples {
            ...richContentFields
          }
        }
      }
    }
  }
}

fragment richContentFields on RichContent {
  textContent
  richContent {
    ... on RichContentTextSegment {
      type
      content
    }
    ... on RichContentArticleSegment {
      type
      content
      article {
        id
        dictionary
      }
    }
    ... on RichContentFormattedTextSegment {
      type
      content
      formatted
    }
    ... on RichContentFractionSegment {
      type
      content
      numerator
      denominator
    }
  }
}
`,
          variables: {
            word: 'klasse',
            query: 'sjø',
            place: 'Bergen',
            author: 'Aasen, Ivar',
          },
        }),
        ApolloServerPluginInlineTrace(),
      ],
      introspection: true, // public API for use by anyone, so introspection makes sense
    }),
    DictionaryModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
