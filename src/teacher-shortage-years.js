const d3 = require( "d3" );

const DATAFILE = "data/bilingual_nearby_cleanyears.csv";
const KEYSTATES = ["CONNECTICUT", "MASSACHUSETTS",
		 "NEW YORK","NEW JERSERY",
		   "RHODE ISLAND"];

var WIDTH, HEIGHT;
var BOX_HEIGHT = 20;
var PADDING = 1;

var left_margin = 0;
var label_height = 0;
var box_width;

var sel = d3.select( "#container" );

var disp_year = function( y )
{
    if ( y.length != 8 )
	return
    
    return y.substring(0,4) + "-" + y.substring(4)
}

var just_years = function( obj )
{
    return Object.keys(obj).filter(function( a ){

	if ( isNaN(a) ) return false;
	if ( a.length != 8 ) return false;

	return true;
    });
    // 	.sort(function(a, b){
    // 	if (Number(a["year"]) < Number(b["year"])) return -1;
    // 	return 1;
    // });

}

var draw_box_row = function( d, i )
{

    var row_sel = d3.select( this );

    var jy = just_years(d);
    
    var year_count = jy.length;

    box_width = ( WIDTH - left_margin )  / year_count;
    var height = BOX_HEIGHT;
    var y = i * height;
    
    var year_boxes = row_sel.selectAll("rect")
	.data(jy)
	.enter()
	.append("rect")
	.classed( "year-box", true )
	.classed( "shortage", function(lbl) {
	    return d[lbl].toUpperCase() === "TRUE";
	})
	.attr( "width", box_width )
	.attr( "x", function(_, i ){
	    return box_width * i + left_margin;
	})
	// .attr( "y", y )
	.attr( "height", height )
	.attr( "data-year", function( lbl ) { return lbl ; });

    year_boxes.on("mouseover", function(d){
	var yr = d3.select(this).attr("data-year")
	var ysel = ".year-label[data-year='"+ yr +"']";

	d3.selectAll(".year-label")
	    .style("opacity",0);
	
	d3.select(ysel)
	    .style("opacity","1");

    });

    year_boxes.on("mouseout", function(){

	d3.select("g.year-labels").classed("default",true);
	
	d3.selectAll(".year-label")
	    .style("opacity",0);

	d3.selectAll(".year-label:nth-child(10n+1)")
	    .style("opacity",1);

    });

}

var draw = function( d )
{

    WIDTH = d3.select( window ).node().innerWidth;

    var row_count = d.length;
    
    sel.html("");
    
    var svg = sel.append("svg")

    var g = svg.append("g")
    
    var box_rows = g.selectAll("g.box_row")
	.data( d )
	.enter( )
	.append( "g" )
	.classed( "box-row", true )
	.attr( "data-state", function(d){ return d["state"]; } );

    var labels = box_rows.append("text")
	.text(function(d){ return d["state"]; })
    	.attr( "data-state", function(d){ return d["state"]; } );


    var year_labels_g = g.append("g")
	.classed("year-labels", true)
    
    var year_labels = year_labels_g.selectAll("text.year-label")
	.data(just_years(d[0]))
	.enter()
	.append("text")
	.classed("year-label", true)
	.attr("data-year", function(d){return d;})
    	.text(function(d){return disp_year(d);});
    
    
    labels.each(function(){
	var this_width = d3.select(this).node().getBBox().width ;
	var this_height = d3.select(this).node().getBBox().height ;
	if ( this_width > left_margin )
	    left_margin = this_width + 2; 

	if ( this_height > label_height )
	    label_height = this_height ;
   
    });

    labels.attr("y", function(){
	return d3.select(this).node().getBBox().height + "px";
	// return BOX_HEIGHT + "px";
    });

    d3.selectAll( "g.box-row" )
	.style( "transform", function ( _, i ){
	    var trans = "translate("
		// + ( left_margin )
		+ "0px,"
		+ ( i * (BOX_HEIGHT  ) ) + "px)";
	    console.log("trans", trans);
	    return trans;
	})

    box_rows.each( draw_box_row );

    year_labels.style("transform", function(){
	return "translate(0px," + ( BOX_HEIGHT * row_count ) + "px)";
    }).attr("y", function(){
	    return d3.select(this).node().getBBox().height + "px";
    }).attr("x", function(_, i ){
	    return ( left_margin + box_width + box_width * i - d3.select(this).node().getBBox().width ) + "px";
    })
	      
    svg.attr("width", g.node().getBBox().width + "px");

    svg.attr("height", (BOX_HEIGHT * row_count  + year_labels.node().getBBox().height) + "px");

}

var loaded = function( d )
{
    var d = d.sort(function(a, b){
	if (a["state"] < b["state"]) return -1;
	return 1;
    });

    draw(d);
    
    
    d3.select(window).on("resize", function(){
	draw(d);
    });
}

var main = function()
{
    d3.csv( DATAFILE, loaded );
}

main();


