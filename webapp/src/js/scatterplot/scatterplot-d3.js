import * as d3 from 'd3';


function circle_attributes(selection, props){
  return selection.attr("r", 2).attr("color", "red").attr("fill", "red");
}

function default_text_attributes(selection, props){
  let default_font_size = props.font_size || "8px";
  let default_text_color = "grey";

  let on_hover_text_color = "black";
  let hover_transition_duration = 300;

  return selection.text(props.word)
                  .attr("fill", props.text_color || default_text_color)
                  .attr("stroke",  props.text_color || default_text_color)
                  .attr("font-size", default_font_size)
                  .on("mouseover", function(d, i){
                    let elem = d3.select(this);
                    elem.transition()
                        .duration(hover_transition_duration)
                        .attr("fill", on_hover_text_color)
                        .attr("stroke", on_hover_text_color)
                        .attr("font-size", elem.attr("font-size") * 1.3);
                    
                  })
                  .on("mouseout",function(d, i){
                    let elem = d3.select(this);
                    elem.transition()
                        .duration(hover_transition_duration)
                        .attr("font-size", default_font_size)
                        .attr("fill", default_text_color)
                        .attr("stroke", default_text_color);
                    
                        
                  } );
}

function constructScales(props){
  let height = props.height - (props.margins.t + props.margins.b);
  let width = props.width - (props.margins.l + props.margins.r);

  let xScale = d3.scaleLinear()
                .domain(d3.extent(props.data, props.x))
                .range([0, width]);

  let yScale = d3.scaleLinear()
                .domain(d3.extent(props.data, props.y))
                .range([0, height])

  return [xScale, yScale];
}

function draw_data_points(selection, props, scales){
  // Draw elements
  let items = selection.selectAll("g")
                    .data(props.data, (d, i) => i);
  
  let items_update_selection = items.transition().ease(d3.easeSin).duration(props.transition_duration)
                                  .attr("transform", d => `translate(${scales.xScale(props.x(d))}, ${scales.yScale(props.y(d))})`);

  let items_enter_selection = items.enter()
                                  .append("g")
                                  .attr("transform", d => `translate(${scales.xScale(props.x(d))}, ${scales.yScale(props.y(d))})`)
                                  .on("mouseover", function(){
                                    this.parentNode.appendChild(this);
                                  });
  
  let  text = items_enter_selection.append("text");
  text.call(default_text_attributes, props);

  items.exit().filter(':not(.exiting)')
        .classed('exiting', 'true')
        .transition().ease(d3.easeSin).duration(props.transition_duration)
        .remove();
}



function scatter_plot(){
  let chart = Object.create({});
  
  chart.create = (elem, props) => {
                    let svg = d3.select(elem)
                                .append("svg")
                                .attr("height", props.height)
                                .attr("width", props.width);
                    
                                    
                    // Scales
                    let [xScale, yScale] = constructScales(props);

                    
                    // zoom related variables and functions
                    let height = props.height - (props.margins.t + props.margins.b);
                    let width  = props.width - (props.margins.l + props.margins.r);
                    let zoom = d3.zoom()
                                  .scaleExtent([1/2, 4])
                                  .translateExtent([[-1, -1], [width, height]])
                                  .on("zoom", zoomed);
                    let zoomed = function() {
                      root_g.attr("transform", d3.event.transform);
                    };

                    // setup root g element
                    let root_g = svg.append("g")
                                    .attr("transform", `translate(${props.margins.l}, ${props.margins.b})`);


                    root_g.call(zoom);
                    root_g.append("rect").attr("height", height) 
                                         .attr("width", width)
                                         .attr("fill", "white");
                    
                    // draw items
                    root_g.call(draw_data_points, props, {xScale: xScale, yScale: yScale})
                    
                  };

  chart.update = (elem, props) => {
                    let svg = d3.select(elem)
                                .select("svg")
                                .attr("height", props.height)
                                .attr("width", props.width);

                    // Scales
                    let [xScale, yScale] = constructScales(props);
                    let root_g = svg.select("g").attr("transform", `translate(${props.margins.l}, ${props.margins.b})`);
                    
                    root_g.call(draw_data_points, props, {xScale: xScale, yScale: yScale})
                 };

return chart;
}

let scatter = scatter_plot();

export default scatter;
