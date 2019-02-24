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
        marks: [{
                xy: [200, 200],
                tooltip: 'USA',
                attrs: {
                    href: '#worldMap/unitedStates',
                    src: 'maps/marker.svg'
                }
            },
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
        doGraph();
        $(this).parent().find('div.overlay').addClass('active');
    });

    $('button.overlay-close').bind('click', function() {
        $("#d3-london").html("");
        $(this).parent().removeClass('active');
    });
});




const doGraph = () => {
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

    d3.json("js/counter.json", function(data) {
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