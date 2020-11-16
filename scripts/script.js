var globalData;

var c10 = d3.scaleOrdinal(d3.schemeTableau10).domain(["AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"]);

function dateFormatter(dateToChange)
{   console.log(dateToChange);
    var arr = dateToChange.split(/-|\s|:/);// split string and create array.
    dateToChange = new Date(arr[0], arr[1] -1, arr[2], arr[3], arr[4], arr[5]); // decrease month value by 1
    console.log(dateToChange);
    return dateToChange;
}

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function()
{
    // Load all files before doing anything else
    Promise.all([d3.csv('MC2Data/column_data.csv')])
            .then(function(values){
                globalData=values[0];
                globalData.map(function(data)
                {
                    data['RowLabels']=dateFormatter(data['RowLabels']);
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
    drawColumnChart(startDate,endDate);
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