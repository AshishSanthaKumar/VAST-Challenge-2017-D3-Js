var rawData;
var dateSelection;
var timeSelection;
var sensorSelection;
var maxReading;
var svg;
var playButton;
var windDirectionCompass;

document.addEventListener('DOMContentLoaded', function () {
    //load data and preprocess
    d3.csv("../mainchart/data/data.csv")
        .then(function (mainChartData) {

            svg = d3.select('#mainChart').append('svg')
                .attr("width", mainChartConfig.w)
                .attr("height", mainChartConfig.h);


            dateTime = parseDateTime(dateSelection.val() + ' ' + timeSelection.val());

            //parse Date column to Date objects
            mainChartData.forEach(function (d) {
                d.Date = parseDateTime(d.Date)
            });

            rawData = mainChartData;
            maxReading = d3.max(mainChartData, d => +d.Reading);
            filteredData = filterByDate(mainChartData, dateTime);
            transformed_data = transform_data(filteredData);

            drawMap();
            drawFactories();
            drawSensors(transformed_data);
            drawWindGlyph(transformed_data[0]);
            drawLegend()

            playButton = document.getElementById("play-button");
            playButton.onclick = function () {
                playPauseButton()
            };

        }).catch(function (error) {
            console.log(error)
        });
});

function drawSensors(data) {
    svg.selectAll('.radarSensor').remove()

    let sensorsSVG = svg.selectAll('.radarSensor')
        .data(mainChartConfig.sensors);
    sensorsSVG.exit()
        .remove();

    let newSensors = sensorsSVG.enter();
    newSensors.each(function (d, i) {
        let curSensor = d3.select(this);
        let location = {
            x: xPixelToSVG(d.location[0]) - 20,
            y: yPixelToSVG(d.location[1]) - 20
        };
        sensorData = data.filter(e => e.name == d.name)
        let mainSensorColor = d3.scaleOrdinal().range([sensorsColorScale(d.name)]);
        RadarChart(curSensor, sensorData, mainSensorColor, location, radarChartConfig);
    });

    svg.on('click', function (d, i) {

            svg.selectAll(".radarSensor")
                .transition().duration(50)
                .style("opacity", 1);
            onSensorSelected({
                'name': 'All'
            });
        }

    );


}

function drawLegend() {

    let w = 180,
        h = 250;

    let legendGroup = svg.append('g').attr('class', 'main-legend')
        .attr('transform', `translate(${480},${400})`)

    legendGroup.append('rect').attr('x', 0).attr('y', 0).attr('rx', 15).attr('width', w).attr('height', h);


    legendGroup.append('text').text("Legend")
        .attr('x', w / 2).attr('y', 20).classed('legend-title', true)

    legendGroup.append("image")
        .attr("xlink:href", '../mainchart/assets/factory.svg')
        .attr("x", w / 2 - 20)
        .attr("y", 40)
        .attr("height", 30)
        .attr("width", 30);

    legendGroup.append('text').text('Factory Location').classed('legend-label', true)
        .attr('x', 10).attr('y', 40);

    legendGroup.append('text').text('Wind Direction').classed('legend-label', true)
        .attr('x', 10).attr('y', 85);

    let compassGroup = legendGroup.append('g').style('opacity', 0.5);

    compassGroup.append("image")
        .attr("xlink:href", '../mainchart/assets/compass.png')
        .attr("x", w / 2 - 36)
        .attr("y", 92)
        .attr("height", 60)
        .attr("width", 60);

    let group = legendGroup.append('g');

    group.append("image")
        .attr("xlink:href", '../mainchart/assets/arrow.png')
        .attr("x", w / 2 - 13)
        .attr("y", 115)
        .attr("height", 15)
        .attr("width", 15);

    legendGroup.append('text').text('Sensors').classed('legend-label', true)
        .attr('x', 10).attr('y', 165);
    let i = 0
    const sensorNames = [];
    Object.keys(mainChartConfig.sensorsMap).sort().forEach(sensorName => {
        sensorNames.push(sensorName)
    });
    sensorNames.forEach(sensorName => {
        legendGroup.append('text').text(sensorName).classed('legend-label', true)
            .attr('x', (i % 3) * 55 + 25).attr('y', (Math.ceil((i + 1) / 3) * 20) + 168);
        legendGroup.append('circle')
            .attr("cx", (i % 3) * 55 + 15)
            .attr("cy", (Math.ceil((i + 1) / 3) * 20) + 165)
            .attr("r", 3)
            .attr("fill", sensorsColorScale(sensorName))
        i += 1;

    });
}


