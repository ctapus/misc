import * as $ from "jquery";
const baseURL = 'http://en.wiktionary.org/w/api.php';

$(document).ready(() => {
    let words: string = $("#taWords").val() as string;
    for(let word of words.split(' ')) {
        $.getJSON(baseURL,
        {
            'format' : 'json',
            'action' : 'query',
            'titles' : word,
            'origin' : '*',
            'export' : '',
            'exportnowrap' : '',
        },
        (data) => {
            let page: string = data.page.revision.text;
        });
    }
});