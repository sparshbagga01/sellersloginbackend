import app from "./index.js";
import { connectDB } from "./services/database/index.js";

async function startServer() {
  await connectDB();

  const port = process.env.PORT || 8080;


  app.listen(port, () => {
    console.log(`✅ Server running on :${port}`);
  });
}

startServer();
