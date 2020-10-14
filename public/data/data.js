const ALLNONLANDSETS = ['m21', 'iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha1', 'ha2', 'ana', 'ha3', 'znr'];
const ALLLANDSETS = ['m21', 'iko', 'thb', 'eld', 'm20', 'war', 'rna', 'grn', 'm19', 'dom', 'rix', 'xln', 'ha2', 'ha3', 'znr'];
const STANDARD = ['znr', 'm21', 'iko', 'thb', 'eld'];
const STANDARDBANNED = [
    'Cauldron Familiar',
    'Escape to the Wilds',
    'Fires of Invention',
    'Growth Spiral',
    'Lucky Clover',
    'Oko, Thief of Crowns',
    'Omnath, Locus of Creation',
    'Once Upon a Time',
    'Uro, Titan of Nature\'s Wrath'
];
const HISTORICBANNED = [
    'Agent of Treachery',
    'Field of the Dead',
    'Fires of Invention',
    'Nexus of Fate',
    'Oko, Thief of Crowns',
    'Once Upon a Time',
    'Teferi, Time Raveler',
    'Veil of Summer',
    'Wilderness Reclamation',
    'Winota, Joiner of Forces'
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