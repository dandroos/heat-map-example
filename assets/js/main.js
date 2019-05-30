const url = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json`;

const req = new XMLHttpRequest();
req.open("GET", url, true);
req.onreadystatechange = () => {
    if (req.status === 200 && req.readyState === 4) {
        const data = JSON.parse(req.responseText)
        getGraph(data);
    }
}
req.send();

const getGraph = (json) => {

    const w = 1000, h = 500;

    const margin = {
        x: 80,
        y: 60
    }

    const getMonth = (monthIndex)=>{
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    }

    // User Story #1: My heat map should have a title with a corresponding id="title".

    d3.select('#heat-map')
        .append('h1')
        .attr('id', 'title')
        .text('Monthly Global Land-Surface Temperature');

    // User Story #2: My heat map should have a description with a corresponding id="description".

    d3.select('#heat-map')
        .append('p')
        .attr('id', 'description')
        .text('1753 - 2015: base temperature 8.66℃');

    const svg = 
        d3.select('#heat-map')
            .append('svg')
            .attr('width', w)
            .attr('height', h)

    const scaleX =
        d3.scaleBand()

        // User Story #12: My heat map should have multiple tick labels on the x-axis with the years between 1754 and 2015.
        .domain(json.monthlyVariance.map((i)=> i.year))
        .range([0, w - margin.x], 0, 0).align(0);
    
    // User Story #3: My heat map should have an x-axis with a corresponding id="x-axis".

    const xAxis = d3.axisBottom(scaleX)
        .tickValues(scaleX.domain().filter((i)=> i%10 == 0)).tickSizeOuter(0);
        
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(${margin.x - 1}, ${h - (margin.y / 2)})`)
        .call(xAxis)    

    // User Story #4: My heat map should have a y-axis with a corresponding id="y-axis".
    const scaleY =
        d3.scaleBand()
            .domain(json.monthlyVariance.map((i)=> i.month))
            .range([0, h - margin.y], 0, 0).align(1);


    const yAxis = d3.axisLeft(scaleY)

        // User Story #11: My heat map should have multiple tick labels on the y-axis with the full month name.
        .tickFormat((d)=> {
            return getMonth(d - 1);
        })
        .tickSizeOuter(0)

    svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.x - 1}, ${margin.y / 2})`)
        .call(yAxis);

    // User Story #5: My heat map should have rect elements with a class="cell" that represent the data.

    const minTemp = d3.min(json.monthlyVariance.map((i)=> json.baseTemperature + i.variance));
    const maxTemp = d3.max(json.monthlyVariance.map((i)=> json.baseTemperature + i.variance));
    
    const difference = maxTemp - minTemp;
    const steps = 8;
    const increment = difference / steps;

    const arr = [minTemp]
    for(var i = 1; minTemp + (i * increment) < maxTemp; i++){
        arr.push(minTemp + (i * increment))
    }

    var colorArr = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#e0f3f8','#abd9e9','#74add1','#4575b4','#313695']

    // User Story #6: There should be at least 4 different fill colors used for the cells.
    const colourScale = d3.scaleThreshold()
    .domain(arr)
    .range(colorArr.reverse());

    svg.selectAll('rect')
        .data(json.monthlyVariance)
        .enter()
        .append('rect')
            .attr('class', 'cell')
            
            // User Story #7: Each cell will have the properties data-month, data-year, data-temp containing their corresponding month, year, and temperature values.
            // User Story #8: The data-month, data-year of each cell should be within the range of the data.
            .attr('data-month', (d)=> d.month - 1)
            .attr('data-year', (d)=> d.year)
            .attr('data-temp', (d)=> d.variance)

            .attr('width', scaleX.bandwidth())
            .attr('height', scaleY.bandwidth())

            // User Story #9: My heat map should have cells that align with the corresponding month on the y-axis.
            .attr('y', (d)=> scaleY(d.month))
            
            // User Story #10: My heat map should have cells that align with the corresponding year on the x-axis.
            .attr('x', (d)=> scaleX(d.year))

            .attr('transform', `translate(${margin.x}, ${margin.y / 2})`)
            .style('fill', (d)=> colourScale(json.baseTemperature + d.variance))
            .on('mouseover', (d)=>{
                tooltip.html(`
                <strong>Year: </strong>${d.year}<br>
                <strong>Month: </strong>${getMonth(d.month - 1)}<br>
                <strong>Temperature: </strong>${(json.baseTemperature + d.variance).toFixed(1)}℃ (${d.variance.toFixed(1)}℃)
                `).style('opacity', 1)
                .attr('data-year', ()=>d.year)
            })
            .on('mouseout', ()=>{
                tooltip.style('opacity', 0)
            })
    
    // User Story #13: My heat map should have a legend with a corresponding id="legend".
    // User Story #14: My legend should contain rect elements.

    const legendWidth = 500;
    const legendHeight = 50;

    const legendMargin = 50;

    const legend = 
        d3.select('#heat-map')
            .append('svg')
                .attr('id', 'legend')
                .attr('width', legendWidth - legendMargin);

    const legendScale =
        d3.scaleLinear()
        .domain([minTemp ,maxTemp])
        .range([legendMargin, legendWidth - legendMargin]);
    
        const legendAxis = 
d3.axisBottom(legendScale)
        .tickValues(colourScale.domain().filter((i, d)=> d !== 0))
        .tickFormat((d)=>d.toFixed(1))
        .tickSizeOuter(0)

        legend.append('g')
            .call(legendAxis)
            .attr('transform', `translate(0, ${legendHeight})`)

            legend.selectAll('rect')
            .data(arr)
            .enter()
            .append('rect')
            .attr('width', (legendWidth-legendMargin)/arr.length)
            .attr('height', 50)
            .attr('x', (d, i)=> legendScale(d))
            // User Story #15: The rect elements in the legend should use at least 4 different fill colors.
            .attr('fill', (d,i)=> colourScale(d))
            

    
    // User Story #16: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.

    const tooltip = 
        d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            
    // User Story #16: My tooltip should have a data-year property that corresponds to the data-year of the active area.
    // Here is the dataset you will need to complete this project: https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json
    // You can build your project by forking this CodePen pen. Or you can use this CDN link to run the tests in any environment you like: https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js
}