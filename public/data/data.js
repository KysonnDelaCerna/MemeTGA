const ALLNONLANDSETS = ['iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha1', 'ha2', 'ana'];
const ALLLANDSETS = ['iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha2'];
const STANDARD = ['iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn'];

let NONLANDS = [];
ALLNONLANDSETS.forEach(element => {
    $.getJSON(`./nonlands/${element}.json`).done(function (data) {
        NONLANDS = NONLANDS.concat(data);
    });
});

let LANDS = [];
ALLLANDSETS.forEach(element => {
    $.getJSON(`./lands/${element}.json`).done(function (data) {
        LANDS = LANDS.concat(data);
    });
});