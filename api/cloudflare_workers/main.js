export default {
    async fetch(request, env) {
        // if (request.method !== "POST")
        //   return new Response("post only", { status: 400 });
        return await handleRequest(request);
    }
}

const SUB_URLS = {
    file: "https://raw.githubusercontent.com/txperl/airAnime/master/api/_examples/data/{kt}",
    agefans: "https://api.agefans.app/v2/search?query={kt}",
    nicotv: "http://www.nicotv.me/video/search/{kt}.html",
    mikanani: "https://mikanani.me/Home/Search?searchstr={kt}",
    copymanga: "https://copymanga.site/api/v3/search/comic?format=json&platform=1&limit=10&offset=1&q={kt}",
    moxmoe: "https://mox.moe/list.php?s={kt}",
};

async function handleRequest(request) {
    const url = new URL(request.url);
    const paths = url.pathname.split("/").slice(2);

    if (paths.length <= 1)
        return new Response(JSON.stringify(SUB_URLS), {
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        });

    const subName = paths[0];
    const kt = paths.slice(1).join("");

    if (!SUB_URLS[subName] || !kt)
        return new Response("missing subname or keyword", { status: 400 });

    const finalUrl = SUB_URLS[subName].replace("{kt}", kt);

    let response = await fetch(finalUrl, {
        headers: {
            "Referer": finalUrl,
            "User-Agent": "Cloudflare Workers",
            "platform": "1",
        }
    });
    response = new Response(response.body, response);
    response.headers.set("Access-Control-Allow-Headers", "*");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.append("Vary", "Origin");
    return response;
}