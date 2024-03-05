document.addEventListener('DOMContentLoaded', function () {
    d3.csv("./playlist_count.csv")
        .then((data) => {
            const height = 600,
                width = 600,
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
                        .append("path")
                        .attr("d", arc)  // Initial arc path
                        .attr("fill", (d, i) => d3.interpolatePiYG(i / (data.length + 1)))  
                    
                    
                            
                            
            let radialAxis = svg.append("g")
                                .attr('class', 'r-axis')
                                .selectAll("g")
                                .data(data)
                                .enter()
                                .append("g")

            
            radialAxis.append("text")
                        .attr("x", -5)
                        .attr('y', (d, i) => -(innerRadius + (numArcs - i+1) * (arcWidth + arcPadding)  + arcWidth) + arcPadding)
                        .text(d => d.Category)
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
    

});

