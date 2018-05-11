window.onload = function() {


  d3.queue()
    .defer(d3.json, "worldmap.topojson")
    .defer(d3.json, "happyindex.json")
    .await(makeWorldMap);

    // margins, height, width and padding
    var margin = { top: 10, right: 10, bottom: 50, left: 0 }
    var h = 500 - margin.top - margin.bottom
    var w = 800 - margin.left - margin.right

    var color = d3.scaleThreshold()
      .domain([1, 20, 40, 60, 80, 100, 120, 140])
      .range(['#009900', '#00e600', '#99ff33', '#ffff00', '#ff9900', '#ff704d','#ff3300'])


  function makeWorldMap(error, data, happyindex) {
    if (error) throw error;

    var countryByRank = {};
    var countryHpi = {};
    happyindex.forEach(function(d) { countryByRank[d.countries] = +d.ranking; });
    happyindex.forEach(function(d) { countryHpi[d.countries] = +d.hpi; });
    //console.log(data);
    var countries = topojson.feature(data, data.objects.countries1).features

    console.log(countryByRank)
    console.log(countryHpi)
    //console.log(happyindex)
    //console.log(countries)


    var svg = d3.select('#map')
                .append('svg')
                .attr('height', h + margin.top + margin.bottom)
                .attr('width', w + margin.left + margin.right)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    var projection = d3.geoMercator()
                       .translate([w / 2, h / 1.7])
                       .scale(110)

    var path = d3.geoPath()
                 .projection(projection)


    console.log(countries)
    svg.selectAll('.countries')
      .data(countries)
      .enter().append('path')
      .attr('class', 'countries')
      .attr('d', path)
      .style('fill', function(d) {
        return color(countryByRank[d.properties.name]);})
      .on('mouseover', function(d) {
        d3.select(this)
          .attr('opacity', 0.5)
        document.getElementById('tip').innerHTML = "<strong>Country: </strong> \
        <span class='tiptext'>" + d.properties.name + "<br></span> \
        " + "<strong>HPI: </strong><span class='tiptext'>" + countryHpi[d.properties.name] +
        "</span>"
        var xPos = parseFloat(d3.event.pageX) + 10;
        var yPos = parseFloat(d3.event.pageY) - 10;
        d3.select('#tip')
          .style('left', xPos + 'px')
          .style('top', yPos + 'px')
        d3.select('#tip').classed('hidden', false)
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .attr('opacity', 100)
          .style('fill', function(d, i) {
            return color(countryByRank[d.properties.name]);
          })
        d3.select('#tip').classed('hidden', true)
      })
      .on('mousemove', function(d, i) {
        var xPos = parseFloat(d3.event.pageX) + 10;
        var yPos = parseFloat(d3.event.pageY) - 10;
        d3.select('#tip')
          .style('left', xPos + 'px')
          .style('top', yPos + 'px')
        d3.select('#tip').classed('hidden', false)
      })

      var xLegend = d3.scaleLinear()
        .domain([0, 45])
        .range([0, 240])

      var xAxisLegend = d3.axisBottom()
        .tickSize(12)
        .tickValues(color.domain())

      var legend = d3.select('#map').select('g').call(xAxisLegend)


      legend.selectAll('rect')
       .data(color.range().map(function(color) {
         var d = color.invertExtent(color);
         if (d[0] == null) d[0] = xLegend.domain()[0];
         if (d[1] == null) d[1] = xLegend.domain()[1];
         return d;
       }))
       .enter().append('rect')
        .attr('height', 10)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    legend.append("text")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("y", -6)
      .text("Percentage of stops that involved force");








  }


}
