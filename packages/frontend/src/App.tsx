import Article from "./components/Article"


const articles = [
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929809",
    title: "G20 Summit: Bitter for Congress, Sweet for BJP. Bittersweet for INDIA - News18",
    description: "The Congress has cried foul over the alleged snub to LoP Mallikarjun Kharge and is upset with INDIA allies for attending the President’s G20 dinner. The BJP, meanwhile, is pushing ahead with plans to showcase the G20 success among voters",
    left_bias: 5, // Arbitrary value
    right_bias: 3, // Arbitrary value
    url: "https://www.news18.com/politics/g20-summit-bitter-for-congress-sweet-for-bjp-bittersweet-for-india-8572432.html",
  },
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929810",
    title: "UK brings forward winter top-up vaccines amid new Covid variant fears - The Tribune India",
    description: "Description not available",
    left_bias: 2, // Arbitrary value
    right_bias: 7, // Arbitrary value
    url: "https://www.tribuneindia.com/news/health/uk-brings-forward-winter-top-up-vaccines-amid-new-covid-variant-fears-543385",
  },
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929811",
    title: "One day left! Apple Wonderlust event: iPhone 15, Apple Watch Series 9, Ultra, and AirPods expected | Mint - Mint",
    description: "Apple's ‘Wonderlust’ event on Sept 12 will feature the launch of iPhone 15 series, Apple Watch 9, and AirPods Pro 2nd gen.",
    left_bias: 1, // Arbitrary value
    right_bias: 9, // Arbitrary value
    url: "https://www.livemint.com/technology/tech-news/one-day-left-apple-wonderlust-event-iphone-15-apple-watch-series-9-ultra-and-airpods-expected-11694423767134.html",
  },
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929812",
    title: "Stock Market LIVE Updates: Nifty hits 20,000, Sensex surges 540 pts; Adani Enterprises, RVNL most active - Moneycontrol",
    description: "The BSE midcap and Smallcap indices hits fresh 52-week high with a gain of 1 percent and 0.7 percent respectively.",
    left_bias: 4, // Arbitrary value
    right_bias: 6, // Arbitrary value
    url: "https://www.moneycontrol.com/news/business/stocks/stock-market-live-sensex-nifty-50-share-price-gift-nifty-latest-updates-11-09-2023-11344651.html",
  },
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929813",
    title: "Over 7,000 dengue cases reported in Karnataka, CM Siddaramaiah instructs officials to take precautionary measures - Deccan Herald",
    description: "Bengaluru, Sep 11 (PTI) Amid a surge in dengue cases in Karnataka, Chief Minister Siddaramaiah on Monday said he has instructed officials to take all necessary precautionary measures to prevent spread of the vector borne disease and urged the people to give u…",
    left_bias: 7, // Arbitrary value
    right_bias: 2, // Arbitrary value
    url: "https://www.deccanherald.com/india/karnataka/over-7000-dengue-cases-reported-in-karnataka-cm-siddaramaiah-instructs-officials-to-take-precautionary-measures-2681348",
  },
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929814",
    title: "India vs Pakistan Live Updates, Asia Cup 2023: Start Of Reserve Day Delayed, Covers On - NDTV Sports",
    description: "Asia Cup 2023, IND vs PAK Live: The match will restart from 4:40 PM with Team India resuming their innings at 147/2 in 24.1 overs",
    left_bias: 6, // Arbitrary value
    right_bias: 4, // Arbitrary value
    url: "https://sports.ndtv.com/cricket/ind-vs-pak-live-score-asia-cup-2023-india-vs-pakistan-match-live-updates-on-reserve-day-4378637",
  },
  {
    news_id: "e8779fa2-628e-4af3-a945-b8908c929815",
    title: "On Udhhav's 'Godhra 2 alert', minister says, 'Don't know what Balasaheb….' - Hindustan Times",
    description: "Uddhav Thackeray's hint that there might be a Godhra-like incidents after Ram Mandir's inauguration has created a new controversy.",
    left_bias: 8, // Arbitrary value
    right_bias: 1, // Arbitrary value
    url: "https://www.hindustantimes.com/india-news/on-udhhavs-godhra-2-alert-union-minister-says-dont-know-what-his-father-balasaheb-101694424059180.html",
  },
];

function App() {
  return (
    <>

    <main className="w-[80%] mx-auto">
      <nav className="w-full">
        <div className="text-4xl text-gray-drk flex justify-between">
          <span className="text-lime">Spli</span><span>nter</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-6 my-4 px-2 md:px-0 md:grid-cols-2 md:gap-8">
        {articles.map(article => {
          return <Article {...article} />
        })}
      </div>

    </main>
    </>
  )
}

export default App;
