function toggleSvgDisplay() {
  const toggleButton = document.getElementById("toggleButton");
  toggleButton.style.display = "none";

    d3.csv("./artist_details.csv")
    .then((data)=>{
        const width = window.innerWidth * 3/4;
        const height = window.innerHeight * 3/4;
        
        const svg = d3.select("#artist-bubble")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
        
        const tooltip  = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
        
        const simulation = d3.forceSimulation(data)
          .force("center", d3.forceCenter(width / 2, height/2 )) // Centering force
          .force("charge", d3.forceManyBody().strength(d => -d.count))
          
        

        svg.append("defs")
          .selectAll("pattern")
          .data(data)
          .enter()
          .append("pattern")
          .attr("id", (d, i) => `pattern-${i}`)
          .attr("width", 1)
          .attr("height", 1)
          .append("image")
          .attr("xlink:href", d => d.image) 
          .attr("width", d => Math.max(16, d.count*4))
          .attr("height", d => Math.max(16, d.count*4));
        
        const circles = svg.selectAll("circle")
          .data(data)
          .enter()
          .append("a")
          .attr("href", d => d.href) 
          .attr("target", "_blank") 
          .append("circle")
          .attr("class", "artist-bubbles")
          .attr("r", d => Math.max(8, d.count*2))
          .attr("fill", (d, i) => `url(#pattern-${i})`)
          .on('mouseover', function(event, d){
             d3.select(this)
             .transition()
             .duration('50') 
             .style("opacity", 0.5)

             tooltip
            .transition()
            .duration('50') 
            .style("opacity", 1)
            
            tooltip.html(d.artists + " appeared " + d.count + " times")
            .style("top", (event.clientY + window.scrollY) + "px")
            .style("left", (event.clientX + window.scrollX) + "px")
            .style("opacity", 1)
          })
          .on("mouseout", function(event, d){
            d3.select(this)
             .transition()
             .duration('50') 
             .style("opacity", 1)

             tooltip
             .style("opacity", 0)

          })
        
        
        simulation.on("tick", () => {
          circles
          .attr("cx", d => Math.max(d.count, Math.min(width - 5 * d.count, d.x)))
          .attr("cy", d => Math.max(d.count, Math.min(height - 5 * d.count, d.y)))
        })

    })
    .catch((err) => {
        console.log("error", err);
    });
}



