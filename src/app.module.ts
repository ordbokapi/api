import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DictionaryModule } from './dictionary/dictionary.module';
import { RequestLoggerMiddleware } from './request-logger.middleware';
import { MemcachedProvider } from './providers/memcached.provider';

@Module({
  imports: [
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
  getSuggestions(word: $word) {
    exact {
      word
      articles {
        dictionary
        wordClass
        gender
        definitions {
          content
          examples
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
  providers: [AppService, MemcachedProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
