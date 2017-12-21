import React from 'react';
import * as ReactDOM from 'react-dom';
import scatterplot_d3_component from "./scatterplot-d3.js" ;

/**
 * A React compatible scatterplot.
 *
 * props:
 * data - required
 * fill - required
 * x - x accessor function - required
 * y - y accessor function - required
 *
 **/

/**
 * A text-box Component
 * 
 * props:
 *  onChange - callback for when the text gets updated
 *  isValid      - whether current state of textbox is valid
 *  placeholder  - 
 */
class TextBoxes extends React.Component{
  render(){
    function callIfExists(fn){
      function caller(...args){
        if(fn !== null || fn !== undefined){
          return fn(...args);
        }
      }
      return caller;
    }
    
    let callOnChangeIfExists = callIfExists(this.props.onChange);

    return (
      <input type="text" value={this.props.value}  placeholder={this.props.placeholder} onChange={callOnChangeIfExists}/>
    );
  }
}

/**
 *    React Component
 **/
export default class ScatterPlot extends React.Component{
  constructor(props){
    super(props);
    this.state = {step: 0, step_output: "0", transition_duration: 700};
  }

  /* Input control handlers */
  animate(){
    function update(){
      if(this.state.step < this.props.data.length - 1){
        this.step.call(this);
        setTimeout(update.bind(this), this.state.transition_duration + 300);
      }
    }

    setTimeout(update.bind(this), this.state.transition_duration + 300);
  }

  reset(){
    this.setState({step: 0, step_output: 0});
  }

  updateStep(event){
    let new_step = this.state.step;
    if(!isNaN(event.target.value) && event.target.value <= this.props.data.length
                                  && event.target.value.length > 0){
      new_step = parseInt(event.target.value);
      this.setState({step: new_step - 1, step_output: new_step});
    }else{
      this.setState({step_output: event.target.value});
    }
    
  }

  step(){
    let next_step = (this.state.step + 1) % this.props.data.length;
    this.setState({step: next_step, step_output: next_step + 1});
  }
  
  /* React Component LifeCycle Methods */
  componentDidUpdate(){
    scatterplot_d3_component.update(ReactDOM.findDOMNode(this), this.getD3Props())
  }

  render(){
    let step_output = this.state.step_output;
    if(!isNaN(this.state.step_output) && parseInt(this.state.step_output) <= this.props.data.length 
                                      && parseInt(this.state.step_output) >= 0){
      step_output = parseInt(this.state.step_output);
    }
    return (
              <div border="1px solid">
                <button onClick={this.step.bind(this)}> Step </button>
                <button onClick={this.animate.bind(this)}> Play Animation </button>
                <button onClick={this.reset.bind(this)}> Reset </button>
                <TextBoxes value={step_output} placeholder={"Total Steps: " + this.props.data.length} onChange={this.updateStep.bind(this)}/>
              </div>
           );
  }

  componentDidMount(){
    let svg = ReactDOM.findDOMNode(this);
    
    scatterplot_d3_component.create(svg, this.getD3Props());
  }

  getD3Props(){
    return {
      x: d => d.x,
      y: d => d.y,
      word: d => d.word,
      height: this.props.height,
      width: this.props.width,
      data: this.props.data[this.state.step],
      margins:this.props.margins,
      transition_duration: this.state.transition_duration
    };
  }
}