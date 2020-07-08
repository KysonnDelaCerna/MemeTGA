const ALLNONLANDSETS = ['iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha1', 'ha2', 'ana'];
const ALLLANDSETS = ['iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha2'];
const STANDARD = ['iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn'];

let NONLANDS = [];
ALLNONLANDSETS.forEach(element => {
    $.getJSON(`https://raw.githubusercontent.com/KysonnDelaCerna/MemeTGA/master/public/data/nonlands/${element}.min.json`).done(function (data) {
        NONLANDS = NONLANDS.concat(data);
    });
});

let LANDS = [];
ALLLANDSETS.forEach(element => {
    $.getJSON(`https://raw.githubusercontent.com/KysonnDelaCerna/MemeTGA/master/public/data/lands/${element}.min.json`).done(function (data) {
        LANDS = LANDS.concat(data);
    });
});