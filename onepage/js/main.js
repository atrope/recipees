var root,w,h,x,y,svg,root,node,zoomed=false;
const baseApi = 'https://k77u4j8m1f.execute-api.us-east-1.amazonaws.com/v1';
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


const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
const doGraphRecipes = () => {
  $(".d3").html("");

  let dis = $('.londonrecipes select[name="disease"] option:selected').val();
let type = $('.londonrecipes select[name="type"] option:selected').val();

  w = screen.availWidth / 3 * 2,
      h = 480;
  d3.json(`${baseApi}/recipe/disease/${dis}/${type}`, function(error, data) {
    console.log(data);
    console.log(data.length);
    if(!data.length){
      $("#d3-recipes.d3").html("<p>No recipes were found!</p>");
      console.log(1);
    }
  else {
    var fontSize = d3.scale.pow().exponent(5).domain([0,1]).range([10,80]);
    var layout = d3.layout.cloud()
        .timeInterval(10)
        .size([w, h])
        .words(data)
        .rotate(function(d) { return 0; })
        .font('monospace')
        .fontSize(function(d,i) { return fontSize(Math.random()); })
        .text(function(d) { return d.title; })
        .spiral("archimedean")
        .on("end", draw)
        .start();

        svg = d3.select("#d3-recipes").append("div").attr("class", "chart")
        .style("width", w + "px").style("height", h + "px")
        .append("svg:svg").attr("width", w)
        .attr("height", h).append("svg:g")
        .attr("transform", "translate(.5,.5)");
}


    var wordcloud = svg.append("g")
        .attr('class','wordcloud')
        .attr("transform", "translate(" + w/2 + "," + h/2 + ")");


    function draw(words) {
      if(wordcloud)
      wordcloud.selectAll("text")
          .data(words)
        .enter().append("text")
          .attr('class','word')
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", function(d) { return d.font; })
          .style("fill", function(d) {
              var paringObject = data.filter(function(obj) { return obj.password === d.text});
              return getRandomColor();
          })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
          .text(function(d) { return d.text; });
    };

  });
}
function hasChanged() { doGraphDiseases(this.value);}
function hasChangedIngredients() { doGraphIngredients(this.value);}

d3.selectAll(".londondiseases input").on("change", hasChanged);
d3.selectAll(".londonrecipes select").on("change", doGraphRecipes);
d3.selectAll(".london input").on("change", hasChangedIngredients);

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
        d3.json(`${baseApi}/disease/${type}`, function(data) {

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
              // alert(`position #${d.value}`);
            });;

});

}


const doGraphIngredients = (qty=50) => {
  $(".d3").html("");

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

    d3.json(`${baseApi}/recipe/ingredients/${qty}`, function(data) {
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
