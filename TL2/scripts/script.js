// var columnSvg;
// const margin = {top: 30, right: 30, bottom: 30, left:30};
// const columnChartWidth = 600 - margin.left - margin.right;
// const columnChartHeight =  400- margin.top - margin.bottom;


// var barPadding = 0.2;

var columnData;

var dated="2016-04-01 05:00:00";



// var c10 = d3.scaleOrdinal(d3.schemeTableau10).domain(["AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"]);



// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function()
{
    // Load all files before doing anything else
    Promise.all([d3.csv('data/column_data.csv')])
            .then(function(values){
                columnData=values[0];
                columnData.map(function(data)
                {
                    var arr = data['RowLabels'].split(/-|\s|:/);// split string and create array.
                    data['RowLabels'] = new Date(arr[0], arr[1] -1, arr[2], arr[3], arr[4], arr[5]); // decrease month value by 1
                })
                drawCharts();
            })
})


function drawCharts()
{
    drawTimeline();
    //drawColumnChart("2016-04-01 05:00:00","2016-04-04 19:00:00");
}


// function drawColumnChart(dateVal1,dateVal2)
// {

    // var columnSvg;
    // const margin = {top: 30, right: 30, bottom: 30, left:30};
    // const columnChartWidth = 600 - margin.left - margin.right;
    // const columnChartHeight =  400- margin.top - margin.bottom;
    
    // var maxY;
    // var barPadding = 0.2;
    // var c10 = d3.scaleOrdinal(d3.schemeTableau10).domain(["AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"]);

//     columnSvg=d3.select("#columnchart").append("svg")
//                 .attr("width", columnChartWidth + margin.left + margin.right)
//                 .attr("height", columnChartHeight + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", `translate(${margin.left},${margin.top})`);

//     var flag=1;

//     var localColumn= columnData.filter(function(d){
//         if(d["RowLabels"]==dateVal1)
//         {
//             flag=0;
//             return true;
//         }
//         if(d["RowLabels"]==dateVal2)
//         {
//             flag=1;
//             return true;
//         }
//         if(flag==0)
//             return true;
//         else
//             return false;
//     })

//     var i;
//     for(i=0;i<localColumn.length;i++)
//     {
//     delete localColumn[i]['RowLabels'];
//     delete localColumn[i]['GrandTotal'];
//     }

//     "AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"
//     localData=[
//         {
//             "chemical":"AGOC-3A",
//             "reading":0
//         },
//         {
//             "chemical":"Appluimonia",
//             "reading":0
//         },
//         {
//             "chemical":"Chlorodinine",
//             "reading":0
//         },
//         {
//             "chemical":"Methylosmolene",
//             "reading":0
//         }
//     ]

//     for(i=0;i<localColumn.length;i++)
//     {
//     localData[0]['reading']  =localData[0]['reading'] +Number(localColumn[i]['AGOC-3A']);
//     localData[1]['reading']  =localData[1]['reading'] +Number(localColumn[i]['Appluimonia']);
//     localData[2]['reading']  =localData[1]['reading'] +Number(localColumn[i]['Chlorodinine']);
//     localData[3]['reading']  =localData[1]['reading'] +Number(localColumn[i]['Methylosmolene']);
//     }

//    // console.log(localData);






//     //set the dimensions and margins of the graph


// // set the ranges
// var x = d3.scaleBand()
//       .range([0, columnChartWidth])
//       .padding(0.1);
// var y = d3.scaleLinear()
//       .range([columnChartHeight, 0]);




// // Scale the range of the data in the domains
// x.domain(localData.map(function(d) { return d.chemical; }));
// y.domain([0, d3.max(localData, function(d) { return d.reading; })]);

// // append the rectangles for the bar chart
// columnSvg.selectAll(".bar")
//   .data(localData)
// .enter().append("rect")
//   .attr("class", "bar")
//   .attr("x", function(d) { return x(d.chemical)+50; })
//   .attr("fill",function(d){return c10(d.chemical);})
//   .attr("width", x.bandwidth()-100)
//   .attr("y", function(d) { return y(d.reading); })
//   .attr("height", function(d) { return columnChartHeight - y(d.reading); });

// // add the x Axis
// columnSvg.append("g")
//   .attr("transform", "translate(0," + columnChartHeight + ")")
//   .call(d3.axisBottom(x));

// // add the y Axis
// columnSvg.append("g")
//   .call(d3.axisLeft(y));


    
// }



