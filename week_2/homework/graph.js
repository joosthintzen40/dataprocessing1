/*
* Joost Hintzen
* 10434143
* dataprocessing week 2
*/

// function for making the graph
function load() {

  // gets the data for data.text
  let dataBilt = this.responseText;
  // splits the data into arrays at whitespaces
  let splitDatas = dataBilt.split('\n');


  var temps = [];
  var dates = [];

  // splits all arrays into 2 arrays of temps and dates
  for (var i = 0; i < splitDatas.length; i++) {
    let data = splitDatas[i].split(',');
    var temp = Number(data[1]);
    var date = new Date(data[0]);

    temps.push(temp);
    var datum = date.getTime();
    dates.push(datum);
  }


  function createTransform(domain, range) {
  	// domain is a two-element array of the data bounds [domain_min, domain_max]
  	// range is a two-element array of the screen bounds [range_min, range_max]
  	// this gives you two equations to solve:
  	// range_min = alpha * domain_min + beta
  	// range_max = alpha * domain_max + beta
   		// a solution would be:

      var domain_min = domain[0]
      var domain_max = domain[1]
      var range_min = range[0]
      var range_max = range[1]

      // formulas to calculate the alpha and the beta
     	var alpha = (range_max - range_min) / (domain_max - domain_min)
      var beta = range_max - alpha * domain_max

      // returns the function for the linear transformation (y= a * x + b)
      return function(x){
        return alpha * x + beta;
      }
  }

  // makes 2d canvas in html file
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  // bounds x and y coordinates of the graph
  var xBeginning = 100;
  var xEnd = 1250;
  var yBeginning = 900;
  var yEnd = 50;

  // x and y axis drawn
  ctx.beginPath();
  ctx.moveTo(xBeginning, yEnd);
  ctx.lineTo(xBeginning, yBeginning);
  ctx.lineTo(xEnd, yBeginning);

  // vars for drawing x and y-axis ticks and labels
  var text = -100;
  var padding = 10;
  var step = (1150/12);

  // y-axis ticks and labels drawn
  for (var y = yBeginning; y >= yEnd; y -= step) {
    // labels
    ctx.font = "20px arial";
    ctx.textAlign= "end";
    ctx.fillText(text.toString(), (xBeginning - (2*padding)), y);
    text += 50;

    // ticks
    ctx.moveTo(xBeginning, y);
    ctx.lineTo((xBeginning - padding), y);
  }

  // vars text for x-axis label
  var months = ["april", "mei", "juni", "juli", "augustus", "september",
  "oktober", "november", "december", "januari", "februari", "maart", "april"];
  var i = 0;

  // x -axis and labels drawn
  for (var x = xBeginning; x <= xEnd; x += step) {
    // labels
    ctx.textAlign = "center";
    ctx.fillText(months[i], x, (yBeginning + (2*padding)));
    i++;

    // ticks
    ctx.moveTo(x, yBeginning);
    ctx.lineTo(x, (yBeginning + padding));
  }

  // vars to transform data into coordinates
  var confy = [];
  var confx = [];
  var datasY = createTransform([-100, 350], [yBeginning, yEnd]);
  var datasX = createTransform([dates[0], dates[splitDatas.length - 1]], [xBeginning, xEnd]);

  // tranforming data into coordinates
  for (var y = 0; y < splitDatas.length; y++) {
    confy[y] = datasY(temps[y]);
    confx[y] = datasX(dates[y]);
  }
  ctx.stroke();

  // color graph line
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(xBeginning, confy[0]);

  // drawing line graph
  for (var i = 1; i < splitDatas.length; i++) {
    ctx.lineTo(confx[i], confy[i]);
  }
  ctx.stroke();

  // drawing y-axis title
  ctx.save();
  ctx.translate(xBeginning, yEnd);
  ctx.rotate((Math.PI / 180) * -90);
  ctx.fillText("Temperature (0.1 degrees Celsius)", -300, -60);
  ctx.restore();

  // drawing x-axis title
  ctx.fillText("Months in 2017", 650, 965);
}

// make XMLHttpRequest
var textLoader = new XMLHttpRequest();
// when graph.js is loaded
textLoader.addEventListener("load", load);
// get the data.txt out of GitHub
textLoader.open("GET", "https://raw.githubusercontent.com/joosthintzen40/dataprocessing1/master/week_2/homework/data.txt");
// and send it to html
textLoader.send();