function drawMap() {

    let axes = {
        x: d3.axisBottom(d3.scaleLinear().domain([gridToMiles(xPixelRange[0]), gridToMiles(xPixelRange[1])]).range(mainChartRange)),
        y: d3.axisLeft(d3.scaleLinear().domain([gridToMiles(yPixelRange[0]), gridToMiles(yPixelRange[1])]).range(mainChartRange)).ticks(8)
    };

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (mainChartConfig.h - mainChartConfig.padding) + ')') //move x-axis to bottom of image
        .call(axes.x);

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + mainChartConfig.padding + ',0)') //move y-axis right to have readable labels
        .call(axes.y);

    svg.append('text').classed('axis-label', true)
        .attr('text-anchor', 'middle').attr('transform', `translate(${mainChartConfig.w/2},${mainChartConfig.h*0.99})`)
        .text('Map X Coordinate (Miles)');

    svg.append('text').classed('axis-label', true)
        .attr('text-anchor', 'middle').attr('transform', `translate(${mainChartConfig.padding*0.25},${mainChartConfig.h/2}) rotate(-90)`)
        .text('Map Y Coordinate (Miles)');


    svg.append('text').classed('mainChart-title', true)
        .attr('text-anchor', 'middle')
        .attr('x', mainChartConfig.w / 2).attr('y', mainChartConfig.padding)
        .text("Map view of all sensors, factories and wind direction")


}


function drawWindGlyph(data) {
    windDirectionCompass = data.compass;

    let compassGroup = svg.append('g').style('opacity', 0.5);

    compassGroup.append("image")
        .attr('class', 'compass')
        .attr("xlink:href", '../mainchart/assets/compass.png')
        .attr("x", mainChartConfig.w * 0.076)
        .attr("y", mainChartConfig.h * 0.043)
        .attr("height", 100)
        .attr("width", 100)

    let group = svg.append('g')
        .classed('wind-glyph', true)
        .attr('id', 'wind-arrow')


    group.append("image")
        .attr('class', 'arrow')
        .attr("xlink:href", '../mainchart/assets/arrow.png')
        .attr("x", mainChartConfig.w * 0.009 - 20)
        .attr("y", mainChartConfig.h * 0.009 - 20)
        .attr("height", 25)
        .attr("width", 25)



    group.attr('transform', `translate(${mainChartConfig.w * 0.15},${mainChartConfig.h * 0.115}) rotate(${(data.direction+180)%360})`)

    let tooltipText = ''
    tooltipText += `<b>Wind Speed:</b> ${convertMetersPerSecToMilesPerHour(data.speed).toFixed(2)} mph`;
    tooltipText += `<br><b>Wind Origin:</b> ${(data.direction).toFixed(2)} degrees (0/360 is North)`;
    tooltipText += `<br><b>Wind Direction:</b> ${((data.direction+180)%360).toFixed(2)} degrees (0/360 is North)`;

    addToolTip(compassGroup, tooltipText);

}

function updateWind(data) {
    windDirectionCompass = data.compass;
    let compass = d3.select('.compass');
    let windArrow = d3.select('#wind-arrow');
    windArrow
        .attr('transform', `translate(${mainChartConfig.w * 0.15},${mainChartConfig.h * 0.115}) rotate(${(data.direction+180)%360})`);

    let tooltipText = ''
    tooltipText += `<b>Wind Speed:</b> ${convertMetersPerSecToMilesPerHour(data.speed).toFixed(2)} mph`;
    tooltipText += `<br><b>Wind Origin:</b> ${(data.direction).toFixed(2)} degrees (0/360 is North)`;
    tooltipText += `<br><b>Wind Direction:</b> ${((data.direction+180)%360).toFixed(2)} degrees (0/360 is North)`;

    addToolTip(compass, tooltipText);
}

function addPossibleSourceLine(sensor) {
    let sensorName = sensor.data()[0].name
    let sensorLoc = sensor.data()[0].location
    let possibleSource = possibleChemicalSource.filter(d => (d.name === sensorName) & (d.direction === windDirectionCompass))[0]
    if (!possibleSource) {
        return;
    }
    possibleSource = possibleSource.factories
    var offset = 10
    possibleSource.forEach((factory, i) => {
        offset *= -1
        curFactory = d3.select('.' + factory).data()[0].location
        svg.append('line')
            .attr('class', 'possibleSource')
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("opacity", 0.5)
            .style("stroke-dasharray", ("3, 3"))
            .attr("x1", xPixelToSVG(sensorLoc[0]) - 20)
            .attr("y1", yPixelToSVG(sensorLoc[1]) - 20)
            .attr("x2", xPixelToSVG(curFactory[0]) + offset)
            .attr("y2", yPixelToSVG(curFactory[1]));
    })



}

function drawFactories() {
    let factorySVG = svg.selectAll('.factory').data(mainChartConfig.factories);
    factorySVG.exit().remove();

    let newFactories = factorySVG.enter();
    newFactories.each(function (d, i) {
        let curFactory = d3.select(this);
        let location = {
            x: xPixelToSVG(d.location[0]),
            y: yPixelToSVG(d.location[1])
        };

        curFactory = curFactory.append("image")
            .attr("xlink:href", '../mainchart/assets/factory.svg')
            .attr("x", location.x - 20)
            .attr("y", location.y - 20)
            .attr("height", 40)
            .attr("width", 40)
            .attr("class", d.id)
            .classed('factory', true)

        addToolTip(curFactory, `<b>${d.name}</b>`);
        //factories[i].domElement = curFactory;
    });
}