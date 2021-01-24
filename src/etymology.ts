import * as $ from "jquery";
class Language {
    static readonly English: string = "English";
    static readonly MiddleEnglish: string = "Middle English";
    static readonly OldEnglish: string = "Old English";
    static readonly  ProtoGermanic: string = " Proto-Germanic";
    static readonly French : string = "French";
    static readonly German : string = "German";
    static readonly Russian : string = "Russian";
    static readonly Spanish : string = "Spanish";
    static readonly Swedish : string = "Swedish";
    static readonly Latin: string = "Latin";
    static readonly AncientGreek: string = "Ancient Greek";
    static readonly ProtoHellenic: string = "Proto-Hellenic";
    static readonly ProtoIndoEuropean: string = "Proto-Indo-European";
}
class Word {
    name: string;
    language: string;
    origin: Word;
    public constructor(name: string, language: string, origin: Word = null) {
        this.name = name;
        this.language = language;
        this.origin = origin;
    }
}

let lexicon: { [word: string]: Word } = {};
lexicon["slēpaną"] = new Word("slēpaną", Language.ProtoGermanic);
lexicon["slēpan"] = new Word("slēpan", Language.OldEnglish, lexicon["slēpaną"]);
lexicon["slepen"] = new Word("slepen", Language.MiddleEnglish, lexicon["slēpan"]);
lexicon["sleep"] = new Word("sleep", Language.English, lexicon["slepen"]);
lexicon["grōniz"] = new Word("grōniz", Language.ProtoGermanic);
lexicon["grēne"] = new Word("grēne", Language.OldEnglish, lexicon["grōniz"]);
lexicon["grene"] = new Word("grene", Language.MiddleEnglish, lexicon["grēne"]);
lexicon["green"] = new Word("green", Language.English, lexicon["grene"]);
lexicon["weyd"] = new Word("weyd", Language.ProtoIndoEuropean);
lexicon["widéhā"] = new Word("widéhā", Language.ProtoHellenic, lexicon["weyd"]);
lexicon["ἰδέα"] = new Word("ἰδέα", Language.AncientGreek, lexicon["widéhā"]);
lexicon["idea"] = new Word("idea", Language.Latin, lexicon["ἰδέα"]);
lexicon["idea"] = new Word("idea", Language.English, lexicon["idea"]);


const baseURL: string = "http://en.wiktionary.org/w/api.php";
$(document).ready(() => {
    let words: string = $("#taWords").val() as string;
    for(let word of words.split(" ")) {
        $.getJSON(baseURL,
        {
            "format" : "json",
            "action" : "query",
            "titles" : word,
            "origin" : "*",
            "export" : "",
            "exportnowrap" : "",
        },
        (data) => {
            let page: string = data.page.revision.text;
        });
    }
});