document.addEventListener('DOMContentLoaded', function () {
    d3.csv("./playlist_count.csv")
        .then((data) => {
            const height = 500,
                width = 500,
                outerRadius = height/2 - 40,
                innerRadius = 50
                arcPadding = 10;

            const svg = d3.select("#playlist_count")
                            .append("svg")
                            .attr("height", height + 100)
                            .attr("width", width + 100)
                            .append("g")
                            .attr("transform", 'translate(' + (width / 2 + 50) + "," + (height / 2 + 50) + ')');
            
            const scale = d3.scaleLinear()
                            .domain([0,1200])
                            .range([0, 2*Math.PI]);  
        
            let ticks = scale.ticks(10).slice(0,-1);
            let keys = data.map((d,i)=> d.Category)
            const numArcs = keys.length;
            const arcWidth = (outerRadius - innerRadius - numArcs * arcPadding) / numArcs;

            
            const radialLines = svg.selectAll("line")
                                    .data(ticks)
                                    .enter()
                                    .append("line")
                                    .attr("x1", 0)
                                    .attr("y1", 0)
                                    .attr("x2", d => Math.cos(scale(d)) * (outerRadius + 40))
                                    .attr("y2", d => Math.sin(scale(d)) * (outerRadius + 40))
                                    .attr("stroke", "grey");

            const labels = svg.selectAll("text")
                                .data(ticks)
                                .enter()
                                .append("text")
                                .attr("x", d => Math.cos(scale(d)+99)* (outerRadius + 50))
                                .attr("y", d => Math.sin(scale(d)+99) * (outerRadius + 50))
                                .attr("text-anchor", "middle")
                                .text(d => d);

            function degreesToRadians(degrees) {
                return (degrees * Math.PI) / 180;
            }

            let arc = d3.arc()
                        .innerRadius((d,i) => innerRadius + (numArcs - i+1) * (arcWidth + arcPadding))
                        .outerRadius((d,i) => innerRadius + (numArcs - i+1) * (arcWidth + arcPadding)  + arcWidth)
                        .startAngle(0)
                        .endAngle((d,i) => scale(d.Count))
            
            

            let arcs = svg.selectAll("path")
                        .data(data)
                        .enter()
                        .append("a")
                        .attr("href", d => d.url) 
                        .attr("target", "_blank") 
                        .append("path")
                        .attr("d", arc)  // Initial arc path
                        .attr("fill", (d, i) => d3.interpolatePiYG(i / (data.length + 1)))
                        .on('mouseover', function(d,i){
                            d3.select(this)
                                .style('opacity', 0.5)
                        })
                        .on('mouseout', function(d,i){
                            d3.select(this)
                                .style('opacity', 1)
                        })
                    
                          
            let radialAxis = svg.append("g")
                                .attr('class', 'r-axis')
                                .selectAll("g")
                                .data(data)
                                .enter()
                                .append("g")

            
            radialAxis.append("text")
                        .attr("x", -5)
                        .attr('y', (d, i) => -(innerRadius + (numArcs - i+1) * (arcWidth + arcPadding)  + arcWidth) + arcPadding)
                        .text(d => d.name)
                        .attr("text-anchor", "end");
      
    });
    
    d3.csv("./average_music.csv")
    .then((data) => {

        const chartWidth = 400,
            chartHeight = 400,
            padding = 20; // Adjust padding as needed

        const container = d3.select("#average_music");

        const tooltip  = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip")

        const svgs = container.selectAll("svg")
            .data(data)
            .enter()
            .append("svg")
            .attr("height", chartHeight)
            .attr("width", chartWidth)
            .append("g")
            .attr("transform", 'translate(' + (chartWidth / 2) + "," + (chartHeight / 2) + ')');


        svgs.each(function (d) {
            const keys =  Object.keys(d).slice(1);
            const values = Object.values(d).slice(1); 
            const innerRadius = 50;
            const outerRadius = 180;

            const angleScale = d3.scaleBand()
                .domain(d3.range(values.length))
                .range([0, 2 * Math.PI])
                .padding(0.05);

            const radialScale = d3.scaleLinear()
                .domain([0, 1]) 
                .range([innerRadius, outerRadius]);


            const radialBar = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius((d, i) => radialScale(d))
                .startAngle((d, i) => angleScale(i))
                .endAngle((d, i) => angleScale(i) + angleScale.bandwidth());

                var bars = d3.select(this)
                    .selectAll(".radial-bar")
                    .data(values)
                
                bars
                .join(
                    enter =>
                        enter
                        .append("path")
                        .attr("class", "radial-bar")
                        .attr("d", radialBar)
                        .attr("fill", (d,i) => d3.schemeSet3[i])
                        .attr("data-index", (d, i) => i)

                        .on('mouseover', function(event, d) {
                            const i = d3.select(this).attr("data-index");

                            d3.select(this)
                            .transition()
                            .duration('50') 
                            .style("opacity", 0.5)

                            tooltip
                            .transition()
                            .duration('50') 
                            .style("opacity", 1)
                            
                            tooltip.html(keys[i])
                            .style("top", (event.clientY + window.scrollY) + "px")
                            .style("left", (event.clientX + window.scrollX) + "px")

                        })

                        .on("mouseout", function () {
                            d3.select(this)
                            .transition()
                            .duration('50') 
                            .style("opacity", 1)

                            tooltip
                            .transition()
                            .duration('50') 
                            .style("opacity", 0)


                        })
                )

            d3.select(this).append("text")
                .text(d.playlist)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle");
        });

    })
    .catch((err) => {
        console.log("error", err);
    });

    d3.csv("./valence_scores.csv")
    .then(data => {
        console.log("New Data", data)
        const width = 960,
                height  = 600,
                padding = 50;
        
        const svg  = d3.select("#valence_board")
                        .append("svg")
                        .attr("height", height)
                        .attr("width", width)
                        .append("g")
                        .attr("transform", 'translate(' + padding + "," + padding + ')');

        const tooltip  = d3.select("#valence_board")
                        .append("div")
                        .attr("class", "tooltip")

                

        const circleSpacing = 10; 

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", (d, i) => (i % 50) * (10 + circleSpacing))
            .attr("cy", (d, i) => Math.floor(i / 50) * 20)
            .attr("r", 7)
            .style("fill", d => d3.interpolateGnBu(d.valence))
            .style("opacity", '0.5')
            .on('mouseover', function(event,d){
                d3.select(this)
                    .transition()
                    .duration('50') 
                    .style("opacity", 1)

                tooltip.html(`<strong>Track:</strong> ${d.track_name}<br>
                                <strong>Artist:</strong> ${d.artists}<br>
                                <strong>Album:</strong> ${d.album}`)
                    .style("top", (event.clientY + window.scrollY) + "px")
                    .style("left", (event.clientX + window.scrollX) + "px")
                    .style("opacity", 1)

            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });
           
            
        
    })
    .catch((err) => {
        console.log("error", err);
    });
    
    
    

    
      
});


