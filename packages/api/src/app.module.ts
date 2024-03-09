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
          document: `query ExampleSuggestionsQuery($word: String!) {
  suggestions(word: $word) {
    exact {
      word
      articles {
        dictionary
        wordClass
        gender
        definitions {
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
`,
          variables: {
            word: 'klasse',
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
