import * as $ from "jquery";
class Language {
    readonly static English: string = "English";
    readonly static MiddleEnglish: string = "Middle English";
    readonly static OldEnglish: string = "Old English";
    readonly static  ProtoGermanic: string = " Proto-Germanic";
    readonly static French : string = "French";
    readonly static German : string = "German";
    readonly static Russian : string = "Russian";
    readonly static Spanish : string = "Spanish";
    readonly static Swedish : string = "Swedish";
    readonly static Latin: string = "Latin";
    readonly static AncientGreek: string = "Ancient Greek";
    readonly static ProtoHellenic: string = "Proto-Hellenic";
    readonly static ProtoIndoEuropean: string = "Proto-Indo-European";
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