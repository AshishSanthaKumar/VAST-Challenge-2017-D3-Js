function onSensorSelected(sensorSelected) {
    // sesnorSelected is an object (dictionary) which looks like this
    //{name: "Sensor3", location: [76,41]}
    // you shouldn't need the location. 
    //Use sensorSelected.name to get the name of the sensor selected and then you can trigger a filter/selection on your chart
    selectedSensor=sensorSelected.name;
    drawAllCharts();
}

function filterByDate(data, date) {
    date = parseDateTime(date)
    return data.filter(d => d['Date'] == date)
}

function parseDateTime(date) {
    return parseTime(Date.parse(date));
}

var parseTime = d3.timeFormat("%m/%d/%y %H:%M");


function transform_data(rawdata) {
    var groups = d3.nest()
        .key(function (d) {
            return d.Monitor;
        })
        .entries(rawdata);
    sensorsData = []
    groups.forEach(function (group) {
        data = group.values.sort(function (a, b) {
            return d3.ascending(a.Chemical, b.Chemical);
        });
        axes = []
        name = ''
        direction = 0
        compassDirection = ''
        speed = 0
        data.forEach(function (d) {
            name = 'Sensor' + d.Monitor;
            direction = d['Wind Direction']
            compassDirection = d['Direction']
            speed = d['Wind Speed']
            axes.push({
                'axis': d.Chemical,
                'value': +d.Reading
            })
        });
        sensorsData.push({
            'name': name,
            'axes': axes,
            'direction': +direction,
            'compass': compassDirection,
            'speed': +speed
        })
    });
    return sensorsData;
}
var sensorsColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(["Sensor1", "Sensor2", "Sensor3", "Sensor4", "Sensor5", "Sensor6", "Sensor7", "Sensor8", "Sensor9"]);

function convertMetersPerSecToMilesPerHour(metersPerSec) {
    return metersPerSec * 2.236936;
}

function addToolTip(target, message) {
    const div = d3.select('.tooltip-main');

    target.on('mouseenter', function () {
        div.html(message)
        div
            .style('left', `${d3.event.pageX+15}px`)
            .style('top', `${d3.event.pageY-35}px`)
            .transition()
            .style('opacity', 1)

    }).on('mouseleave', function () {
        div.style('opacity', 0);
    });

}

function updateDateTimePickers(startDate, endDate) {


    dateSelection = $('#datePicker');
    timeSelection = $('#timePicker');

    let startDateOnly = formatDate(startDate);
    let startTimeOnly = formatTimePicker(startDate);

    let endDateOnly = formatDate(endDate);
    let endTimeOnly = formatTimePicker(endDate);

    dateSelection.attr({
        value: startDateOnly,
        min: startDateOnly,
        max: endDateOnly
    }).change();

    timeSelection.attr({
        value: startTimeOnly,
        min: startTimeOnly,
        max: endTimeOnly
    }).change();



}

function formatDate(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

function formatTimePicker(date) {
    return new Date(date.setMinutes(0)).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    })
}



function step() {
    currentValue = new Date(dateSelection.val() + ' ' + timeSelection.val());
    currentValue.setHours(currentValue.getHours() + 1);
    let maxDate = new Date(dateSelection.attr('max'))
    if (currentValue.getTime() > maxDate.getTime()) {
        playButton.className = "";
        playButton.value = "▶";
        clearInterval(timer);
    } else {
        timeSelection.attr({
            value: formatTimePicker(currentValue)
        }).change();
        dateSelection.attr({
            value: formatDate(currentValue)
        }).change();

    }
}

function playPauseButton() {

    if (playButton.className == 'is-playing') {
        playButton.className = "";
        playButton.value = "▶"
        clearInterval(timer);
    } else {

        playButton.className = "is-playing";
        playButton.value = "❚❚";
        timer = setInterval(step, 350);
    }

};