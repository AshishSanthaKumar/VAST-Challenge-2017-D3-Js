var globalData;
var radialData;
var lineData;
var date_list=[];
var s1=[];
var s2=[];
var s3=[];
var s4=[];
var c10 = d3.scaleOrdinal(d3.schemeTableau10).domain(["AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"]);

function dateFormatter(dateToChange)
{   
    var arr = dateToChange.split(/-|\s|:/);// split string and create array.
    dateToChange = new Date(arr[0], arr[1] -1, arr[2], arr[3], arr[4], arr[5]); // decrease month value by 1
    return dateToChange;
}

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function()
{
    // Load all files before doing anything else
    Promise.all([d3.csv('MC2Data/column_data.csv'), d3.csv('MC2Data/radial_chart_data_clean.csv'),d3.csv("/linechart/sensor_1_new.csv")])
            .then(function(values){
                globalData=values[0];
                radialData=values[1];
                lineData=values[2];
                globalData.map(function(data)
                {
                    data['RowLabels']=dateFormatter(data['RowLabels']);
                })
                radialData.map(function(data)
                {
                    data['Date']=dateFormatter(data['Date']);
                })
                drawPage();
            })
})


function drawPage()
{
    var startDate;
    var endDate;
    var selectedDate=document.getElementById("months").value;
    if(selectedDate=='April')
    {
        startDate=dateFormatter('2016-04-01 00:00:00');
        endDate=dateFormatter('2016-04-30 23:00:00')
    }
    if(selectedDate=='August')
    {
        startDate=dateFormatter('2016-08-01 00:00:00');
        endDate=dateFormatter('2016-08-31 23:00:00')
    }
    if(selectedDate=='December')
    {
        startDate=dateFormatter('2016-12-01 00:00:00');
        endDate=dateFormatter('2016-12-31 23:00:00')
    }
  
    drawTimeline(startDate,endDate);
    //drawColumnChart("2016-04-01 05:00:00","2016-04-04 19:00:00");
}


