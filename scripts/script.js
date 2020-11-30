var globalData;

var startDate;
var endDate;
var selectedMethod;
// var c10 = d3.scaleOrdinal(d3.schemePaired).domain(["AGOC-3A", "Test1","Appluimonia","Test", "Chlorodinine","Test2","Test3","Test4","Test5", "Methylosmolene"]);

var chemicalColor={
    'AGOC-3A':'#A6CEE3',
    'Appluimonia':'#B2DF8A',
    'Chlorodinine':'#FB9A99',
    'Methylosmolene':'#6A3D9A'
}
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
    selectedMethod=document.getElementById("method").value;
    drawTimeline();

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
        .call(brush.move,[91,350]);


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
{    d3.select("#heatmap").selectAll("*").remove();
     drawLineChart();
    drawColumnChart();
    drawRadialChart();
    drawHeatMap();
}


function drawColumnChart() {
    
    var columnSvg;
    const margin = {
        top: 50,
        right: 30,
        bottom: 50,
        left: 50
    };
    const columnChartWidth = 340 - margin.left - margin.right;
    const columnChartHeight = 300 - margin.top - margin.bottom;

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
            return x(d.chemical) + 20;
        })
        .attr("fill", function (d) {
            return chemicalColor[d.chemical];
        })
        .attr("width", x.bandwidth() - 40)
        .attr("y", function (d) {
            return y(d.reading);
        })
        .attr("height", function (d) {
            return columnChartHeight - y(d.reading);
        });


    // add the x Axis
    columnSvg.append("g")
        .attr("transform", "translate(0," + columnChartHeight + ")")
        .attr("class","x-axis")
        .call(d3.axisBottom(x));

    // add the y Axis
    columnSvg.append("g")
        .call(d3.axisLeft(y).ticks(4));


    columnSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10 - margin.left)
        .attr("x", 0 - (columnChartHeight / 2))
        .attr("dy", "1em")
        .style("font-size", "11px") 
        .style("text-anchor", "middle")
        .text("Chemical Reading");


    columnSvg.append("text")
        .attr("transform",
            "translate(" + (columnChartWidth / 2) + " ," +
            (columnChartHeight + margin.top-20) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "11px") 
        .text("Chemicals");

    columnSvg.append("text")
        .attr("x", (columnChartWidth / 2-10))             
        .attr("y",  - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "11px") 
        .style("text-decoration", "underline")  
        .text(selectedSensor=='All'?'Average chemical reading of all the Sensors in the time frame':('Average chemical reading from Sensor '+selectedSensor.slice(-1)+' in the  time frame'));

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
    const width = 340,
        height = 320,
        chartRadius = height / 1.8 - 50;


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
        .attr('transform', 'translate(' + width / 2 + ',' + height / 1.8 + ')');

    radial_svg.append("text")
        .attr("x", 0)             
        .attr("y", -165)
        .attr("text-anchor", "middle")  
        .style("font-size", "11px") 
        .style("text-decoration", "underline")
        .text("Number of duplicates in the selected time frame")  



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


    //Defining the scale and ticks
    let scale = d3.scaleLinear()
        .domain([0, d3.max(localData, d => d.reading) * 1.2])
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
        .attr('x', labelPadding+4)
        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding +2 )
        .text(d => d.display_name)
        .style('font-size','10px');

    let axialAxis = radial_svg.append('g')
        .attr('class', 'a axis')
        .selectAll('g')
        .data(ticks)
        .enter().append('g')
        .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

    axialAxis.append('line')
        .attr('x2', chartRadius);

    axialAxis.append('text')
        .attr('x', chartRadius + 7)
        .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
        .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
        .style('font-size','11px')
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
        div.transition()
                .duration(50)
                .style("opacity", 1);
        div.html(`${d.reading}`)
                .style("left", (d3.event.pageX) + 10 + "px")
                .style("top", (d3.event.pageY) + 10 + "px");

    }

    function hideTooltip() {
        div.transition()
                     .duration(50)
                     .style("opacity", 0);
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
    console.log('Inside Heatmap Chart');
   
    d3.selectAll(".mono").remove();
    if(selectedSensor == 'All'){
        sensorval = 'All';
        // return;
    }
    else{
        sensorval = parseInt(selectedSensor[6]);
    }
    
   
    var startdateString = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
    
    var margin = { top: 50, right: 0, bottom: 100, left: 30 },
          width = 900 - margin.left - margin.right - 150,
          height = 430 - margin.top - margin.bottom - 60,
          gridSize = Math.floor(width / 35),
          legendElementWidth = gridSize*2.25,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]//d3.schemePurples[9], // alternatively colorbrewer.YlGnBu[9]
          days = ["AGOC-3A", "Appluimonia", "Chlorodinine", "Methylosmolene"],
          times = ["12a","1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];
          datasets = [`../MC2Data/sensor_${sensorval}_new.json`];
       //   
    d3.select("#heatmap").selectAll("*").remove();

    d3.select('#heatmaptext').remove();
    // document.querySelectorAll('.mono').forEach(function(a){
    //     a.remove()
    // })

    
      var svg = d3.select("#heatmap").append("svg")
          .attr('id','heatsvg')
          .attr("width", width )
          .attr("height", height)
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

            svg.append("text")
            .attr("x", width/4 + 50)             
            .attr("y", -32)
            .attr("text-anchor", "middle")  
            .style("font-size", "13px") 
            .style("text-decoration", "underline")
            .text(selectedSensor=='All'?('Chemical reading of all the Sensors on '+startdateString):('Chemical reading of Sensor '+selectedSensor.slice(-1)+' on '+startdateString)); 

      
      d3.json(datasets[0]).then(

        function(data) {

     
          var colorScale = d3.scaleQuantile()
              .domain([0, buckets - 1, d3.max(data[startdateString], function (d) { return (d.value); })])
              .range(colors);

              
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

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()));
            console.log([0].concat(colorScale.quantiles()))

            // legend.enter().append("g")
            // .attr("class", "legend")
            // .attr("transform","translate(210,180)");

              legend.enter().append("rect")
            //   .attr("class", "legend")
              .attr("x", function(d,i){
                return legendElementWidth*i + 20;
              })
              .attr("y", 100)
              .attr("width", legendElementWidth)
              .attr("height", gridSize / 2)
              .style("fill", function(d, i) { return colors[i]; });

               
          legend.enter().append("text")
            .attr("class", "mono")
            .attr("id","heatmaptext")
            .text(function(d) { return "≥" +d.toFixed(2) + ' '; })
            .attr("x", function(d, i) { return legendElementWidth * i + 25 ; })
            .attr("y", 120);

            legend.append("text")
            .text('Heatmap')
            .attr("x", 10)
            .attr("y", 10);

        });  
}



function convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
      hour=(String(date.getHours())).slice(-2)
      minute=("0" + date.getMinutes()).slice(-2)
      //second=("0" + date.getSeconds()).slice(-2)
    return ([mnth,day,date.getFullYear()].join("/")+ " " +[hour,minute].join(":"));
  }

  function convert1(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    hour = ("0" + String(date.getHours())).slice(-2)
    minute = ("0" + date.getMinutes()).slice(-2)
    //second=("0" + date.getSeconds()).slice(-2)
    return ([date.getFullYear(), mnth, day].join("-") + " " + [hour, minute].join(":"));
  }
function drawLineChart()
{  
    console.log("inside linechart")
    // set the dimensions and margins of the graph
var lineSvg;
var margin = {top: 30, right: 20, bottom: 400, left: 50},
width = 960 - margin.left - margin.right,
height = 1000 - margin.top - margin.bottom;



      // Define date parser
var timeConv = d3.timeParse("%Y-%m-%d %H:%M:%S");

     // set the ranges
var x = d3.scaleTime().range([0, width/2]);
var bisect = d3.bisector(function(d) { return d.x; }).left;
var y = d3.scaleLinear().rangeRound([height/4, 0]);
var y1 = d3.scaleLinear().rangeRound([height/4, 0]);
var y2 = d3.scaleLinear().rangeRound([height/4, 0]);
var y3 = d3.scaleLinear().rangeRound([height/4, 0]);
var y4 = d3.scaleLinear().rangeRound([height/4, 0]);


// define the 1st line
var valueline1 = d3.line()
    .x(function(d) { 
      return x( new Date(d.date)); })
    .y(function(d) { return y1(d.AGOC_3A); });

// define the 2nd line
var valueline2 = d3.line()
    .x(function(d) { return x( new Date(d.date)); })
    .y(function(d) { return y2(d.Appluimonia); }); 
      
// define the 3rd line
var valueline3 = d3.line()
    .x(function(d) { return x( new Date(d.date)); })
    .y(function(d) { return y3(d.Chlorodinine); });

// define the 4th line
var valueline4 = d3.line()
    .x(function(d) { return x(new Date(d.date)); })
    .y(function(d) { return y4(d.Methylosmolene); }); 
    
    if(selectedSensor == 'All'){
        sensorval = "main";
    }
    else{
        sensorval = parseInt(selectedSensor[6]);
    }

     d3.csv("/linechart/sensor_"+ sensorval +"_final.csv").then(function(data) {
       var new_data= [];
    
      data.forEach(function(d)
      {
        var element={};
        if((Date.parse(timeConv(d.date))>=Date.parse(convert(startDate))) && (Date.parse(timeConv(d.date))<=Date.parse(convert(endDate))))
        {   
          if(selectedMethod == "reading")
          {
            element.date=d.date;
            element.Methylosmolene=+d.Methylosmolene;
            element.Appluimonia=+d.Appluimonia;
            element.AGOC_3A=+d.AGOC_3A
            element.Chlorodinine=+d.Chlorodinine;
            element.Chlorodinine_anamoly = +d.Chlorodinine_anamoly;
            element.Methylosmolene_anamoly = +d.Methylosmolene_anamoly;
            element.AGOC_anamoly = +d.AGOC_anamoly;
            element.Appluimonia_anamoly = +d.Appluimonia_anamoly;
            new_data.push(element);
          }
          else if(selectedMethod == "cum_sum")
          {
            element.date=d.date;
            element.Methylosmolene=+d.Methylosmolene_cum_sum;
            element.Appluimonia=+d.Appluimonia_cum_sum;
            element.AGOC_3A=+d.AGOC_3A_cum_sum;
            element.Chlorodinine=+d.Chlorodinine_cum_sum;
            element.Chlorodinine_anamoly = +d.Chlorodinine_anamoly;
            element.Methylosmolene_anamoly = +d.Methylosmolene_anamoly;
            element.AGOC_anamoly = +d.AGOC_anamoly;
            element.Appluimonia_anamoly = +d.Appluimonia_anamoly;
            new_data.push(element);
          }
          else if(selectedMethod == "cube")
          {
            element.date=d.date;
            element.Methylosmolene=+d.Methylosmolene_cube;
            element.Appluimonia=+d.Appluimonia_cube;
            element.AGOC_3A=+d.AGOC_3A_cube;
            element.Chlorodinine=+d.Chlorodinine_cube;
            element.Chlorodinine_anamoly = +d.Chlorodinine_anamoly;
            element.Methylosmolene_anamoly = +d.Methylosmolene_anamoly;
            element.AGOC_anamoly = +d.AGOC_anamoly;
            element.Appluimonia_anamoly = +d.Appluimonia_anamoly;
            new_data.push(element);
          }
          else if(selectedMethod == "square_root")
          {
            element.date=d.date;
            element.Methylosmolene=+d.Methylosmolene_square_root;
            element.Appluimonia=+d.Appluimonia_square_root;
            element.AGOC_3A=+d.AGOC_3A_square_root;
            element.Chlorodinine=+d.Chlorodinine_square_root;
            element.Chlorodinine_anamoly = +d.Chlorodinine_anamoly;
            element.Methylosmolene_anamoly = +d.Methylosmolene_anamoly;
            element.AGOC_anamoly = +d.AGOC_anamoly;
            element.Appluimonia_anamoly = +d.Appluimonia_anamoly;
            new_data.push(element);
          }
        }
      });
      d3.select("#line-container").selectAll("*").remove();
  // append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
// we are appending SVG first
lineSvg = d3.select("#line-container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", 500)
    .attr("height", height + margin.top + margin.bottom-100)
    //.style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

      // Scale the range of the data
  x.domain(d3.extent(new_data, function(d) { return new Date(d.date); })).clamp(true);
  y4.domain([0, d3.max(new_data, function(d) {
    return Math.max(d.Methylosmolene); })]);
  y3.domain([0, d3.max(new_data, function(d) {
    return Math.max(d.Chlorodinine); })]);
  y1.domain([0, d3.max(new_data, function(d) {
    return Math.max(d.AGOC_3A); })]);
  y2.domain([0, d3.max(new_data, function(d) {
    return Math.max(d.Appluimonia); })]);
  // y.domain([0, d3.max(new_data, function(d) {
  //   return Math.max(d.Methylosmolene,d.Chlorodinine,d.AGOC_3A,d.Appluimonia); })]);

  //Add the 1st valueline path.
  lineSvg.append("path")
      .datum(new_data)
      .attr("class", "line")
      .style("stroke", "#A6CEE3")
      .attr("transform", "translate(50,30)")
      .attr("d", valueline1);

      lineSvg.selectAll("dot")
.data(new_data)

.enter().append("circle")
.attr("r", function(d)
{
  if(d.AGOC_anamoly==1)
  {return 3;}
else
{return 0;
}
})
.attr("fill", "red")
.attr("transform", "translate(50,30)")
.attr("cx", function(d) { 
 return x(new Date(d.date)); })
.attr("cy", function(d) { 
  return y1(d.AGOC_3A); });
  var bisect1 = d3.bisector(function (d) {return d.date; }).left;

  var focus1 = lineSvg
    .append('g')
    .append('circle')
    .attr("transform","translate(50,30)")
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 0)
    .style("opacity", 0);

  lineSvg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width / 2)
    .attr('height', height / 4)
    .attr("transform", "translate(50,30)")
    .on('mouseover', mouseover1)
    .on('mousemove', mousemove1)
    .on('mouseout', mouseout1);

  function mouseover1() {
    focus1.style("opacity", 1)
  }

  function mousemove1() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect1(new_data, convert1(x0) + ":00", 1);
    selectedData = new_data[i];
    focus1
      .attr("cx", x(new Date(selectedData.date)))
      .attr("cy", y(selectedData.AGOC_3A));

    div.transition().duration(50).style("opacity", 0.8);

    div.html("Date: " + selectedData.date + "<br /> AGOC_3A Concentration: " + selectedData.AGOC_3A + "</b>")
      .style("left", (d3.event.pageX) + 15 + "px")
      .style("top", (d3.event.pageY) - 45 + "px");

  }
  function mouseout1() {

    focus1.style("opacity", 0);
    div.transition().duration('50').style("opacity", 0);
  }


            

  // Add the 2nd valueline path.
  lineSvg.append("path")
      .datum(new_data)
      .attr("class", "line")
      .attr("stroke-width", 0.1)
      .style("stroke", "#B2DF8A")
      .attr("transform",  "translate(50,230)")
      .attr("d", valueline2);

      lineSvg.selectAll("dot")
      .data(new_data)
      
      .enter().append("circle")
      .attr("r", function(d)
      {
        if(d.Appluimonia_anamoly==1)
        {return 3;}
      else
      {return 0;
      }
      })
      .attr("fill", "red")
      .attr("transform",  "translate(50,230)")
      .attr("cx", function(d) { 
        return x(new Date(d.date)); })
      .attr("cy", function(d) { 
        return y2(d.Appluimonia); });
      var  bisect2 = d3.bisector(function (d) { return d.date; }).left;

  var focus2 = lineSvg
    .append('g')
    .append('circle')
    .attr("transform", "translate(50,230)")
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 0)
    .style("opacity", 0);

  lineSvg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width / 2)
    .attr('height', height / 4)
    .attr("transform",  "translate(50,230)")
    .on('mouseover', mouseover2)
    .on('mousemove', mousemove2)
    .on('mouseout', mouseout2);

  function mouseover2() {
    focus2.style("opacity", 1)
  }

  function mousemove2() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect2(new_data, convert1(x0) + ":00", 1);
    selectedData = new_data[i];
    focus2
      .attr("cx", x(new Date(selectedData.date)))
      .attr("cy", y(selectedData.Appluimonia));

    div.transition().duration(50).style("opacity", 0.8);

    div.html("Date: " + selectedData.date + "<br /> Appluimonia Concentration: " + selectedData.Appluimonia + "</b>")
      .style("left", (d3.event.pageX) + 15 + "px")
      .style("top", (d3.event.pageY) - 45 + "px");

  }
  function mouseout2() {

    focus2.style("opacity", 0);
    div.transition().duration('50').style("opacity", 0);
  }

        

  // Add the 3rd valueline path.
  lineSvg.append("path")
      .datum(new_data)
      .attr("class", "line")
      .style("stroke", "#FB9A99")
      .attr("stroke-width", 0.1)
      .attr("transform","translate(50,430)")
      .attr("d", valueline3);

      lineSvg.selectAll("dot")
      .data(new_data)
      
      .enter().append("circle")
      .attr("r", function(d)
      {
        if(d.Chlorodinine_anamoly==1)
        {return 3;}
      else
      {return 0;
      }
      })
      .attr("fill", "red")
      .attr("transform", "translate(50,430)")
      .attr("cx", function(d) { 
        return x(new Date(d.date)); })
      .attr("cy", function(d) { 
        return y3(d.Chlorodinine); });
        var  bisect3 = d3.bisector(function (d) { return d.date; }).left;

  var focus3 = lineSvg
    .append('g')
    .append('circle')
    .attr("transform","translate(50,430)")
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 0)
    .style("opacity", 0);

  lineSvg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('class', 'tooltip')
    .attr('width', width / 2)
    .attr('height', height / 4)
    .attr("transform", "translate(50,430)")
    .on('mouseover', mouseover3)
    .on('mousemove', mousemove3)
    .on('mouseout', mouseout3);

  function mouseover3() {
    focus3.style("opacity", 1)
  }

  function mousemove3() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect3(new_data, convert1(x0) + ":00", 1);
    selectedData = new_data[i];
    focus3
      .attr("cx", x(new Date(selectedData.date)))
      .attr("cy", y(selectedData.Chlorodinine));

    div.transition().duration(50).style("opacity", 0.8);

    div.html("Date: " + selectedData.date + "<br /> Chlorodinine Concentration: " + selectedData.Chlorodinine + "</b>")
      .style("left", (d3.event.pageX) + 15 + "px")
      .style("top", (d3.event.pageY) - 45 + "px");

  }
  function mouseout3() {

    focus4.style("opacity", 0);
    div.transition().duration('50').style("opacity", 0);
  }


  // Add the 4th valueline path.
  lineSvg.append("path")
      .datum(new_data)
      .attr("class", "line")
      .style("stroke", "#6A3D9A")
      .attr("stroke-width", 4)
      .attr("transform", "translate(50,630)")
      .attr("d", valueline4);

      lineSvg.selectAll("dot")
      .data(new_data)
      
      .enter().append("circle")
      .attr("r", function(d)
      {
        if(d.Methylosmolene_anamoly==1)
        {return 3;}
      else
      {return 0;
      }
      })
      .attr("fill", "red")
      .attr("transform","translate(50,630)")
      .attr("cx", function(d) { 
        return x(new Date(d.date)); })
      .attr("cy", function(d) { 
        return y4(d.Methylosmolene); });
        var  bisect4 = d3.bisector(function (d) { return d.date; }).left;

  var focus4 = lineSvg
    .append('g')
    .append('circle')
    .attr("transform", "translate(50,630)")
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 0)
    .style("opacity", 0);

  lineSvg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('class', 'tooltip')
    .attr('width', width / 2)
    .attr('height', height / 4)
    .attr("transform", "translate(50,630)")
    .on('mouseover', mouseover4)
    .on('mousemove', mousemove4)
    .on('mouseout', mouseout4);

  function mouseover4() {
    focus4.style("opacity", 1)
  }

  function mousemove4() {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect4(new_data, convert1(x0) + ":00", 1);
    selectedData = new_data[i];
    focus4
      .attr("cx", x(new Date(selectedData.date)))
      .attr("cy", y(selectedData.Methylosmolene));

    div.transition().duration(50).style("opacity", 0.8);

    div.html("Date: " + selectedData.date + "<br /> Methylosmolene Concentration: " + selectedData.Methylosmolene + "</b>")
      .style("left", (d3.event.pageX) + 15 + "px")
      .style("top", (d3.event.pageY) - 45 + "px");

  }
  function mouseout4() {

    focus4.style("opacity", 0);
    div.transition().duration('50').style("opacity", 0);
  }

