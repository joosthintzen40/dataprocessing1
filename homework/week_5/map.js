window.onload = function() {

  // queue for loading data
  d3.queue()
    .defer(d3.json, 'worldmap.topojson')
    .defer(d3.json, 'happyindex.json')
    .defer(d3.json, 'happyranks.json')
    .await(makeWorldMap);

  // margins, height, width and padding
  var margin = { top: 2, right: 0, bottom: 20, left: 10 }
  var h = 500 - margin.top - margin.bottom
  var w = 700 - margin.left - margin.right
  var barwidth = 70

  // color settings for ranking countries; map, bar chart and legend;
  var color = d3.scaleThreshold()
    .domain([1, 20, 40, 60, 80, 100, 120, 140])
    .range(['#009900', '#00e600', '#99ff33', '#ffff00', '#ff9900', '#ff704d','#ff3300'])

  // function to make the world map
  function makeWorldMap(error, data, happyindex, happyranks) {
    if (error) throw error;

    console.log(data)
    // dictionaries for tooltip map
    var countryByRank = {};
    var countryHpi = {};
    var formatHpi = d3.format('.1f')

    happyindex.forEach(function(d) { countryByRank[d.countries] = +d.ranking; });
    happyindex.forEach(function(d) { countryHpi[d.countries] = +formatHpi(d.hpi); });
    //console.log(data);
    var countries = topojson.feature(data, data.objects.countries1).features

    console.log(countryByRank)
    console.log(countryHpi)
    console.log(happyranks)
    //console.log(happyindex)
    console.log(countries)

    // svg for map
    var svg = d3.select('#map')
                .append('svg')
                .attr('height', h + margin.top + margin.bottom)
                .attr('width', w + margin.left + margin.right)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    // projection for map
    var projection = d3.geoMercator()
                       .translate([w / 2, h / 1.7])
                       .scale(110)

    // determine path for map
    var path = d3.geoPath()
                 .projection(projection)


    console.log(countries)

    // drawing countries paths
    svg.selectAll('.countries')
      .data(countries)
      .enter().append('path')
      .attr('class', 'countries')
      .attr('d', path)
      .style('fill', function(d) {
        return color(countryByRank[d.properties.name]);})
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('mousemove', mousemove)
      .on('click', change)

    // tooltip functions for map tooltip
    function mouseover(d) {
      d3.select(this)
        .attr('opacity', 0.5)
      document.getElementById('tip').innerHTML = "<strong>Country: </strong> \
      <span class='tiptext'>" + d.properties.name + '<br></span> \
      ' + "<strong>HPI: </strong><span class='tiptext'>" + countryHpi[d.properties.name] +
      '</span>'
      var xPos = parseFloat(d3.event.pageX) + 10;
      var yPos = parseFloat(d3.event.pageY) - 10;
      d3.select('#tip')
        .style('left', xPos + 'px')
        .style('top', yPos + 'px')
      d3.select('#tip').classed('hidden', false)
    }

    function mouseout(d) {
      d3.select(this)
        .attr('opacity', 100)
        .style('fill', function(d) {
          return color(countryByRank[d.properties.name]);
        })
      d3.select('#tip').classed('hidden', true)
    }

    function mousemove() {
      var xPos = parseFloat(d3.event.pageX) + 10;
      var yPos = parseFloat(d3.event.pageY) - 10;
      d3.select('#tip')
        .style('left', xPos + 'px')
        .style('top', yPos + 'px')
      d3.select('#tip').classed('hidden', false)
    }

    // height, width and margins for bar chart
    var marginBarChart = { top: 10, right: 0, bottom: 70, left: 70 }
    var height = 500 - marginBarChart.top - marginBarChart.bottom
    var width = 550 - marginBarChart.left - marginBarChart.right

    // svg for bar chart
    var barChart = d3.select('#bar-chart').append('svg');
    var svgbar = barChart.attr('id', 'svg')
      .attr('width', width + marginBarChart.left + marginBarChart.right)
      .attr('height', height + marginBarChart.top + marginBarChart.bottom)
      .append('g')
      .attr('transform', 'translate(' + marginBarChart.left  + ',' + marginBarChart.top + ')')

    // x scale for bar chart
    var xScale = d3.scaleBand()
      .domain(['life expectancy', 'wellbeing', 'inequality', 'ecological footprint'])
      .rangeRound([0, width]);

    // y scale for bar chart
    var yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, 140])

    // grid line function for bar chart
    function yGridlines() {
      return d3.axisLeft(yScale)
               .ticks(14)
    }

    // add the x Axis
    svgbar.append('g')
       .attr('class', 'x-axis')
       .attr('transform', 'translate(0,' + height + ')')
       .call(d3.axisBottom(xScale))
    barChart.append('text')
       .attr('x', width/2)
       .attr('y', 430)
       .attr('dy', '3em')
       .attr('tex-anchor', 'middle')
       .text('Elements of HPI');

    // add the y Axis
    svgbar.append('g')
       .attr('class', 'y-axis')
       .call(d3.axisLeft(yScale))
    barChart.append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x', 0 - (h/2))
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .text('Rank (1-140)');

    // append grid lines to bar chart
    svgbar.append('g')
          .attr('class', 'grid')
          .call(yGridlines()
            .tickSize(-width)
            .tickFormat("")
          )

    // drawing bars of bar chart
    svgbar.selectAll('.bars')
       .data(happyranks[0]['Mexico'])
       .enter()
       .append('rect')
       .attr('class', 'bars')
       .attr('width', barwidth)
       .attr('height', function(d) {return height - yScale(d)})
       .attr('x', function(d, i) {return 25 + i*(barwidth + 50)})
       .attr('y', function(d) {return yScale(d)})
       .style('fill', function(d) {return color(d)})
       .on('mouseover', mouseoverbar)
       .on('mouseout', mouseoutbar)


     function mouseoverbar(d) {
       d3.select(this)
         .attr('opacity', 0.5)
     }

     function mouseoutbar(d) {
       d3.select(this)
         .attr('opacity', 100)
      }

    // change function for bar chart, changes when clicked on country
    function change(d) {
      d3.select(this)
      console.log(height)
      svgbar.selectAll('.bars')
        .remove()
      svgbar.selectAll('.bars')
        .data(happyranks[0][d.properties.name])
        .enter()
        .append('rect')
        .transition()
        .duration(800)
        .attr('class', 'bars')
        .attr('width', barwidth)
        .attr('height', function(d) {return height -yScale(d)})
        .attr('x', function(d, i) {return 25 + i*(barwidth + 50)})
        .attr('y', function(d) {return yScale(d)})
        .style('fill', function(d) {return color(d)})
    }

    // legend function colors ranking, both map and bar chart
    function makeLegend() {
      // height and width
      heights = 60
      width = 400

      // drawing of svg for legend
      legendsvg = d3.select('#legend').append('svg')
      legendsvg.attr('id', 'legendsvg')
        .attr('height', heights)
        .attr('width', width)
        .append('g')
        .attr('transform', 'translate(10, 10)')
        .attr('id', 'g-legend')

      // color legend
      var colorlegend = d3.scaleThreshold()
        .domain([20, 40, 60, 80, 100, 120, 140])
        .range(['#009900', '#00e600', '#99ff33', '#ffff00', '#ff9900', '#ff704d','#ff3300'])

      // x scale for legend
      var x = d3.scaleLinear()
        .domain([1, 140])
        .range([1, 300])

      // calling of x-axis legend
      var xAxisLegend = d3.axisBottom(x)
        .tickSize(12)
        .tickValues(color.domain())
      var legend = d3.select('#g-legend').call(xAxisLegend)

      // drawing of the rect-angles of the legend
      legend.selectAll('rect')
        .data(colorlegend.range().map(function(colors) {
          console.log(colors)
          var d = colorlegend.invertExtent(colors)
          console.log(d)
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          console.log(d[0], d[1])
          return d;
        }))
        .enter().insert('rect', '.tick')
        .attr('height', 10)
        .attr('width', function(d) { return x(d[1]) - x(d[0]); })
        .attr('x', function(d) { return x(d[0]); })
        .attr('fill', function(d) { return color(d[0]); })

        // text of legend
        legend.append('text')
          .attr('id', 'text-legend')
          .attr('text-anchor', 'start')
          .attr('fill', '#000')
          .attr('y', 35)
          .text('ranks of countries')

    }

    // calling of legend
    makeLegend();

  }
}
