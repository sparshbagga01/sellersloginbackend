import app from "./index.js";
import { PORT } from "./config/variables.js";
import { connectDB } from "./services/database/index.js";

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
