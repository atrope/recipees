var root,w,h,x,y,svg,root,node,zoomed=false;

$(document).ready(function() {
    const anchors = ['worldMap', 'unitedStates', 'london'];
    $('#fullpage').fullpage({
        sectionsColor: ['#bfd9d8'],
        loopHorizontal: false,
        controlArrows: false,
        anchors: anchors,
        onSlideLeave: (anchorLink, index, slideIndex, direction) => {
          $('.' + anchors[slideIndex]).find('div.overlay').fadeOut();
        },
        afterSlideLoad: (anchorLink, index, slideAnchor, slideIndex) => {
          $('.' + anchors[slideIndex]).find('div.overlay').show().removeClass('active');
        },
        afterRender: ()  => {
          $('.loader_overlay').fadeOut()
        }
    });
    $('#map').mapSvg({
        source: 'maps/world_full.svg', // Path to SVG map
        colors: {
            base: "#fff",
            background: "transparent",
            hover: "#548eac",
            selected: "#065A85",
            disabled: "#ffffff",
            stroke: "#bfd9d8"
        },
        disableAll: true,
        cursor: "pointer",
        width: 1000,
        tooltipsMode: 'custom',
        responsive: true,
        marks: [
            {
                xy: [445, 155],
                tooltip: 'United Kingdom',
                attrs: {
                    href: '#worldMap/london',
                    src: 'maps/marker.svg'
                }
            },
        ],
    });

    var view;

    $(window).on('load', function() {
        $("#room-diseases").hide();
        $("#room-recipes").hide();
        view = 1;
     });
    
    $('#trigger-overlay-ingredients').bind('click', function() {
        $(this).parent().find('#overlay-diseases').removeClass('active');
        $(this).parent().find('#overlay-recipes').removeClass('active');
        if(view == 1){
            $("#d3-uk-ingredients").html("");
            doGraph_ingredients();
            $(this).parent().find('#overlay-ingredients').addClass('active');
        } 
        else{ 
            $("#room-ingredients").show();
            $("#room-diseases").hide();
            $("#room-recipes").hide();
            view = 1;
        }
    });

    $('#trigger-overlay-diseases').bind('click', function() {
        $(this).parent().find('#overlay-ingredients').removeClass('active');
        $(this).parent().find('#overlay-recipes').removeClass('active');
        if(view == 2){
            $("#d3-uk-diseases").html("");
            doGraph_diseases();  
            $(this).parent().find('#overlay-diseases').addClass('active');
        }
        else{
            $("#room-diseases").show();
            $("#room-recipes").hide();
            $("#room-ingredients").hide();
            view = 2;
        }
    });

    $('#trigger-overlay-recipes').bind('click', function() {
        $(this).parent().find('#overlay-ingredients').removeClass('active');
        $(this).parent().find('#overlay-diseases').removeClass('active');
        if(view == 3){
            $("#d3-uk-recipes").html("");
            doGraph_recipes();
            $(this).parent().find('#overlay-recipes').addClass('active');
        }
        else{
            $("#room-recipes").show();
            $("#room-diseases").hide();
            $("#room-ingredients").hide();
            view = 3;
        }
    });

    $('button.overlay-close').bind('click', function() {

        $(this).parent().removeClass('active');
    });

});

const doGraph_ingredients = () => {
    w = screen.availWidth / 3 * 2,
        h = 480,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root, node;
    var treemap = d3.layout.treemap().round(false).size([w, h]).sticky(true).value(function(d) {
        return d.total;
    });
    treemap.sort((a,b) => a.value - b.value);


    svg = d3.select("#d3-uk-ingredients").append("div").attr("class", "chart")
        .style("width", w + "px").style("height", h + "px")
        .append("svg:svg").attr("width", w)
        .attr("height", h).append("svg:g")
        .attr("transform", "translate(.5,.5)");

    d3.json("https://k77u4j8m1f.execute-api.us-east-1.amazonaws.com/v1/recipe/ingredients/100000", function(data) {
        node = root = data;
        var nodes = treemap.nodes(root).reverse().filter(function(d) {
            return !d.children;
        });


        var cell = svg.selectAll("g")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on("click", function(d) {
                zoomed = !zoomed;
                return zoom(node == d.parent ? root : d.parent);

            });

        cell.append("svg:rect")
            .attr("width", function(d) {
                return d.dx - 1;
            })
            .attr("height", function(d) {
                return d.dy - 1;
            })
            .style("fill", function(d) {
                return color(d.parent.name);
            });

        cell.append("svg:text")
            .attr("x", function(d) {
                return d.dx / 2;
            })
            .attr("y", function(d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) {
                return capitalize(d.parent.name);
            })
            .style("opacity", function(d) {
                d.w = this.getComputedTextLength();
                return d.dx > d.w ? 1 : 0;
            }).style("font-size", function(d) {
                // console.log(d);
                return "10px";
            });

    });

}

