import "dotenv/config";
import { createApp } from "../src/app.js";

// Vercel's Node.js runtime invokes the default export as an (req, res) handler.
// An Express app is itself callable as (req, res), so exporting it directly works.
export default createApp();
