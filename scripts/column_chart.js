var columnSvg;
const margin = {top: 30, right: 30, bottom: 30, left:30};
const columnChartWidth = 600 - margin.left - margin.right;
const columnChartHeight =  400- margin.top - margin.bottom;


var barPadding = 0.2;

var columnData;

var maxY;

var c10 = d3.scaleOrdinal(d3.schemeTableau10).domain(["AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"]);



// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function()
{
    // Load all files before doing anything else
    Promise.all([d3.csv('MC2Data/column_data.csv')])
            .then(function(values){
                columnData=values[0];
                drawCharts();
            })
})


function drawCharts()
{
    drawColumnChart("2016-04-01 05:00:00","2016-04-04 19:00:00")
}


function drawColumnChart(dateVal1,dateVal2)
{

    columnSvg=d3.select("#columnchart").append("svg")
                .attr("width", columnChartWidth + margin.left + margin.right)
                .attr("height", columnChartHeight + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

    var flag=1;

    var localColumn= columnData.filter(function(d){
        if(d["RowLabels"]==dateVal1)
        {
            flag=0;
            return true;
        }
        if(d["RowLabels"]==dateVal2)
        {
            flag=1;
            return true;
        }
        if(flag==0)
            return true;
        else
            return false;
    })

    var i;
    for(i=0;i<localColumn.length;i++)
    {
    delete localColumn[i]['RowLabels'];
    delete localColumn[i]['GrandTotal'];
    }

    "AGOC-3A","Appluimonia","Chlorodinine","Methylosmolene"
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
    localData[2]['reading']  =localData[1]['reading'] +Number(localColumn[i]['Chlorodinine']);
    localData[3]['reading']  =localData[1]['reading'] +Number(localColumn[i]['Methylosmolene']);
    }

   // console.log(localData);






    //set the dimensions and margins of the graph


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
  .attr("x", function(d) { return x(d.chemical)+50; })
  .attr("fill",function(d){return c10(d.chemical);})
  .attr("width", x.bandwidth()-100)
  .attr("y", function(d) { return y(d.reading); })
  .attr("height", function(d) { return columnChartHeight - y(d.reading); });

// add the x Axis
columnSvg.append("g")
  .attr("transform", "translate(0," + columnChartHeight + ")")
  .call(d3.axisBottom(x));

// add the y Axis
columnSvg.append("g")
  .call(d3.axisLeft(y));


    
}