const doGraph_diseases = () => {
    var margin = {top: 20, right: 50, bottom: 30, left: 20},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    d3.json("/recipees/onepage/js/diseases.json", function(data) {
        children = data.children.map(function(a){ 
            return a;
        });

    var dataset = children.map(function(c) {
        return {x:c.name,
                y:c.ingredients.map(function(d){
                return d;
                })}
        })
        
    var ingredients = dataset[0].y.map(function(a){
        return a.name;
    })

    console.log(ingredients);

    var colors = ["b33040", "#d25c4d", "#f2b447", "#d9d574", "blue", "grey"];
    
    var x = d3.scale.ordinal()
        .domain(dataset.map(function(d) { return d.x; }))
        .rangeRoundBands([10, width-10], 0.02);
      
    var y = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
        .range([height, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");

    var svg = d3.select("#d3-uk-diseases")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
   
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickSize(-width, 0, 0)
            .tickFormat( function(d) { return d } );

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")

                svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

                svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        var groups = svg.selectAll("g.value")
            .data(dataset)
            .enter().append("g")
            .attr("class", "value")
            .style("fill", function(d, i) { return colors[i]; });

            var rect = groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
            .attr("width", x.rangeBand())
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 15;
                var yPosition = d3.mouse(this)[1] - 25;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d.y);
            });

        var legend = svg.selectAll(".legend")
            .data(colors)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(30," + i * 20 + ")"; });
            
            legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) {return colors.slice().reverse()[i];});
            
            legend.append("text")
            .attr("x", width + 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d, i) { 
                switch(i){
                    case 0: return ingredients[0];
                    case 1: return ingredients[1];
                    case 2: return ingredients[2];
                    case 3: return ingredients[3];
                    case 4: return ingredients[4];
                    case 5: return ingredients[5];
                    case 6: return ingredients[6];
                    case 7: return ingredients[7];
                    }
                });

        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");
                
            tooltip.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);

            tooltip.append("text")
            .attr("x", 15)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
        });
}

const doGraph_recipes = () => {
    w = screen.availWidth / 3 * 2,
        h = 480,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root, node;
    var treemap = d3.layout.treemap().round(false).size([w, h]).sticky(true).value(function(d) {
        return d.total;
    });
    treemap.sort((a,b) => a.value - b.value);


    svg = d3.select("#d3-uk-recipes").append("div").attr("class", "chart")
        .style("width", w + "px").style("height", h + "px")
        .append("svg:svg").attr("width", w)
        .attr("height", h).append("svg:g")
        .attr("transform", "translate(.5,.5)");

    d3.json("https://k77u4j8m1f.execute-api.us-east-1.amazonaws.com/v1/recipe/ingredients/100000", function(data) {
        node = root = data;
        var nodes = treemap.nodes(root).reverse().filter(function(d) {
            return !d.children;
        });


        var cell = svg.selectAll("g")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on("click", function(d) {
                zoomed = !zoomed;
                return zoom(node == d.parent ? root : d.parent);

            });

        cell.append("svg:rect")
            .attr("width", function(d) {
                return d.dx - 1;
            })
            .attr("height", function(d) {
                return d.dy - 1;
            })
            .style("fill", function(d) {
                return color(d.parent.name);
            });

        cell.append("svg:text")
            .attr("x", function(d) {
                return d.dx / 2;
            })
            .attr("y", function(d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) {
                return capitalize(d.parent.name);
            })
            .style("opacity", function(d) {
                d.w = this.getComputedTextLength();
                return d.dx > d.w ? 1 : 0;
            }).style("font-size", function(d) {
                // console.log(d);
                return "10px";
            });

    });

}

const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

const zoom = (d) => {
    var kx = w / d.dx,
        ky = h / d.dy;
    x.domain([d.x, d.x + d.dx]);
    y.domain([d.y, d.y + d.dy]);
    var t = svg.selectAll("g.cell").transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) {
            return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });
    t.select("rect")
        .attr("width", function(d) {
            return kx * d.dx - 1;
        })
        .attr("height", function(d) {
            return ky * d.dy - 1;
        })
    t.select("text")
        .attr("x", function(d) {
            return kx * d.dx / 2;
        })
        .attr("y", function(d) {
            return ky * d.dy / 2;
        })
        .text(function(d) {
             let name = capitalize(d.parent.name);
             if(zoomed) return ` ${name} - ${d.value} recipees`;
              return `${name}`;
        })
        .style("opacity", function(d) {
            return kx * d.dx > d.w ? 1 : 0;
        });
    node = d;
    d3.event.stopPropagation();
}
