const defaultSample = 'BB_940';
const subsetDisplayed = 10;
const maxBubbles = 30;
const smallestBubble = 5;
const bubbleScale = 30;
const metaSubset = 'age,bbtype,ethnicity,gender,location,sampleid';

// Function Definitions
function updateContent(sample){
    updateCharts(sample);
    updateSummary(sample);
}

function populateSampleSelect(){
    Plotly.d3.json('/names',function(error, response){
        if(error){return error}
        $select
            .selectAll('option')
            .data(response)
            .enter()
            .append('option')
            .attr('value',function(data){return data})
            .text(function(data){return data});
    })
}

function sampleSummary(sample){
    if(sample === undefined){sample = defaultSample};
    Plotly.d3.json(`/metadata/${sample}/${metaSubset}`,function(error, response){
        if(error){return error}
        console.log(response)
        $sampleInfo
            .append('ul')
            .attr('class','list-unstyled')
            .attr('id','metadata')
            .selectAll('li')
            .data(Object.entries(response[0]))
            .enter()
            .append('li')
            .text(data=>`${data[0]}: ${data[1]}`);
    })
}

function updateSummary(sample){
    $sampleInfo.select('#metadata').remove();
    sampleSummary(sample);
}

function generateCharts(sample){
    if(sample === undefined){sample = defaultSample};
    Plotly.d3.json('/samples/'+sample,function(error, response){
        if(error){return error}
        Plotly.d3.json('/otu',function(error, otuDescriptions){
            if(error){return error}
            var otuIds = response.otu_id.slice(0,subsetDisplayed);
            var pieDescriptions = [];
            for(var i=0; i<subsetDisplayed; i++){
                pieDescriptions.push(otuDescriptions[otuIds[i]]);
            }
            otuIds.push('Others');
            pieDescriptions.push(' ');
            var samplePieValues = response.sample_values
                .slice(0,subsetDisplayed);
            samplePieValues
                .push(response.sample_values
                    .slice(subsetDisplayed,response.sample_values.length)
                    .reduce((accumulator,value)=>accumulator+value)
                );
            
            var pieTrace = {
                values: samplePieValues,
                labels: otuIds,
                hovertext: pieDescriptions,
                type: 'pie'
            };
            console.log(pieTrace);
            var pieLayout = {
                title: 'OTU Samples for ' + sample,
                height: 500,
                width: 500
            };
            Plotly.newPlot('pieChart',[pieTrace],pieLayout);
            
            var bubbleDescriptions = [];
            var bubbleColors = [];
            for(var i=0; i<response.sample_values.length; i++){
                bubbleDescriptions.push(otuDescriptions[response.otu_id[i]]);
                bubbleColors.push(Plotly.d3.hsl(response.otu_id[i]/10,response.sample_values[i]/2+20,50));
            }

            var bubbleTrace = {
                y: response.sample_values,
                x: response.otu_id,
                marker: {
                    size: response.sample_values.map(data=>data*bubbleScale),
                    sizemode: 'area',
                    sizemin: smallestBubble,
                    color: bubbleColors,
                    maxdisplayed: maxBubbles
                },
                hovertext: bubbleDescriptions,
                type: 'scatter',
                mode: 'markers'
            };
            console.log(bubbleTrace)
            var bubbleLayout = {
                xaxis:{
                    title: 'OTU ID'
                },
                yaxis:{
                    title: 'Sample Size'
                },
                width: 1000,
                height: 500
            }
            Plotly.newPlot('bubbleChart',[bubbleTrace],bubbleLayout);
        });
    });
}

function updateCharts(sample){
    Plotly.d3.select('pieChart').html('');
    Plotly.d3.select('bubbleChart').html('');
    generateCharts(sample);
}

// Dashboard Titles
let $sampleInfo = Plotly.d3.select('#sampleInfo');
$sampleInfo
    .append('h2')
    .attr('style','font-size: 1em')
    .attr('class','card-title')
    .text('SELECT Sample:');
let $select = $sampleInfo
    .append('select')
    .attr('name','sample_select')
    .attr('onchange','updateContent(this.value)');

// Populate dashboard
populateSampleSelect();
generateCharts();
sampleSummary();
