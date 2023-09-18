import fetchNews from "../src/services/news";

describe("Tests for the news service", () => {
    test("should fetch data from the API", async () => {
        const data = await fetchNews("in");
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toBeTruthy();
    }, 10000);
});