function drawTimeline(startDate,endDate)
{
    const margin = { top: 10, right: 10, bottom: 20, left: 25 };
    const width  = 1400 - margin.left - margin.right;
    const height = 80 - margin.top  - margin.bottom;

    var startDate;
    var endDate;

    d3.select("#timeline-container").selectAll("*").remove();

    var timelineSvg = d3.select("#timeline-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
    
    var timeLineData= globalData.filter(
        function(d)
        {
            return startDate<=d['RowLabels'] && endDate>=d['RowLabels'];
        }
    )


    var timeline = timelineSvg.append("g")
    .attr("class", "timeline")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
    .domain(d3.extent(timeLineData.map(function(d) { return d.RowLabels; })))
    .range([0, width]);

    var y = d3.scaleLinear()
    .domain(d3.extent(timeLineData.map(function(d) { return Number(d.GrandTotal); })))
    .range([height, 0]);


    var xAxis=timelineSvg.append("g")
    .attr("transform", "translate("+(margin.left)+"," + (height+10) + ")")
    .call(d3.axisBottom(x));

    var yAxis=timelineSvg.append("g")
    .attr("transform", "translate("+(margin.left)+"," + (margin.top) + ")")
    .call(d3.axisLeft(y).ticks(3));

       var area= d3.area()
            .curve( d3.curveLinear)
            .x(function(d) { return x(d.RowLabels); })
            .y0(height)
            .y1(function(d) { return y(Number(d.GrandTotal)); })

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
        .extent([[0, 0], [width, 50]])
        .on("brush", brushed);

        timeline.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

      function brushed() {
        var selection = d3.event.selection;
        var rangeDate=selection.map(x.invert,x);
        startDate=rangeDate[0];
        endDate=rangeDate[1];

        drawAllCharts(startDate,endDate);
      }

    drawAllCharts(startDate,endDate);                
}

function drawAllCharts(startDate,endDate)
{
    drawLineChart(startDate,endDate,lineData);
    drawColumnChart(startDate,endDate);
    drawRadialChart(startDate,endDate);
    
}


function drawColumnChart(startDate,endDate)
{

    var columnSvg;
    const margin = {top: 30, right: 30, bottom: 40, left:60};
    const columnChartWidth = 600 - margin.left - margin.right;
    const columnChartHeight =  400- margin.top - margin.bottom;
    
    var maxY;
    var barPadding = 0.2;
    
    d3.select("#column-container").selectAll("*").remove();
    columnSvg=d3.select("#column-container").append("svg")
                .attr("width", columnChartWidth + margin.left + margin.right)
                .attr("height", columnChartHeight + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);


    var localColumn= globalData.filter(function(d){
                    return d['RowLabels']>=startDate && d['RowLabels']<=endDate;
    });

  
    localData=[
        {
            "chemical":"AGOC-3A",
            "reading":0
        },
        {
            "chemical":"Appluimonia",
            "reading":0
        },
        {
            "chemical":"Chlorodinine",
            "reading":0
        },
        {
            "chemical":"Methylosmolene",
            "reading":0
        }
    ]

    for(i=0;i<localColumn.length;i++)
    {
    localData[0]['reading']  =localData[0]['reading'] +Number(localColumn[i]['AGOC-3A']);
    localData[1]['reading']  =localData[1]['reading'] +Number(localColumn[i]['Appluimonia']);
    localData[2]['reading']  =localData[2]['reading'] +Number(localColumn[i]['Chlorodinine']);
    localData[3]['reading']  =localData[3]['reading'] +Number(localColumn[i]['Methylosmolene']);
    }




    // set the ranges
    var x = d3.scaleBand()
        .range([0, columnChartWidth])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([columnChartHeight, 0]);

  

    // Scale the range of the data in the domains
    x.domain(localData.map(function(d) { return d.chemical; }));
    y.domain([0, d3.max(localData, function(d) { return d.reading; })]);

    // append the rectangles for the bar chart
    columnSvg.selectAll(".bar")
    .data(localData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.chemical)+40;})
    .attr("fill",function(d){return c10(d.chemical);})
    .attr("width", x.bandwidth()-75)
    .attr("y", function(d) { return y(d.reading); })
    .attr("height", function(d) { return columnChartHeight - y(d.reading); });

    // add the x Axis
    columnSvg.append("g")
    .attr("transform", "translate(0," + columnChartHeight + ")")
    .call(d3.axisBottom(x));

    // add the y Axis
    columnSvg.append("g")
    .call(d3.axisLeft(y).ticks(4));


    columnSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (columnChartHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Chemical Reading");  


    columnSvg.append("text")             
    .attr("transform",
          "translate(" + (columnChartWidth/2) + " ," + 
                         (columnChartHeight + margin.top+3) + ")")
    .style("text-anchor", "middle")
    .text("Chemicals");
}

function drawRadialChart(startDate,endDate){
    d3.select("#radialchart").selectAll("*").remove();
    var radial_svg;
    const width = 600, height = 450,
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

    var radial= radialData.filter(function(d){
        return d['Date']>=startDate && d['Date']<=endDate;
    });

    localData=[
        {
            "monitor":"M1",
            "reading":0
        },
        {
            "monitor":"M2",
            "reading":0
        },
        {
            "monitor":"M3",
            "reading":0
        },
        {
            "monitor":"M4",
            "reading":0
        },
        {
            "monitor":"M5",
            "reading":0
        },
        {
            "monitor":"M6",
            "reading":0
        },
        {
            "monitor":"M7",
            "reading":0
        },
        {
            "monitor":"M8",
            "reading":0
        },
        {
            "monitor":"M9",
            "reading":0
        }
    ]

    for(i=0;i<radial.length;i++)
    {
    localData[0]['reading']  =localData[0]['reading'] +Number(radial[i]['M1']);
    localData[1]['reading']  =localData[1]['reading'] +Number(radial[i]['M2']);
    localData[2]['reading']  =localData[2]['reading'] +Number(radial[i]['M3']);
    localData[3]['reading']  =localData[3]['reading'] +Number(radial[i]['M4']);
    localData[4]['reading']  =localData[4]['reading'] +Number(radial[i]['M5']);
    localData[5]['reading']  =localData[5]['reading'] +Number(radial[i]['M6']);
    localData[6]['reading']  =localData[6]['reading'] +Number(radial[i]['M7']);
    localData[7]['reading']  =localData[7]['reading'] +Number(radial[i]['M8']);
    localData[8]['reading']  =localData[8]['reading'] +Number(radial[i]['M9']);
    }

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
        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding+7)
        .text(d => d.monitor);
    
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
          .style('fill', (d, i) => c10(i))
    
      arcs.transition()
        .delay((d, i) => i * 200)
        .duration(1000)
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
function convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
      hour=(String(date.getHours())).slice(-2)
      minute=("0" + date.getMinutes()).slice(-2)
      //second=("0" + date.getSeconds()).slice(-2)
    return ([mnth,day,date.getFullYear()].join("/")+ " " +[hour,minute].join(":"));
  }

