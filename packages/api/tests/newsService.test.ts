import NewsService, { News } from "../src/services/newsService";

describe("Tests for the news service", () => {
    let service: NewsService;
    let data: News[] = [];

    beforeAll(() => {
        service = new NewsService();
    });

    test("should be able to fetch remote data", async () => {
        data = await service.fetchNewsFromNet();
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toBeTruthy();
    });

    test("should have stored the previous data into a DB", async () => {
        let dataFromDb = await service.fetchNewsFromDB();
        expect(dataFromDb).toEqual(data);
    });
});
