var mainChartConfig = {
    w: 720,
    h: 720,

    padding: 45,

    margin: {
        top: 50,
        right: 50,
        bottom: 30,
        left: 30
    },

    sensors: [{
            name: 'Sensor1',
            location: [62, 21]
        },
        {
            name: 'Sensor2',
            location: [66, 35]
        },
        {
            name: 'Sensor3',
            location: [76, 41]
        },
        {
            name: 'Sensor4',
            location: [88, 45]
        },
        {
            name: 'Sensor5',
            location: [103, 43]
        },
        {
            name: 'Sensor6',
            location: [102, 22]
        },
        {
            name: 'Sensor7',
            location: [89, 3]
        },
        {
            name: 'Sensor8',
            location: [74, 7]
        },
        {
            name: 'Sensor9',
            location: [119, 42]
        },
    ],

    sensorsMap: {
        'Sensor1': '1',
        'Sensor2': '2',
        'Sensor3': '3',
        'Sensor4': '4',
        'Sensor5': '5',
        'Sensor6': '6',
        'Sensor7': '7',
        'Sensor8': '8',
        'Sensor9': '9'

    },

    factories: [{
            name: 'Roadrunner Fitness Electronics',
            id: 'Roadrunner-Fitness-Electronics',
            location: [89, 27],
        },
        {
            name: 'Kasios Office Furniture',
            id: 'Kasios-Office-Furniture',
            location: [90, 21],
        },
        {
            name: 'Radiance ColourTek',
            id: 'Radiance-ColourTek',
            location: [109, 26],
        },
        {
            name: 'Indigo Sol Boards',
            id: 'Indigo-Sol-Boards',
            location: [120, 22],
        },
    ]
};



let gridToMiles = d3.scaleLinear()
    .domain([0, 200]).range([0, 12]);

let xPixelRange = [50, 125];
let yPixelRange = [60, -15];
let maxRange = Math.max(mainChartConfig.w, mainChartConfig.h);
let mainChartRange = [mainChartConfig.padding, maxRange - mainChartConfig.padding];

let xPixelToSVG = d3.scaleLinear().domain(xPixelRange).range(mainChartRange);
let yPixelToSVG = d3.scaleLinear().domain(yPixelRange).range(mainChartRange);


let radarChartConfig = {
    w: 70,
    h: 70,
    margin: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    },
    levels: 4,
    labelFactor: 1.25,
    wrapWidth: 60,
    opacityArea: 0.2,
    dotRadius: 4,
    opacityCircles: 0.1,
    strokeWidth: 2,
    format: '.3f',
    unit: '',
    legend: false,

};

let possibleChemicalSource = [{
        name: 'Sensor9',
        direction: 'S',
        factories: ['Radiance-ColourTek', 'Indigo-Sol-Boards']
    }, {
        name: 'Sensor9',
        direction: 'SSW',
        factories: ['Radiance-ColourTek']
    }, {
        name: 'Sensor9',
        direction: 'SW',
        factories: ['Roadrunner-Fitness-Electronics']
    },
    {
        name: 'Sensor5',
        direction: 'SE',
        factories: ['Radiance-ColourTek', 'Indigo-Sol-Boards']
    }, {
        name: 'Sensor5',
        direction: 'SSW',
        factories: ['Roadrunner-Fitness-Electronics']
    },
    {
        name: 'Sensor5',
        direction: 'SW',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    },
    {
        name: 'Sensor5',
        direction: 'SSE',
        factories: ['Radiance-ColourTek']
    },
    {
        name: 'Sensor4',
        direction: 'S',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor4',
        direction: 'SE',
        factories: ['Radiance-ColourTek', 'Indigo-Sol-Boards']
    }, {
        name: 'Sensor4',
        direction: 'ESE',
        factories: ['Indigo-Sol-Boards']
    }, {
        name: 'Sensor3',
        direction: 'ESE',
        factories: ['Radiance-ColourTek', 'Indigo-Sol-Boards']
    }, {
        name: 'Sensor3',
        direction: 'SE',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor3',
        direction: 'SSE',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor2',
        direction: 'SE',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor2',
        direction: 'SSE',
        factories: ['Kasios-Office-Furniture']
    }, {
        name: 'Sensor1',
        direction: 'E',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor1',
        direction: 'ENE',
        factories: ['Roadrunner-Fitness-Electronics']
    }, {
        name: 'Sensor1',
        direction: 'ESE',
        factories: ['Kasios-Office-Furniture']
    }, {
        name: 'Sensor8',
        direction: 'NE',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor8',
        direction: 'NE',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor7',
        direction: 'NNE',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor7',
        direction: 'N',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor6',
        direction: 'E',
        factories: ['Radiance-ColourTek']
    }, {
        name: 'Sensor6',
        direction: 'ESE',
        factories: ['Radiance-ColourTek', 'Indigo-Sol-Boards']
    }, {
        name: 'Sensor6',
        direction: 'ENE',
        factories: ['Radiance-ColourTek']
    }, {
        name: 'Sensor6',
        direction: 'W',
        factories: ['Roadrunner-Fitness-Electronics', 'Kasios-Office-Furniture']
    }, {
        name: 'Sensor6',
        direction: 'NW',
        factories: ['Roadrunner-Fitness-Electronics']
    }, {
        name: 'Sensor6',
        direction: 'SW',
        factories: ['Kasios-Office-Furniture']
    }, {
        name: 'Sensor6',
        direction: 'NNW',
        factories: ['Roadrunner-Fitness-Electronics']
    }, {
        name: 'Sensor6',
        direction: 'WNW',
        factories: ['Roadrunner-Fitness-Electronics']
    }, {
        name: 'Sensor6',
        direction: 'WSW',
        factories: ['Kasios-Office-Furniture']
    }
]