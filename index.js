const express = require('express');
const api = require("./api");
const test = require('./test')
const app = express();
const port = 8080;
const axios = require("axios");
const cheerio = require("cheerio"); 

function getMangaById(name, id) {
    var return_data;
    const nick = name;
    let bay; // Declare a variável 'bay' aqui
    return (async () => {
        try {
            let response = await axios.get("https://mangalivre.net/manga/"+name+"/"+id);
            bay = response.data;
            const $ = cheerio.load(bay);
          //  console.log(response.data)
            const descriptionContent = $('meta[name="description"]').attr("content");
            const foto = $('meta[property="og:image"]').attr("content");
            const groups = [];
            $('ul.scans-list li').each((index, element) => {
            const priority = $(element).find('h2.priority').text();
            const scanlator = $(element).find('span.separator').next().text();
            const chapters = $(element).find('span.chapters').text().trim();
    groups.push({ priority, scanlator, chapters });
            });
            const result = {"nome": name, "id": id, "desc": descriptionContent, "foto": foto}
            return result;
        } catch (error) {
            console.error(error.message);
        }
    })();
}

app.set("views", "./static/");
app.use(express.static("./public/"))
app.engine('html', require('ejs').renderFile);
app.use(express.json());
app.set("json spaces",2)




// Defina as rotas da sua API
app.get('/rota', (req, res) => {
  // Lógica da rota aqui
  res.json({ message: 'Sua API está funcionando!' });
});

app.get("/search", (req, res) => {
const name = req.query.q;
const test = require("./test.js")
//var return_data = { "mangas": [] };
//    const form = "search=" + name;
api.search(name).then((response) => {
        res.send(response);
    });

});

app.get("/chapters/:id/", async (req, res) => {
    const id = req.params.id;
    var return_data = {
        "id_serie": undefined,
        "url_name": undefined,
        "name": undefined,
        "chapters": []
    };

    for (let i = 1; ; i++) {
        var result = await api.getChapters(id, i);
        
        // checa se as infos ja foram adicionadas para evitar ficar reescrevendo os valores.
        if (!return_data.name) { 
            return_data.id_serie = result.id_serie;
            return_data.url_name = result.url_name;
            return_data.name = result.name;
        }

        if (result.chapters.length > 0) {
            return_data.chapters = return_data.chapters.concat(result.chapters);
            continue;
        }
        break;
    }
    res.send(return_data);
});

app.get("/chapters/:id/:page/", async (req, res) => {
    const id = req.params.id;
    const page = req.params.page;

    var return_data = {
        "id_serie": undefined,
        "url_name": undefined,
        "name": undefined,
        "chapters": []
    };

    var result = await api.getChapters(id, page);

    return_data.chapters = result.chapters;

    // checa se as infos já foram adicionadas para evitar ficar reescrevendo os valores.
    if (!return_data.name) { 
        return_data.id_serie = result.id_serie;
        return_data.url_name = result.url_name;
        return_data.name = result.name;
    }

    res.send(return_data);
});

app.get("/pages/:id", (req, res) => {
    const id = req.params.id;

    api.getPages(id).then((pages) => {
        res.send(pages);
    });
});

app.get("/genres/", (_req, res) => {
    api.getGenres().then((response) => {
        res.send(response);
    });
});

app.get("/recents", (req, res) => {
    res.redirect("/recents/1");
});

app.get("/recents/:page", (req, res) => {
    const page = req.params.page;
    api.getRecents(page).then((response) => {
        res.send(response);
    });
});

app.get("/popular/", async (_req, res) => {
    res.redirect("/popular/1");
});

app.get("/popular/:page", (req, res) => {
    const page = req.params.page;
    api.getPopular(page).then((response) => {
        res.send(response.mangas);
    });
});

app.get("/top/:page", (req, res) => {
    const page = req.params.page;
    api.getTop(page).then((response) => {
        res.send(response.mangas);
    });
});

app.get("/top/", async (_req, res) => {
    res.redirect("/top/1");
});

app.get("/manga/:name/:id", async(req, res) => {
    const name = req.params.name
    const id = req.params.id;
    api.getMangaById(name, id).then((response) => {
        res.send(response);
    });
});

app.get('*', (req, res) => {
    res.header("401");
    res.render("html/401.html");
});

app.listen(port, () => {
    console.log(`Running at http://localhost:${port}/`);
});