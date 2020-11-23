var globalData;

var startDate;
var endDate;
var c10 = d3.scaleOrdinal(d3.schemeTableau10).domain(["AGOC-3A", "Appluimonia", "Chlorodinine", "Methylosmolene"]);
var selectedSensor='All';

function dateFormatter(dateToChange) {
    var arr = dateToChange.split(/-|\s|:/); // split string and create array.
    dateToChange = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]); // decrease month value by 1
    return dateToChange;
}

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    div = d3.select("body").append("div")
    .attr("class", "tooltip-map")
    .style("opacity", 0);
    // Load all files before doing anything else
    Promise.all([d3.csv('MC2Data/column_formated.csv')])
        .then(function (values) {
            globalData = values[0];
            globalData.map(function (data) {
                data['RowLabels'] = dateFormatter(data['RowLabels']);
                for (var key in data)
                    if (data[key] == '')
                        data[key] = '0';
            })

            drawPage();
        })
})


function drawPage() {

    var selectedDate = document.getElementById("months").value;
    if (selectedDate == 'April') {
        startDate = dateFormatter('2016-04-01 00:00:00');
        endDate = dateFormatter('2016-04-30 23:00:00')
    }
    if (selectedDate == 'August') {
        startDate = dateFormatter('2016-08-01 00:00:00');
        endDate = dateFormatter('2016-08-31 23:00:00')
    }
    if (selectedDate == 'December') {
        startDate = dateFormatter('2016-12-01 00:00:00');
        endDate = dateFormatter('2016-12-31 23:00:00')
    }

    drawTimeline();
    //drawColumnChart("2016-04-01 05:00:00","2016-04-04 19:00:00");
}


function drawTimeline() {
    const margin = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 25
    };
    const width = 1400 - margin.left - margin.right;
    const height = 80 - margin.top - margin.bottom;


    d3.select("#timeline-container").selectAll("*").remove();

    var timelineSvg = d3.select("#timeline-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);


    var timeLineData = globalData.filter(
        function (d) {
            return startDate <= d['RowLabels'] && endDate >= d['RowLabels'];
        }
    )


    var timeline = timelineSvg.append("g")
        .attr("class", "timeline")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .domain(d3.extent(timeLineData.map(function (d) {
            return d.RowLabels;
        })))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(timeLineData.map(function (d) {
            return Number(d.GrandTotal);
        })))
        .range([height, 0]);


    var xAxis = timelineSvg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + (height + 10) + ")")
        .call(d3.axisBottom(x));

    var yAxis = timelineSvg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
        .call(d3.axisLeft(y).ticks(3));

    var area = d3.area()
        .curve(d3.curveLinear)
        .x(function (d) {
            return x(d.RowLabels);
        })
        .y0(height)
        .y1(function (d) {
            return y(Number(d.GrandTotal));
        })

    timeline.append("path")
        .datum(timeLineData)
        .attr("class", "area")
        .attr("d", area);


    timeline.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("chemicals");

    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, 50]
        ])
        .on("brush", brushed);

    timeline.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    function brushed() {
        var selection = d3.event.selection;
        var rangeDate = selection.map(x.invert, x);
        startDate = rangeDate[0];
        endDate = rangeDate[1];
        updateDateTimePickers(startDate, endDate);
        drawAllCharts();
    }

    drawAllCharts();
}

function drawAllCharts()
{
    drawColumnChart();
    drawRadialChart();
    drawHeatMap();
}


