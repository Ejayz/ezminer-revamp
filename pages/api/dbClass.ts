import { Pool, PoolClient } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
// Create a pool with your PostgreSQL connection config
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT || 5432),
  // Other pool configuration options can be added here
});

// Define a type for your connection instance
type ConnectionInstance = {
  query: (text: string, values?: any[]) => Promise<any>;
  getClient: () => Promise<PoolClient>;
};

// Declare a global variable 'instance'
declare global {
  var instance: undefined | ConnectionInstance;
}

// Initialize 'instance' using the global variable or create a new instance
const instance = globalThis.instance ?? createConnectionInstance();

// Function to create a new ConnectionInstance
function createConnectionInstance(): ConnectionInstance {
  return {
    query: (text: string, values?: any[]) => pool.query(text, values),
    getClient: () => pool.connect(),
  };
}

// Log the Node environment
console.log("Node Env", process.env.NODE_ENV);

// If not in production, assign the 'instance' to the global variable
if (process.env.NODE_ENV !== "production") globalThis.instance = instance;


// Export the 'instance' as the default export of the module
export default instance;
