import NewsService, { News } from "../src/services/newsService";
import NewsModel from "../src/models/NewsModel";

describe("Tests for the news service", () => {
    let service: NewsService;
    let data: News[] = [];

    beforeAll(async () => {
        service = new NewsService("in");
        await NewsModel.init();
    });

    test("should be able to fetch remote data", async () => {
        data = await service.fetchNews();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toBeTruthy();

        await service.cacheNews(data);
    });

    test("should have stored the previous data into a DB", async () => {
        let dataFromDb = await service.getNews();
        expect(dataFromDb.find(e => e.title == data[0].title)).toBeTruthy();
    });

    afterAll(async () => {
        /* idk do something? */
    })
});
