import { DataAPIClient } from "@datastax/astra-db-ts";

// Configuración de Astra DB
const ASTRA_DB_TOKEN = process.env.REACT_APP_ASTRA_DB_TOKEN
const ASTRA_DB_API_ENDPOINT = process.env.REACT_APP_ASTRA_DB_API_ENDPOINT

// Inicializar el cliente
const client = new DataAPIClient(ASTRA_DB_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT);

// Servicio para ejecutar consultas
export const executeQuery = async (collectionName, query = {}, options = {}) => {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.find(query, options);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Servicio para listar colecciones
export const listCollections = async () => {
  try {
    const collections = await db.listCollections();
    return collections;
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
};