if(selectedMethod == "reading")
{
  lineSvg.append("text")
      .attr("x", width/2 - 190)             
      .attr("y",  margin.top - 20)
      .attr("text-anchor", "middle")  
      .style("font-size", "11px") 
      .style("text-decoration", "underline")  
      .text(selectedSensor=='All'?'Chemical reading of all the Sensors in the time frame':('Chemical reading of Sensor '+selectedSensor.slice(-1)+' in the  time frame'));
}
else if(selectedMethod == "cum_sum")
{
  lineSvg.append("text")
      .attr("x", width/2 - 190)             
      .attr("y",  margin.top - 20)
      .attr("text-anchor", "middle")  
      .style("font-size", "11px") 
      .style("text-decoration", "underline")  
      .text(selectedSensor=='All'?'Cumulative Summation of chemical reading of all the Sensors in the time frame':('Cumulative Summation of chemical reading of Sensor '+selectedSensor.slice(-1)+' in the  time frame'));
}
else if(selectedMethod == "cube")
{
  lineSvg.append("text")
      .attr("x", width/2 - 190)             
      .attr("y",  margin.top - 20)
      .attr("text-anchor", "middle")  
      .style("font-size", "11px") 
      .style("text-decoration", "underline")  
      .text(selectedSensor=='All'?'Cube of chemical reading of all the Sensors in the time frame':('Cube of chemical reading of Sensor '+selectedSensor.slice(-1)+' in the  time frame'));
}
else if(selectedMethod == "square_root")
{
  lineSvg.append("text")
      .attr("x", width/2 - 190)             
      .attr("y",  margin.top - 20)
      .attr("text-anchor", "middle")  
      .style("font-size", "11px") 
      .style("text-decoration", "underline")  
      .text(selectedSensor=='All'?'Square Root of chemical reading of all the Sensors in the time frame':('Square Root of chemical reading of Sensor '+selectedSensor.slice(-1)+' in the  time frame'));
}


