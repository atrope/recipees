var root,w,h,x,y,svg,root,node,zoomed=false;
$(document).ready(function() {
    const anchors = ['worldMap', 'london', 'londondiseases', 'londonrecipes'];
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
        afterRender: ()  => $('.loader_overlay').fadeOut()
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


    $('.trigger-overlay').bind('click', function() {
        let parent = $(this).closest('.slide');
        if (parent.hasClass("londonrecipes")) doGraphRecipes()
        else if (parent.hasClass("london")) doGraphIngredients()
        else if (parent.hasClass("londondiseases")) doGraphDiseases()
        $(this).parent().find('div.overlay').addClass('active');
    });

    $('button.overlay-close').bind('click', function() {
        $(".d3").html("");
        $(this).parent().removeClass('active');
    });
});



const doGraphRecipes = () => {
  // svg = d3.select("#d3-recipes").append("div").attr("class", "chart")
  // .style("width", w + "px").style("height", h + "px")
  // .append("svg:svg").attr("width", w)
  // .attr("height", h).append("svg:g")
  // .attr("transform", "translate(.5,.5)");

}
function hasChanged() { doGraphDiseases(this.value);}

d3.selectAll("input").on("change", hasChanged);
const doGraphDiseases = (type="bad") => {
  $(".d3").html("");
  var width = screen.availWidth / 3 * 2;
      height = 480;

  var cluster = d3.layout.cluster().size([height, width - 160]);

  var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
  var svg = d3.select("#d3-diseases").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(40,0)");
        d3.json(`https://k77u4j8m1f.execute-api.us-east-1.amazonaws.com/v1/disease/${type}`, function(data) {

      var nodes = cluster.nodes(data),
          links = cluster.links(nodes);
        nodes.forEach(function(d) { d.y = d.depth * 300 + 100; });
        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);
        var node = svg.selectAll(".node")
            .data(nodes)
          .enter().append("g")
          .attr("class", function(d) { return `node depth-${d.depth}`; })
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        node.append("circle").attr("r", 4.5);
        node.append("text")
            .attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dy", 3)
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; })
            .on("click", function(d) {
              alert(`position #${d.value}`);
            });;

});

}


const doGraphIngredients = () => {
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


    svg = d3.select("#d3-london").append("div").attr("class", "chart")
        .style("width", w + "px").style("height", h + "px")
        .append("svg:svg").attr("width", w)
        .attr("height", h).append("svg:g")
        .attr("transform", "translate(.5,.5)");

    d3.json("https://k77u4j8m1f.execute-api.us-east-1.amazonaws.com/v1/recipe/ingredients/50", function(data) {
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
