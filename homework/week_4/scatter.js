window.onload = function() {

  // loading the oecd data
  var allAge = "https://stats.oecd.org/sdmx-json/data/FTPTC_D/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR.MW.900000.TE.FT+PT.A/all?startTime=2014&endTime=2015"
  var fifttwentfourAge = "https://stats.oecd.org/sdmx-json/data/FTPTC_D/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR.MW.1524.TE.FT+PT.A/all?startTime=2014&endTime=2015"
  var twentfivefiftfiveAge = "https://stats.oecd.org/sdmx-json/data/FTPTC_D/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR.MW.2554.TE.FT+PT.A/all?startTime=2014&endTime=2015"
  var fiftfivesixtfourAge = "https://stats.oecd.org/sdmx-json/data/FTPTC_D/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR.MW.5564.TE.FT+PT.A/all?startTime=2014&endTime=2015"
  var sixtfourplusAge = "https://stats.oecd.org/sdmx-json/data/FTPTC_D/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR.MW.6599.TE.FT+PT.A/all?startTime=2014&endTime=2015"

  // queue of the data
  d3.queue()
    .defer(d3.request, allAge)
    .defer(d3.request, fifttwentfourAge)
    .defer(d3.request, twentfivefiftfiveAge)
    .defer(d3.request, fiftfivesixtfourAge)
    .awaitAll(scatterFunction);

  // scatterfunction to make scatterplot
  function scatterFunction(error, response) {
    if (error) throw error;

    // make data into json
    var jallAge = JSON.parse(response[0].responseText)
    var jfifttwentfourAge = JSON.parse(response[1].responseText)
    var jtwentfivefiftfiveAge = JSON.parse(response[2].responseText)
    var jfiftfivesixtfourAge = JSON.parse(response[3].responseText)


    // lists and dictionaries to make data more pliable
    var array = []
    var countries = jallAge.structure.dimensions.series[0].values;
    var valueDict = [{value: "allAge", text: "total"}, {value: "fifteen", text: "15 to 24"},
    {value: "twentyfive", text: "25 to 54"}, {value: "fifty", text: "55 to 64"}]

    // putting data into array for later use, differenciate between full-time and part-time
    for (var i = 0; i < countries.length; i++) {
      var dataAllAgeFull = i + ":0:0:0:0:0"
      var dataAllAgePart = i + ":0:0:0:1:0"
      var dataFifteenFull = i + ":0:0:0:0:0"
      var dataFifteenPart = i + ":0:0:0:1:0"
      var dataTwentFull = i + ":0:0:0:0:0"
      var dataTwentPart = i + ":0:0:0:1:0"
      var dataFiftFull = i + ":0:0:0:0:0"
      var dataFiftPart = i + ":0:0:0:1:0"


      array.push(
        {
          country: countries[i].name,
          allAge: [jallAge.dataSets[0].series[dataAllAgeFull].observations[1], jallAge.dataSets[0].series[dataAllAgePart].observations[1]],
          fifteen: [jfifttwentfourAge.dataSets[0].series[dataFifteenFull].observations[1], jfifttwentfourAge.dataSets[0].series[dataFifteenPart].observations[1]],
          twentyfive: [jtwentfivefiftfiveAge.dataSets[0].series[dataTwentFull].observations[1], jtwentfivefiftfiveAge.dataSets[0].series[dataTwentPart].observations[1]],
          fifty: [jfiftfivesixtfourAge.dataSets[0].series[dataFiftFull].observations[1], jfiftfivesixtfourAge.dataSets[0].series[dataFiftPart].observations[1]]
        });
    }


    // margins, height, width and padding
    var margin = { top: 100, right: 100, bottom: 100, left: 100 }
    var h = 1000 - margin.top - margin.bottom
    var w = 1000 - margin.left - margin.right
    var padding = 100;

    var body = d3.select("body")

    // 
    var span = body.append("span")
                   .attr("id", "yInput")
                   .text("Select the age range y-axis: ")
    var input = body.append("select")
                    .attr("id", "select")
                    .on("change", change)
                    .selectAll("option")
                    .data(valueDict)
                    .enter()
                  .append("option")
                    .attr("value", function(d) {return d.value})
                    .text(function(d) {return d.text})
    body.append("br");

    var colorvar = function(d) {return d.country}
        color = d3.scaleOrdinal(d3.schemeCategory10);

    var x = d3.scaleLinear()
              .range([0, w])
              .domain([
              d3.min([0, d3.min(array, function(d) {return d.fifteen[1][0]})]),
              d3.max([0, d3.max(array, function(d) {return d.fifteen[1][0]})])
              ]);

    var y = d3.scaleLinear()
              .range([h, 0])
              .domain([
              d3.min([0, d3.min(array, function(d) {return d.fifteen[0][0]})]),
              d3.max([0, d3.max(array, function(d) {return d.fifteen[0][0]})])
              ]);

    var xAxis = d3.axisBottom(x)

    var yAxis = d3.axisLeft(y)


    var svg = body.append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)
                .append('g')
                .attr('transform','translate(' + margin.left + ',' + margin.top + ')')

    svg.append("text")
        .attr("x", (w / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Full-time Employment vs. Part-time Employment");

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0 ," + h + ")")
        .call(xAxis)
    svg.append("text")
        .attr("transform",
              "translate(" + (3*w/5) + " ," +
                             (h + 50) + ")")
        .attr("class", "label")
        .style("text-anchor", "middle")
        .text("Part-Time Employment");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        // .attr("transform", "translate( 0," + margin.top +")");
    svg.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x",0 - (h/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Full-Time Employment");

    svg.selectAll("circle")
       .data(array)
       .enter()
      .append("circle")
       .attr("cx", function(d) {return x(d.fifteen[1][0])})
       .attr("cy", function(d) {return y(d.fifteen[0][0])})
       .attr("r", 5)
       .style("fill", function(d) {return color(colorvar(d))})

    var legend = svg.selectAll(".legend")
                    .data(color.domain())
                    .enter().append("g")
                    .attr("class", "legend")

    legend.append("rect")
          .attr("x", w + 20)
          .attr("y", function(d, i) {return i *20 })
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color)

    legend.append("text")
          .attr("x", w + 40)
          .attr("y", function(d, i) {return i *20})
          .attr("dy", ".6em")
          .style("text-anchor", "begin")
          .text(function(d) {return d})

    function change() {
      var value = this.value
      console.log(value)
      x.domain([
        d3.min([0, d3.min(array, function(d) {return d[value][1[0]]})]),
        d3.max([0, d3.max(array, function(d) {return d[value][1][0]})])
      ])
      var xAxis = d3.axisBottom(x)
      d3.select(".x-axis")
        .transition()
        .duration(800)
        .call(xAxis)
      y.domain([
        d3.min([0, d3.min(array, function(d) {return d[value][0][0]})]),
        d3.max([0, d3.max(array, function(d) {return d[value][0][0]})])
      ])
      var yAxis = d3.axisLeft(y)
      d3.select(".y-axis")
        .transition()
        .duration(800)
        .call(yAxis)
      d3.selectAll("circle")
        .transition()
        .duration(800)
        .attr("cx", function(d) {return x(d[value][1][0])})
        .attr("cy", function(d) {return y(d[value][0][0])})

    }

  };

  console.log("yes, we can")
};