// Add the 1st X Axis
lineSvg.append("g")
.attr("transform", `translate(50, 173)`)

.call(d3.axisBottom(x)
.ticks(d3.timeDay.every(2))
.tickFormat(d3.timeFormat('%m/%d %H:%M')))
.selectAll("text")	
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-45)");

 // Add the 1st Y Axis
  lineSvg.append("g")
      .call(d3.axisLeft(y1))
      .attr("transform", "translate(50,30)")

// Add the 2nd X Axis
lineSvg.append("g")
.attr("transform", `translate(50, 373)`)

.call(d3.axisBottom(x)
.ticks(d3.timeDay.every(2))
.tickFormat(d3.timeFormat('%m/%d %H:%M')))
.selectAll("text")	
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-45)");

// Add the 2nd Y Axis
lineSvg.append("g")
.call(d3.axisLeft(y2))
.attr("transform", "translate(50,230)");
  
// Add the 3rd X Axis
lineSvg.append("g")
.attr("transform","translate(50,573)")

.call(d3.axisBottom(x)
.ticks(d3.timeDay.every(2))
.tickFormat(d3.timeFormat('%m/%d %H:%M')))
.selectAll("text")	
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-45)");

// Add the 3rd  Y Axis
  lineSvg.append("g")
      .call(d3.axisLeft(y3))
      .attr("transform", "translate(50,430)");

