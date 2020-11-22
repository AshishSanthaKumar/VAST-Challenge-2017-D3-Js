function drawLineChart(startDate,endDate,lineData)
{  var count=0;
    // console.log(convert(startDate))
    // console.log(convert(endDate))
    

   for(i=0;i<lineData.length;i++)
{
        // console.log(data.date.localeCompare(convert(endDate)))
        // console.log(Date.parse(data.date))
        // console.log(Date.parse(convert(endDate)))
        // console.log(typeof(data.date));
        // console.log(typeof(convert(endDate)));
        
        if((Date.parse(lineData[i].date)>=Date.parse(convert(startDate))) && (Date.parse(lineData[i].date)<=Date.parse(convert(endDate))))
        {
            date_list.push(lineData[i].date);
            s1.push(lineData[i].Methylosmolene);
            s2.push(lineData[i].Chlorodinine);
            s3.push(lineData[i].AGOC_3A);
            s4.push(lineData[i].Appluimonia);
        }
    }
        
    data=[]
    for (i=0;i<date_list.length;i++)
    {
    data.push({date:`${date_list[i]}`,Methylosmolene:`${s1[i]}`,Chlorodinine:`${s2[i]}`,AGOC_3A:`${s3[i]}`,Appluimonia:`${s4[i]}`})
    }
console.log(data)

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
	// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);


	var z = d3.scaleOrdinal(d3.schemeCategory10);
    
  // define the 1st line
var line1 = d3.line()
.x(function(d) {console.log(x(d.date)); return x(d.date); })
.y(function(d) { console.log(y(d.Methylosmolene));return y(d.Methylosmolene); });

// define the 2nd line
var line2 = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.Chlorodinine); });

  // define the 3rd line
  var line3 = d3.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.AGOC_3A); });
  
  // define the 4th line
  var line4 = d3.line()
  .x(function(d) { console.log(x(d.date));return x(d.date); })
  .y(function(d) { console.log(y(d.Appluimonia));return y(d.Appluimonia); });

  // append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var lineSvg = d3.select("#line-container")
.append("svg")
.attr("id", "lineSvg")
.attr("width", width)
.attr("height",height)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
// format the data
data.forEach(function(d) {
    d.date = d.date;
    d.Methylosmolene = +d.Methylosmolene;
    d.Chlorodinine = +d.Chlorodinine;
    d.AGOC_3A = +d.AGOC_3A;
    d.Appluimonia =+d.Appluimonia;
  });
// Scale the range of the data
x.domain(d3.extent(data, function(d) { return d.date}));
y.domain([0, d3.max(data, function(d) { return d3.max([d.Methylosmolene,d.Chlorodinine,d.AGOC_3A,d.Appluimonia]); })]);

 //console.log(d3.max(data, function(d) { return d3.max([d.Methylosmolene,d.Chlorodinine,d.AGOC_3A,d.Appluimonia]); }))
  
  // Add the valueline path.
  lineSvg.append("path")
    .data(data)
    .attr("class", "line")
    .attr("d", line1)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);

    // Add the valueline path.
    lineSvg.append("path")
    .data(data)
    .attr("class", "line")
    .attr("d", line2)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 2);
  // Add the valueline path.
  lineSvg.append("path")
    .data(data)
    .attr("class", "line")
    .attr("d", line3)
    .attr("fill", "none")
    .attr("stroke", "yellow")
    .attr("stroke-width", 2);
  // Add the valueline path.
  lineSvg.append("path")
    .data(data)
    .attr("class", "line")
    .attr("d", line4)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2);
// Add the X Axis
const xAxis = d3.axisBottom(x).tickFormat((d,i) => `${d}`)
lineSvg.append("g")
    .attr("id","xaxislabels")
    .attr("transform", "translate(0," + height + ")")
    .style("stroke","gray")
    .attr("class", "axisgray")
    .call(xAxis);
var ticks = d3.selectAll("#xaxislabels .tick text");
    ticks.each(function(_,i){
        if(i%2 != 0) d3.select(this).remove();
    });
  // Add the Y Axis
  lineSvg.append("g")
  // .call(d3.axisLeft(y).tickSize(-lineInnerWidth))
  .style("stroke","gray")
  .attr("class", "axisgray")
  .call(g => g.select(".domain")
        .remove())
  .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "5,10"));

}