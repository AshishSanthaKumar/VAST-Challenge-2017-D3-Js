var radialData;
var radial_svg;

const width = 960,
  height = 500,
  chartRadius = height / 2 - 40;

const color = d3.scaleOrdinal(d3.schemeCategory10);


// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function()
{
    // Load all files before doing anything else
    Promise.all([d3.csv('MC2Data/radial_chart_data_clean.csv')])
            .then(function(values){
                radialData=values[0];
            drawCharts();
            })
})


function drawCharts()
{
    drawRadialChart("4/1/16 12:00 AM","4/1/16 1:00 PM")
}

function drawRadialChart(dateVal1,dateVal2)
{

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

    var flag=1;

    var radial= radialData.filter(function(d){
        if(d["Date"]==dateVal1)
        {
            flag=0;
            return true;
        }
        if(d["Date"]==dateVal2)
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
    for(i=0;i<radial.length;i++)
    {
    delete radial[i]['Date'];
    delete radial[i]['GrandTotal'];
    }

    "M1","M2","M3","M4","M5","M6","M7","M8","M9"
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
        .attr('y', (d, i) => -getOuterRadius(i) + arcPadding)
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
          .style('fill', (d, i) => color(i))
    
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