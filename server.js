import app from "./index.js";
import { connectDB } from "./services/database/index.js";

async function startServer() {
  await connectDB();

  const port = process.env.PORT || 8080;
  const host = "0.0.0.0";

  app.listen(port, host, () => {
    console.log(`✅ Server running on http://${host}:${port}`);
  });
}

startServer();