function drawColumnChart() {

    var columnSvg;
    const margin = {
        top: 70,
        right: 30,
        bottom: 70,
        left: 60
    };
    const columnChartWidth = 600 - margin.left - margin.right;
    const columnChartHeight = 400 - margin.top - margin.bottom;

    var maxY;
    var barPadding = 0.2;

    var selected = selectedSensor=='All'?'All':selectedSensor.slice(-1);
    // console.log(selected);

    d3.select("#column-container").selectAll("*").remove();
    columnSvg = d3.select("#column-container").append("svg")
        .attr("width", columnChartWidth + margin.left + margin.right)
        .attr("height", columnChartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    var localColumn = globalData.filter(function (d) {
        return d['RowLabels'] >= startDate && d['RowLabels'] <= endDate;
    });


    localData = [{
            "chemical": "AGOC-3A",
            "reading": 0
        },
        {
            "chemical": "Appluimonia",
            "reading": 0
        },
        {
            "chemical": "Chlorodinine",
            "reading": 0
        },
        {
            "chemical": "Methylosmolene",
            "reading": 0
        }
    ]

    for (i = 0; i < localColumn.length; i++) {
        localData[0]['reading'] = localData[0]['reading'] + Number(localColumn[i]['AGOC-3A' + selected]);
        localData[1]['reading'] = localData[1]['reading'] + Number(localColumn[i]['Appluimonia' + selected]);
        localData[2]['reading'] = localData[2]['reading'] + Number(localColumn[i]['Chlorodinine' + selected]);
        localData[3]['reading'] = localData[3]['reading'] + Number(localColumn[i]['Methylosmolene' + selected]);
    }

    localData[0]['reading'] = localData[0]['reading']/localColumn.length;
    localData[1]['reading'] = localData[1]['reading']/localColumn.length;
    localData[2]['reading'] = localData[2]['reading']/localColumn.length;
    localData[3]['reading'] = localData[3]['reading']/localColumn.length;




    // set the ranges
    var x = d3.scaleBand()
        .range([0, columnChartWidth])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([columnChartHeight, 0]);



    // Scale the range of the data in the domains
    x.domain(localData.map(function (d) {
        return d.chemical;
    }));
    y.domain([0, d3.max(localData, function (d) {
        return d.reading;
    })]);

    // append the rectangles for the bar chart
    columnSvg.selectAll(".bar")
        .data(localData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.chemical) + 40;
        })
        .attr("fill", function (d) {
            return c10(d.chemical);
        })
        .attr("width", x.bandwidth() - 75)
        .attr("y", function (d) {
            return y(d.reading);
        })
        .attr("height", function (d) {
            return columnChartHeight - y(d.reading);
        });

    // add the x Axis
    columnSvg.append("g")
        .attr("transform", "translate(0," + columnChartHeight + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    columnSvg.append("g")
        .call(d3.axisLeft(y).ticks(4));


    columnSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10 - margin.left)
        .attr("x", 0 - (columnChartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Chemical Reading");


    columnSvg.append("text")
        .attr("transform",
            "translate(" + (columnChartWidth / 2) + " ," +
            (columnChartHeight + margin.top-30) + ")")
        .style("text-anchor", "middle")
        .text("Chemicals");

    columnSvg.append("text")
        .attr("x", (columnChartWidth / 2))             
        .attr("y", -15 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "15px") 
        .style("text-decoration", "underline")  
        .text(selectedSensor=='All'?'Average chemical reading from all the Sensors in the selected time frame':('Average chemical reading from Sensor '+selectedSensor.slice(-1)+' in the selected time frame'));

}

function drawRadialChart() {

    var localRadial = globalData.filter(function (d) {
        return d['RowLabels'] >= startDate && d['RowLabels'] <= endDate;
    });

    var jsonRadial = {
        '1': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '2': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '3': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '4': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '5': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '6': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '7': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '8': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        },
        '9': {
            'AGOC-3A': [],
            'Appluimonia': [],
            'Chlorodinine': [],
            'Methylosmolene': [],
            'yes': 0
        }
    };
    var chemicals = ['AGOC-3A', 'Appluimonia', 'Chlorodinine', 'Methylosmolene'];
    var monitors = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (i = 0; i < localRadial.length; i++) {
        for (const chemical of chemicals)
            for (const monitor of monitors) {
                if (jsonRadial[monitor][chemical].includes(Number(localRadial[i][chemical + monitor])))
                    jsonRadial[monitor]['yes'] = jsonRadial[monitor]['yes'] + 1;
                else
                    jsonRadial[monitor][chemical].push(Number(localRadial[i][chemical + monitor]));
            }
    }


    d3.select("#radialchart").selectAll("*").remove();
    var radial_svg;
    const width = 600,
        height = 450,
        chartRadius = height / 2 - 40;

    //tooltip

    let tooltip = d3.select('#radialchart').append('div')
        .attr('class', 'tooltip');

    //defining the radial characterstics
    const PI = Math.PI,
        arcMinRadius = 11,
        arcPadding = 5,
        labelPadding = -5,
        numTicks = 10;

    radial_svg = d3.select('#radialchart').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // var radial= radialData.filter(function(d){
    //     return d['Date']>=startDate && d['Date']<=endDate;
    // });

    localData = [{
            "monitor": "Sensor1",
            "display_name": "S1",
            "reading": jsonRadial['1']['yes']
        },
        {
            "monitor": "Sensor2",
            "display_name": "S2",
            "reading": jsonRadial['2']['yes']
        },
        {
            "monitor": "Sensor3",
            "display_name": "S3",
            "reading": jsonRadial['3']['yes']
        },
        {
            "monitor": "Sensor4",
            "display_name": "S4",
            "reading": jsonRadial['4']['yes']
        },
        {
            "monitor": "Sensor5",
            "display_name": "S5",
            "reading": jsonRadial['5']['yes']
        },
        {
            "monitor": "Sensor6",
            "display_name": "S6",
            "reading": jsonRadial['6']['yes']
        },
        {
            "monitor": "Sensor7",
            "display_name": "S7",
            "reading": jsonRadial['7']['yes']
        },
        {
            "monitor": "Sensor8",
            "display_name": "S8",
            "reading": jsonRadial['8']['yes']
        },
        {
            "monitor": "Sensor9",
            "display_name": "S9",
            "reading": jsonRadial['9']['yes']
        }
    ]
console.log(selectedSensor);
    //     for(i=0;i<radial.length;i++)
    //     {
    //     localData[0]['reading']  =localData[0]['reading'] +Number(radial[i]['M1']);
    //     localData[1]['reading']  =localData[1]['reading'] +Number(radial[i]['M2']);
    //     localData[2]['reading']  =localData[2]['reading'] +Number(radial[i]['M3']);
    //     localData[3]['reading']  =localData[3]['reading'] +Number(radial[i]['M4']);
    //     localData[4]['reading']  =localData[4]['reading'] +Number(radial[i]['M5']);
    //     localData[5]['reading']  =localData[5]['reading'] +Number(radial[i]['M6']);
    //     localData[6]['reading']  =localData[6]['reading'] +Number(radial[i]['M7']);
    //     localData[7]['reading']  =localData[7]['reading'] +Number(radial[i]['M8']);
    //     localData[8]['reading']  =localData[8]['reading'] +Number(radial[i]['M9']);
    //     }

    //Defining the scale and ticks
    let scale = d3.scaleLinear()
        .domain([0, d3.max(localData, d => d.reading) * 1.1])
        .range([0, 2 * PI]);

    let ticks = scale.ticks(numTicks).slice(0, -1);
    let keys = localData.map((d, i) => d.monitor);

    const numArcs = keys.length;
    const arcWidth = (chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

    let arc = d3.arc()
        .innerRadius((d, i) => getInnerRadius(i))
        .outerRadius((d, i) => getOuterRadius(i))
        .startAngle(0)
        .endAngle((d, i) => scale(d))

    let radialAxis = radial_svg.append('g')
        .attr('class', 'r axis')
        .selectAll('g')
        .data(localData)
        .enter().append('g');

    radialAxis.append('circle')
        .attr('r', (d, i) => getOuterRadius(i) + arcPadding);

    radialAxis.append('text')
        .attr('x', labelPadding)
        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding + 7)
        .text(d => d.display_name);

    let axialAxis = radial_svg.append('g')
        .attr('class', 'a axis')
        .selectAll('g')
        .data(ticks)
        .enter().append('g')
        .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

    axialAxis.append('line')
        .attr('x2', chartRadius);

    axialAxis.append('text')
        .attr('x', chartRadius + 10)
        .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
        .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
        .text(d => d);

    //data arcs
    let arcs = radial_svg.append('g')
        .attr('class', 'data')
        .selectAll('path')
        .data(localData)
        .enter().append('path')
        .attr('class', 'arc')
        .style('fill', (d, i) => sensorsColorScale(d.monitor))
        .style('opacity',(d) => selectedSensor=='All'?1:(d.monitor==selectedSensor?1:0.3));

    arcs.transition()
        .delay((d, i) => i * 0)
        .duration(0)
        .attrTween('d', arcTween);

    arcs.on('mousemove', showTooltip)
    arcs.on('mouseout', hideTooltip)


    function arcTween(d, i) {
        let interpolate = d3.interpolate(0, d.reading);
        return t => arc(interpolate(t), i);
    }

    function showTooltip(d) {
        tooltip.style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(d.reading);
    }

    function hideTooltip() {
        tooltip.style('display', 'none');
    }

    function rad2deg(angle) {
        return angle * 180 / PI;
    }

    function getInnerRadius(index) {
        return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
    }

    function getOuterRadius(index) {
        return getInnerRadius(index) + arcWidth;
    }





}

