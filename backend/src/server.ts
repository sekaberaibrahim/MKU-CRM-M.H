import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./lib/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Manor CRM API running at http://localhost:${env.port}`);
});
