export class GraphDataProvider {
  getRandomData() {
    const articleParameters = [
      { articleId: 100431, dictionary: 'Nynorskordboka', depth: 2 },
      { articleId: 68019, dictionary: 'Nynorskordboka', depth: 3 },
      { articleId: 68722, dictionary: 'Nynorskordboka', depth: 3 },
      { articleId: 18652, dictionary: 'Bokmaalsordboka', depth: 3 },
    ];
    const randomIndex = Math.floor(Math.random() * articleParameters.length);
    const { articleId, dictionary, depth } = articleParameters[randomIndex];

    return this.getArticleData(articleId, dictionary, depth);
  }

  getArticleData(articleId, dictionary, depth) {
    const url = `https://api.ordbokapi.org/graphql`;
    const query = `query ArticleGraphQuery($articleId: Int!, $dictionary: Dictionary!, $depth: Int!) {
articleGraph(id: $articleId, dictionary: $dictionary, depth: $depth) {
  nodes {
    id
    lemmas {
      lemma
    }
  }
  edges {
    sourceId
    targetId
  }
}
}
`;

    const variables = {
      articleId,
      dictionary,
      depth,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.errors)
          throw new Error(data.errors.map((error) => error.message).join('\n'));
        return data;
      })
      .then((data) => this.convertToD3Graph(data.data.articleGraph))
      .catch((error) => console.error(error));
  }

  convertToD3Graph(graphData) {
    const nodes = graphData.nodes.map((node) => ({
      id: node.id,
      text: node.lemmas[0].lemma,
    }));
    const links = graphData.edges.map((edge) => ({
      source: edge.sourceId,
      target: edge.targetId,
    }));

    console.log({ nodes, links });

    return { nodes, links };
  }
}