function drawTimeline()
{

    const margin = { top: 10, right: 10, bottom: 20, left: 25 };
    const width  = 800 - margin.left - margin.right;
    const height = 80 - margin.top  - margin.bottom;

    var timelineSvg = d3.select("#timeline-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
    console.log(columnData);

    var timeline = timelineSvg.append("g")
    .attr("class", "timeline")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
    .domain(d3.extent(columnData.map(function(d) { return d.RowLabels; })))
    .range([0, width]);

    var y = d3.scaleLinear()
    .domain(d3.extent(columnData.map(function(d) { return Number(d.GrandTotal); })))
    .range([height, 0]);


    // var xAxis = d3.svg.axis()
    // .scale(x)
    // .orient("bottom");

    var xAxis=timelineSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    var yAxis=timelineSvg.append("g")
    .call(d3.axisLeft(y));

// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient("left")
//     .ticks(2);

    // var area = d3.area()
    //     .interpolate("linear")
    //     .x(function(d) { return x(d.RowLabels); })
    //     .y0(height)
    //     .y1(function(d) { return y(Number(d.GrandTotal)); });

       var area= d3.area()
            .curve( d3.curveLinear)
            .x(function(d) { return x(d.RowLabels); })
            .y0(height)
            .y1(function(d) { return y(Number(d.GrandTotal)); })

            timeline.append("path")
        .datum(columnData)
        .attr("class", "area")
        .attr("d", area);


        // var lineFun = d3.line()
        //                 .x(function(d){return d.month*50})
        //                 .y(function(d){return height - (10* d.Sales)})
        //                 .curve(d3.curveBasis);


    //     // Add brush to timeline, hook up to callback
//     var brush = d3.svg.brush()
//         .x(x)
//         .on("brush", function() { brushCallback(brush, dataForMap); })
//         .extent([new Date("12/1/2013"), new Date("1/1/2014")]); // initial value

//     timeline.append("g")
//         .attr("class", "x brush")
//         .call(brush)
//         .selectAll("rect")
//         .attr("y", -6)
//         .attr("height", height + 7);

//     brush.event(timeline.select('g.x.brush')); // dispatches a single brush event


}







// Creates the event timeline and sets up callbacks for brush changes
// function makeTimeline(dataForMap, dataForTimeline) 
// {
//     var margin = { top: 10, right: 10, bottom: 20, left: 25 },
//         width  = mapWidth - margin.left - margin.right,
//         height = 80 - margin.top  - margin.bottom;

//     var timelineSvg = d3.select("#timeline-container").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom);

//     var timeline = timelineSvg.append("g")
//         .attr("class", "timeline")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     var x = d3.time.scale()
//         .domain(d3.extent(dataForTimeline.map(function(d) { return d.TIME; })))
//         .range([0, width]);

//     var y = d3.scale.linear()
//         .domain(d3.extent(dataForTimeline.map(function(d) { return d.TOT; })))
//         .range([height, 0]);

//     var xAxis = d3.svg.axis()
//         .scale(x)
//         .orient("bottom");

//     var yAxis = d3.svg.axis()
//         .scale(y)
//         .orient("left")
//         .ticks(2);

//     var area = d3.svg.area()
//         .interpolate("linear")
//         .x(function(d) { return x(d.TIME); })
//         .y0(height)
//         .y1(function(d) { return y(d.TOT); });

//     timeline.append("path")
//         .datum(dataForTimeline)
//         .attr("class", "area")
//         .attr("d", area);

//     timeline.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(xAxis);

//     timeline.append("g")
//         .attr("class", "y axis")
//         .call(yAxis);

//     timeline.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("dy", "1em")
//         .style("text-anchor", "end")
//         .text("# Crimes");

//     // Add brush to timeline, hook up to callback
//     var brush = d3.svg.brush()
//         .x(x)
//         .on("brush", function() { brushCallback(brush, dataForMap); })
//         .extent([new Date("12/1/2013"), new Date("1/1/2014")]); // initial value

//     timeline.append("g")
//         .attr("class", "x brush")
//         .call(brush)
//         .selectAll("rect")
//         .attr("y", -6)
//         .attr("height", height + 7);

//     brush.event(timeline.select('g.x.brush')); // dispatches a single brush event
// };

// // Called whenever the timeline brush range (extent) is updated
// // Filters the map data to those points that fall within the selected timeline range
// function brushCallback(brush, dataForMap)
// {
//     if (brush.empty()) {
//         updateMapPoints([]);
//         updateTitleText();
//     } else {
//         var newDateRange = brush.extent(),
//             filteredData = [];

//         dataForMap.forEach(function(d) {
//             if (d.TIME >= newDateRange[0] && d.TIME <= newDateRange[1]) {
//                 filteredData.push(d);
//             }
//         });
//         updateMapPoints(filteredData);
//         updateTitleText(newDateRange);
//     }
// }

