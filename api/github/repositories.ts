// eslint-disable-next-line import/no-extraneous-dependencies
import { NowRequest, NowResponse } from "@now/node";
import { graphql } from "@octokit/graphql";

export default async (request: NowRequest, response: NowResponse): Promise<void> => {
  const { user } = await graphql(
    `
      {
        user(login: "mika-f") {
          pinnableItems(first: 10, types: [REPOSITORY]) {
            edges {
              node {
                ... on Repository {
                  description
                  forks {
                    totalCount
                  }
                  nameWithOwner
                  primaryLanguage {
                    color
                    name
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  const items: any[] = user.pinnableItems.edges.map(w => w.node).sort((a, b) => b.stargazers.totalCount - a.stargazers.totalCount);

  response.setHeader("Cache-Control", "max-age=3600, public");
  response.status(200).send(items);
};
