const got = require('got');

async function searchManga(name) {
    var return_data = { "mangas": [] };
    const form = "search=" + name;

    try {
        let response = await got.post(
            "https://mangalivre.net/lib/search/series.json", {
            body: form,
            headers: {
                "x-requested-with": "XMLHttpRequest",
                "content-type": "application/x-www-form-urlencoded",
            },
        });

        // Convertendo a resposta para JSON
        const responseData = JSON.parse(response.body);

        // Verificando se a chave 'series' existe na resposta
        if (responseData.series) {
            for (let serie of responseData.series) {
                return_data.mangas.push({
                    "id_serie": serie.id_serie,
                    "name": serie.name,
                    "label": serie.label,
                    "score": serie.score,
                    "value": serie.value,
                    "author": serie.author,
                    "artist": serie.artist,
                    "image": serie.cover,
                    "categories": serie.categories.map((categorie) => { return { "name": categorie.name, "id_category": categorie.id_category }; }),
                });
            }
        }

        return return_data;
    } catch (error) {
        console.log(error.message);
    }
}

// Chamando a função e lidando com a promessa retornada
function oi(name){
searchManga(name)
    .then(result => {
        return result;
    })
    .catch(error => {
        console.error(error);
    });
}

module.exports = { oi }