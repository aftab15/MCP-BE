import fetch from "node-fetch";

const API_KEY = "pub_995461faaaca47d283c318a344949ab0"; // store in .env

export async function getNews({ query = "AI" }) {
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${query}&language=en`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (!data.results) throw new Error("Failed to fetch news");
  return {
    query,
    top: data.results.slice(0, 3).map((a) => ({
      title: a.title,
      source: a.source_id,
      link: a.link,
    })),
  };
}
