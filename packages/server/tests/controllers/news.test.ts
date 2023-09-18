import * as newsController from "../../src/controllers/news"
import NewsModel from "../../src/models/NewsModel"

describe("Tests for the news controller", () => {
    beforeAll(async () => {
        await NewsModel.init();
    })

    afterAll(async () => {
        await NewsModel.close();
    })

    test.todo("should return news without any params");
    test.todo("should return news sorted according to the `sort=` param");
})