function drawLineChart(startDate,endDate)
{  
    
    // set the dimensions and margins of the graph
var margin = {top: 30, right: 20, bottom: 50, left: 50},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;


d3.select("#line-container").selectAll("*").remove();
  // append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
// we are appending SVG first
var lineSvg = d3.select("#line-container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //.style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

      // Define date parser
var timeConv = d3.timeParse("%-m/%-d/%Y %H:%M");
         
     // set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);

// define the 1st line
var valueline1 = d3.line()
// .defined(d => !isNaN(d.Methylosmolene))
// .x(d => x(d.date))
// .y(d => y(d.Methylosmolene));
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.Methylosmolene); });

// define the 2nd line
var valueline2 = d3.line()
    .defined(d => !isNaN(d.Chlorodinine))
    .x(d => x(d.date))
    .y(d => y(d.Chlorodinine));

    // .x(function(d) { return x(d.date); })
    // .y(function(d) { return y(d.Chlorodinine); }); 
      
// define the 3rd line
var valueline3 = d3.line()
    .defined(d => !isNaN(d.AGOC_3A))
    .x(d => x(d.date))
    .y(d => y(d.AGOC_3A));  
    // .x(function(d) { return x(d.date); })
    // .y(function(d) { return y(d.AGOC_3A); });

// define the 4th line
var valueline4 = d3.line()
    .defined(d => !isNaN(d.Appluimonia))
    .x(d => x(d.date))
    .y(d => y(d.Appluimonia)); 
    // .x(function(d) { return x(d.date); })
    // .y(function(d) { return y(d.Appluimonia); }); 
     d3.csv("/linechart/sensor_1_new.csv").then(function(data) {
        
      data.forEach(function(d)
      {
        //console.log(Date.parse(timeConv(d.date)));

        if((Date.parse(timeConv(d.date))>=Date.parse(convert(startDate))) && (Date.parse(timeConv(d.date))<=Date.parse(convert(endDate))))
        {
            d.date=timeConv(d.date);
            d.Methylosmolene=+d.Methylosmolene
            d.Chlorodinine=+d.Chlorodinine;
            d.AGOC_3A=+d.AGOC_3A;
            d.Appluimonia=+d.Appluimonia;
         console.log(d.date)   
        }
        
      });
      
      // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.date; }));
  //x.domain([startDate,endDate])
  y.domain([0,10])
//   y.domain([0, d3.max(data, function(d) {
// 	  return Math.max(d.Methylosmolene,d.Chlorodinine,d.AGOC_3A,d.Appluimonia); })]);

  //Add the valueline path.
  lineSvg.append("path")
      .data(data)
      .attr("class", "line")
      .style("stroke", "red")
      .attr("transform", "translate(20,0)")
      .attr("d", valueline1);

  // Add the valueline2 path.
  lineSvg.append("path")
      .data(data)
      .attr("class", "line")
      .style("stroke", "yellow")
      .attr("transform", "translate(20,0)")
      .attr("d", valueline2);
  // Add the valueline path.
  lineSvg.append("path")
      .data(data)
      .attr("class", "line")
      .style("stroke", "blue")
      .attr("transform", "translate(20,0)")
      .attr("d", valueline3);

  // Add the valueline2 path.
  lineSvg.append("path")
      .data(data)
      .attr("class", "line")
      .style("stroke", "green")
      .attr("transform", "translate(20,0)")
      .attr("d", valueline4);

  // Add the X Axis
  lineSvg.append("g")
      .attr("transform", "translate(20," + height + ")")
      
      .call(d3.axisBottom(x)
      .ticks(d3.timeDay.every(4))
      .tickFormat(d3.timeFormat('%m/%d %H:%M')))
      .selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

  // Add the Y Axis
  lineSvg.append("g")
      .call(d3.axisLeft(y))
      .attr("transform", "translate(20,0)")
    
    });

    
}