// Add the 4th X Axis
lineSvg.append("g")
.attr("transform", `translate(50, 773)`)

.call(d3.axisBottom(x)
.ticks(d3.timeDay.every(2))
.tickFormat(d3.timeFormat('%m/%d %H:%M')))
.selectAll("text")	
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-45)");

// Add the 4th  Y Axis
lineSvg.append("g")
.call(d3.axisLeft(y4))
.attr("transform", "translate(50,630)");

// text label for the y axis1
lineSvg.append("text")
.attr("transform", "rotate(-90)")
//.attr("id", "y-label")
.attr("y", 0)
.attr("x",-100 )
.attr("dy", "1em")
.style("text-anchor", "middle")
.style("stroke","rgb(166, 206, 227")
.text("AGOC_3A"); 


// text label for the y axis2
lineSvg.append("text")
.attr("transform", "rotate(-90)")
//.attr("id", "y-label")
.attr("y", 0)
.attr("x",-300 )
.attr("dy", "1em")
.style("text-anchor", "middle")
.style("stroke","rgb(178, 223, 138")
.text("Appluimonia"); 
    

// text label for the y axis3
lineSvg.append("text")
.attr("transform", "rotate(-90)")
//.attr("id", "y-label")
.attr("y", 0)
.attr("x",-500 )
.attr("dy", "1em")
.style("text-anchor", "middle")
.style("stroke","rgb(251, 154, 153")
.text("Chlorodinine"); 


// text label for the y axis4
lineSvg.append("text")
.attr("transform", "rotate(-90)")
//.attr("id", "y-label")
.attr("y", 0)
.attr("x",-700 )
.attr("dy", "1em")
.style("text-anchor", "middle")
.style("stroke","rgb(106, 61, 154")
.text("Methylosmolene");
    });

 
    
}