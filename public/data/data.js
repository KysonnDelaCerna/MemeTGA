const ALLNONLANDSETS = ['m21', 'iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha1', 'ha2', 'ana', 'ha3'];
const ALLLANDSETS = ['m21', 'iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha2', 'ha3'];
const STANDARD = ['m21', 'iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn'];
const STANDARDBANNED = [
    'Agent of Treachery',
    'Field of the Dead',
    'Fires of Invention',
    'Oko, Thief of Crowns',
    'Once Upon a Time',
    'Veil of Summer'
];
const HISTORICBANNED = [
    'Agent of Treachery',
    'Fires of Invention',
    'Winota, Joiner of Forces',
    'Oko, Thief of Crowns',
    'Once Upon a Time',
    'Veil of Summer',
    'Nexus of Fate'
];

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