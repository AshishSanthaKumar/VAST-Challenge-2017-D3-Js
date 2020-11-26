function RadarChart(currSensor, data, color, location, config) {


	maxValue = d3.max(data[0].axes, d => d.value)

	const chemicals = data[0].axes.map(d => d.axis); //Name of each chemical
	const total = chemicals.length; //The number of different axes
	const radius = Math.min(config.w / 2, config.h / 2); //Radius of the outermost circle
	const roundDecimals = d3.format(config.format);
	const sliceAngle = (2 * Math.PI) / total;

	//Scale for the radius
	const rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);


	let g = currSensor.append("g")
		.attr("width", config.w + config.margin.left + config.margin.right)
		.attr("height", config.h + config.margin.top + config.margin.bottom)
		.attr('transform', `translate(${location.x},${location.y})`)
		.attr("class", `radarSensor radar${data[0].name}`)
		.on('click', function (d, i) {
			d3.event.stopPropagation();
			//Dim all
			svg.selectAll(".radarSensor")
				.transition().duration(50)
				.style("opacity", 0.2);
			//Bring back the hovered over
			d3.select(this)
				.transition().duration(50)
				.style("opacity", 1);

			onSensorSelected(d3.select(this).data()[0]);
			//drawHeatmap(parseInt(d3.select(this).data()[0]['name'][6]));


		})
		.on('mouseover', function (d, i) {
			addPossibleSourceLine(d3.select(this))

		})
		.on('mouseout', () => {
			svg.selectAll(".possibleSource")
				.remove();
		});



	//Glow and gaussian blur filter
	let filter = g.append('defs').append('filter').attr('id', 'glow')
	filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur')
	feMerge = filter.append('feMerge')
	feMerge.append('feMergeNode').attr('in', 'coloredBlur')
	feMerge.append('feMergeNode').attr('in', 'SourceGraphic');


	//draw grid
	//Wrapper
	let axisGrid = g.append("g").attr("class", "axisWrapper");

	//Draw circles
	axisGrid.selectAll(".levels")
		.data(d3.range(1, (config.levels + 1)).reverse())
		.enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", d => radius / config.levels * d)
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", config.opacityCircles)
		.style("filter", "url(#glow)");

	//add tooltip
	addToolTip(axisGrid, data[0].name)

	//ticks text
	axisGrid.selectAll(".axisLabel")
		.data(d3.range(1, (config.levels + 1)).reverse())
		.enter().append("text")
		.attr("class", "axisLabel")
		.attr("x", 4)
		.attr("y", d => -d * radius / config.levels)
		.attr("dy", "0.4em")
		.style("font-size", "7px")
		.attr("fill", "#737373")
		.text(d => roundDecimals(maxValue * d / config.levels));


	//draw the axis to each chemical
	var axis = axisGrid.selectAll(".axis")
		.data(chemicals)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(sliceAngle * i - (Math.PI / 2)))
		.attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(sliceAngle * i - (Math.PI / 2)))
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "0.5px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "7px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", (d, i) => rScale(maxValue * config.labelFactor) * Math.cos(sliceAngle * i - (Math.PI / 2)))
		.attr("y", (d, i) => rScale(maxValue * config.labelFactor) * Math.sin(sliceAngle * i - (Math.PI / 2)))
		.text(d => d);


	//draw the blobs
	const radarLine = d3.radialLine()
		.curve(d3.curveLinearClosed)
		.radius(d => rScale(d.value))
		.angle((d, i) => i * sliceAngle);

	if (config.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed)
	}

	//Create a wrapper for the blobs
	const blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");

	//Append the backgrounds
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", d => radarLine(d.axes))
		.style("fill", (d, i) => color(i))
		.style("fill-opacity", config.opacityArea)
		.on('mouseover', function (d, i) {
			//Dim all
			currSensor.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.2);
			//Bring back the hovered over
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);
		})
		.on('mouseout', () => {
			//Bring back all
			currSensor.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", config.opacityArea);
		});

	//Create the outlines
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function (d, i) {
			return radarLine(d.axes);
		})
		.style("stroke-width", config.strokeWidth + "px")
		.style("stroke", (d, i) => color(i))
		.style("fill", "none")
		.style("filter", "url(#glow)");

	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(d => d.axes)
		.enter()
		.append("circle")
		.attr("class", "radarCircle")
		.attr("r", config.dotRadius)
		.attr("cx", (d, i) => rScale(d.value) * Math.cos(sliceAngle * i - (Math.PI / 2)))
		.attr("cy", (d, i) => rScale(d.value) * Math.sin(sliceAngle * i - (Math.PI / 2)))
		.style("fill", (d) => color(d.id))
		.style("fill-opacity", 0.8);


	// add circles for the hover over the points
	//Wrapper for the invisible circles on top
	const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(d => d.axes)
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", config.dotRadius * 1.5)
		.attr("cx", (d, i) => rScale(d.value) * Math.cos(sliceAngle * i - (Math.PI / 2)))
		.attr("cy", (d, i) => rScale(d.value) * Math.sin(sliceAngle * i - (Math.PI / 2)))
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function (d, i) {
			tooltip
				.attr('x', this.cx.baseVal.value - 10)
				.attr('y', this.cy.baseVal.value - 10)
				.transition()
				.style('display', 'block')
				.text(roundDecimals(d.value) + config.unit);
		})
		.on("mouseout", function () {
			tooltip.transition()
				.style('display', 'none').text('');
		});

	const tooltip = g.append("text")
		.attr("class", "tooltip-main")
		.attr('x', 0)
		.attr('y', 0)
		.style("font-size", "12px")
		.style('display', 'none')
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em");



	update = () => {

		datePicked = dateSelection.val()
		timePicked = timeSelection.val();
		dateTime = parseDateTime(datePicked + ' ' + timePicked)


		filteredData = filterByDate(rawData, dateTime)
		transformed_data = transform_data(filteredData);


		mainChartConfig.sensors.forEach(function (_sensor, i) {

			data = transformed_data.filter(e => e.name == _sensor.name)

			maxValue = d3.max(data[0].axes, d => d.value)
			const rScale = d3.scaleLinear()
				.range([0, radius])
				.domain([0, maxValue]);

			//ticks text
			svg.select(`.radar${_sensor.name}`).selectAll(".axisLabel")
				.text(d => roundDecimals(maxValue * d / config.levels));

			const radarLine = d3.radialLine()
				.curve(d3.curveLinearClosed)
				.radius(d => rScale(d.value))
				.angle((d, i) => i * sliceAngle);


			//Create a wrapper for the blobs
			const blobWrapper = svg.select(`.radar${_sensor.name}`).selectAll(".radarWrapper")
				.data(data)
				.attr("class", "radarWrapper");

			//Append the backgrounds
			blobWrapper
				.selectAll('.radarArea')
				.data(data)
				.attr("class", "radarArea")
				.attr("d", d => radarLine(d.axes))
				.style("fill-opacity", config.opacityArea)
				.on('mouseover', function (d, i) {
					//Dim all blobs
					currSensor.selectAll(".radarArea")
						.transition().duration(200)
						.style("fill-opacity", 0.2);
					//Bring back the hovered over blob
					d3.select(this)
						.transition().duration(200)
						.style("fill-opacity", 0.7);
				})
				.on('mouseout', () => {
					//Bring back all blobs
					currSensor.selectAll(".radarArea")
						.transition().duration(200)
						.style("fill-opacity", config.opacityArea);
				});

			//Create the outlines
			blobWrapper.selectAll(".radarStroke")
				.data(data)
				.attr("class", "radarStroke")
				.attr("d", function (d, i) {
					return radarLine(d.axes);
				})
				.style("stroke-width", config.strokeWidth + "px")
				.style("fill", "none")
				.style("filter", "url(#glow)");

			//Append the circles
			blobWrapper.selectAll(".radarCircle")
				.data(d => d.axes)
				.attr("class", "radarCircle")
				.attr("r", config.dotRadius)
				.attr("cx", (d, i) => rScale(d.value) * Math.cos(sliceAngle * i - (Math.PI / 2)))
				.attr("cy", (d, i) => rScale(d.value) * Math.sin(sliceAngle * i - (Math.PI / 2)))
				.style("fill-opacity", 0.8);


			//Wrapper for the invisible circles
			const blobCircleWrapper = svg.select(`.radar${_sensor.name}`).selectAll(".radarCircleWrapper")
				.data(data)
				.attr("class", "radarCircleWrapper");

			//invisible circles on top for the mouseover
			blobCircleWrapper.selectAll(".radarInvisibleCircle")
				.data(d => d.axes)
				.attr("class", "radarInvisibleCircle")
				.attr("r", config.dotRadius * 1.5)
				.attr("cx", (d, i) => rScale(d.value) * Math.cos(sliceAngle * i - (Math.PI / 2)))
				.attr("cy", (d, i) => rScale(d.value) * Math.sin(sliceAngle * i - (Math.PI / 2)))
				.style("fill", "none")
				.style("pointer-events", "all")
		});

		updateWind(transformed_data[0])
	}

	dateSelection.change(function () {
		update();
	});
	timeSelection.change(function () {
		update();
	});

}