function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  function regularPolygonPoints(sideCount,radius, j=0){
    var sweep=Math.PI*2/sideCount;
    var cx=50;
    var cy=50;
    var points=[];
    for(var i=0;i<sideCount;i++){
        var x=cx+radius*Math.cos((i+j)*sweep);
        var y=cy+radius*Math.sin((i+j)*sweep);
        points.push({x:x,y:y});
    }
    console.log(points);
    return(points);
  }

  function regularStarPoints(sideCount,radius){
    let points_out = regularPolygonPoints(sideCount, radius)
    let points_in = regularPolygonPoints(sideCount, radius/2, 0.5)
    let points = [];
    for (let i = 0; i < sideCount; i++) {
      points.push(points_out[i]);
      points.push(points_in[i]);
    }
    console.log(points);
    return(points);
  }