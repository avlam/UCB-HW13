function updateCharts(sample){
    Plotly.d3.json('/metadata/'+sample,function(error, response){
        if(error){return error}
        /* Insert code here */
    })
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

let $sampleInfo = Plotly.d3.select('#sampleInfo');
$sampleInfo
    .append('h1')
    .text('SELECT Sample:');
let $select = $sampleInfo
    .append('select')
    .attr('name','sample_select')
    .attr('onChange',updateCharts(this.value));

// Populate dashboard
populateSampleSelect();
