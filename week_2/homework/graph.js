/*
* Joost Hintzen
* 10434143
*
*/
function reqListener() {

  let dataBilt = this.responseText;
  console.log(dataBilt);
  let splitDatas = dataBilt.split('\n');
  //console.log(splitDatas);
  var temps = [];
  var dates = [];
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

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var xBeginning = 50;
  var xEnd = 1250;
  var yBeginning = 950;
  var yEnd = 50;

  // x and y axis
  ctx.beginPath();
  ctx.moveTo(xBeginning, yEnd);
  ctx.lineTo(xBeginning, yBeginning);
  ctx.lineTo(xEnd, yBeginning);
  ctx.stroke();

  var distance = 0;
  var text = -100;
  var padding = 10;
  var step = 100;

  // y-axis ticks and labels

  for (var y = yBeginning; y >= yEnd; y -= step) {
    ctx.textAlign= "end";
    ctx.fillText(text.toString(), (xBeginning - (2*padding)), y);


    ctx.beginPath();
    ctx.moveTo(xBeginning, y);
    ctx.lineTo((xBeginning - padding), y);
    ctx.stroke();

    text += 50;

  }

  var months = ["april", "mei", "juni", "juli", "augustus", "september",
  "oktober", "november", "december", "januari", "februari", "maart", "april"];
  var i = 0;

  // x -axis and labels
  ctx.beginPath();
  for (var x = xBeginning; x <= xEnd; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, yBeginning);
    ctx.lineTo(x, (yBeginning + padding));
    ctx.stroke();
    ctx.fillText(months[i], x, (yBeginning + (2*padding)));
    i++;
  }

  var confy = [];
  var confx = [];
  var datamili = [];
  var datasY = createTransform([-100, 350], [950, 50]);
  // datamili = dates.getTime();
  // console.log(datamili);
  // var firstDay = dates[0].getTime();
  // var lastDay = dates[splitDatas.length - 1].getTime();
  var datasX = createTransform([dates[0], dates[splitDatas.length - 1]], [50, 1250]);



  for (var y = 0; y < splitDatas.length; y++) {
    confy[y] = datasY(temps[y]);
    confx[y] = datasX(dates[y]);

  }
  console.log(confy);
  console.log(confx);

  ctx.beginPath();
  ctx.moveTo(50, confx[0]);

  for (var i = 0; i < splitDatas.length; i++) {

    ctx.lineTo(confx[i], confy[i]);
  }
  ctx.stroke();

  // ctx.beginPath();
  // ctx.moveTo(50, confDatasA);
  // ctx.lineTo(100, confDatasB);
  // ctx.stroke();
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "https://raw.githubusercontent.com/joosthintzen40/dataprocessing1/master/week_2/homework/data.txt");
oReq.send();
