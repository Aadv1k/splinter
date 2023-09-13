import server from "./server"

import { PORT } from "./config"

import NewsModel from "./models/NewsModel";


server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})

process.on("exit", async () => {
    await NewsModel.close();
})
