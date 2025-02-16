import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.REACT_APP_NEO4J_URI,
  neo4j.auth.basic(
    process.env.REACT_APP_NEO4J_USER,
    process.env.REACT_APP_NEO4J_PASSWORD
  )
);

export const runQuery = async (query, params = {}) => {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result;
  } finally {
    await session.close();
  }
};

export const logNeo4jQuery = (query) => {
  console.log(`Neo4j Query: ${query}`);
  return query;
};