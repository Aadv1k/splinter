interface NewsBias {
    right: number;
    center: number;
    left: number;
}

interface NewsSource {
    site: string;
    link: string;
}

interface News {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    bias: NewsBias;
    source: NewsSource;
}

export default class NewsService {
    async fetchNewsFromDB(): Promise<Array<News>> {
        return new Promise((resolve, reject) => {
            reject("Not implemented");
        })
    }

    async fetchNewsFromNet(): Promise<Array<News>> {
        return new Promise((resolve, reject) => {
            reject("Not implemented");
        })
    }

    async cacheNews(): Promise<Array<News>> {
        return new Promise((resolve, reject) => {
            reject("Not implemented");
        })
    }

}
