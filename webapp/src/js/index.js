import * as request from 'superagent';
import * as _ from 'lodash';
import * as d3Hsv from 'd3-hsv'
import React from 'react';
import * as ReactDOM from 'react-dom';
import * as d3Contours from 'd3-contour';
import Rx from 'rxjs/Rx';


import ScatterPlot from './scatterplot/scatterplot.js';


let data = [];

let height = 600;
let width = 900;
let margins = {
  l: 30,
  r: 100,
  t: 100,
  b: 100
};

function render(data){
  ReactDOM.render(<ScatterPlot data={data} height={height} width={width} margins={margins}/>,
    document.getElementById("REACT")
  );
}

/**
 * data schema
 * {
 *    root_index:{
 *      [step_index]: {
 *        step_data_index
 *      }
 *    }
 * }
 */

function flattened_indexed_json_to_array(data){
  let indexed_keys = Object.keys(data).map(parseInt).sort();
  return _.map(Object.keys(indexed_keys), function(datum_key){
    return data[datum_key];
  });
}


function prepData(data){
  // flatten indexed arrays to
  let flattened_data = flattened_indexed_json_to_array(data);
  flattened_data.forEach((datum, i) => {
    flattened_data[i].data = flattened_indexed_json_to_array(flattened_data[i].data);
  });

  let prepped_data = {};
  prepped_data.average_loss = flattened_data.map((d) => d.average_loss);
  prepped_data.step_data = flattened_data.map(d => d.data);

  return prepped_data;
}

request.get("snapshots.json")
  		 .end((err, resp) => {
          let data = JSON.parse(resp.text);
          data = prepData(data);
          console.log(data);
  				render(data.step_data);
  		 });