function drawHeatMap(){
    // d3.select("#heatmap").selectAll("*").remove();
    
    console.log(startDate);
    // sensorval = document.getElementById('sensor').value;
    if(selectedSensor == 'All'){
        sensorval = 1;
    }
    else{
        sensorval = parseInt(selectedSensor[6]);
    }
    
    console.log(sensorval);
    var startdateString = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
    console.log(startdateString);
    var margin = { top: 50, right: 0, bottom: 100, left: 30 },
          width = 960 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 35),
          legendElementWidth = gridSize*2,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
          days = ["AGOC-3A", "Appluimonia", "Chlorodinine", "Methylosmolene"],
          times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
          datasets = [`../MC2Data/sensor_${sensorval}_new.json`];

          console.log(d3.schemeBlues);
    d3.select("#heatmap").selectAll("*").remove();
      var svg = d3.select("#heatmap").append("svg")
          .attr("width", width + margin.left + margin.right +100)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + (margin.left + 100)  + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-10," + gridSize / 1.5 + ")")
            .attr("class", "dayLabel mono axis axis-workweek");

      var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("font", "10px times")
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", "timeLabel mono axis axis-worktime");

      
      d3.json(datasets[0]).then(

        function(data) {

          console.log(data);
          var colorScale = d3.scaleQuantile()
              .domain([0, buckets - 1, d3.max(data[startdateString], function (d) { return (d.value); })])
              .range(colors);

              console.log([0].concat(colorScale.quantiles()));
          var cards = svg.selectAll(".hour")
              .data(data[startdateString]);

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d,i) { return ((d.hour) - 1) * gridSize; })
              .attr("y", function(d) { return ((d.chemical) - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .on('mouseover',function(d,i){
                div.transition()
                .duration(50)
                .style("opacity", 1);
                div.html(`${d.value}`)
                .style("left", (d3.event.pageX) + 10 + "px")
                .style("top", (d3.event.pageY) + 10 + "px");
            })
            .on('mousemove',function(d,i){
                div.transition()
                .duration(50)
                .style("opacity", 1);
                div.html(`${d.value}`)
                .style("left", (d3.event.pageX) + 10 + "px")
                .style("top", (d3.event.pageY) + 10 + "px");
            })
            .on('mouseout',function(d){
                div.transition()
                     .duration(50)
                     .style("opacity", 0);
            })
            //   .transition().duration(500)
              .style("fill", function(d) { return colorScale((d.value)); });

          cards.select("title").text(function(d) { return (d.value); });
          
          cards.exit().remove();

        //   var legend = d3.select('#legendheatmap').selectAll(".legend")
        //       .data([0].concat(colorScale.quantiles()));

        //   legend.enter().append("rect")
        //       .attr("class", "legend")

        //       .attr("x", 100)
        //       .attr("y", 200)
        //       .attr("width", legendElementWidth)
        //       .attr("height", gridSize / 2)
        //       .style("fill", function(d, i) { return colors[i]; });

        //   legend.append("text")
        //     .attr("class", "mono")
        //     .text(function(d) { return "≥ " + Math.round(d); })
        //     .attr("x", function(d, i) { return legendElementWidth * i; })
        //     .attr("y", height + gridSize);

        //   legend.exit().remove();

        });  
}