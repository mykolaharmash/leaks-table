var express = require("express")
  , fs = require("fs")
  , path = require("path")
  , app = express()
  , data
  ;

data = JSON.parse(fs.readFileSync("data.json").toString());

app.use(express.static(path.join(__dirname, "..", "client")));

var creditSort = {
  up: function (data) {
    var _data = JSON.parse( JSON.stringify(data) );
    return _data.sort(function (a, b) {
      var af = parseFloat(a.credit)
        , bf = parseFloat(b.credit)
        ;
      if (af < bf){
        return -1;
      }
      if (af > bf){
        return 1;
      }
      return 0;
    });
  },
  down: function (data) {
    var _data = this.up(data);
    return _data.reverse();
  }
}

var dateSort = {
  up: function (data) {
    var _data = JSON.parse( JSON.stringify(data) );
    return _data.sort(function (a, b) {
      var at = Date.parse(a.date_till)
        , bt = Date.parse(b.date_till)
        ;
      if (at < bt){
        return -1;
      }
      if (at > bt){
        return 1;
      }
      return 0;
    });
  },
  down: function (data) {
    var _data = this.up(data);
    return _data.reverse();
  }
}

app.get("/leaks/fetch", function (req, res) {
  var firstindex = (req.query.pageNum - 1) * req.query.pageSize
    , lastindex = req.query.pageNum * req.query.pageSize
    , sort = req.query.sort
    , sortedData = data
    ;

  if (sort) {
    if (sort.credit) {
      sortedData = creditSort[sort.credit].call(creditSort, data);
    }
    if (sort.date_till) {
      sortedData = dateSort[sort.date_till].call(dateSort, data);
    }
  }
  res.json(sortedData.slice(firstindex, lastindex));
});

app.get("/", function (req, res) {
  res.sendFile("index.html", {
    root: "../client/"
  });
});

app.listen(3000);