var View = React.createClass({
  // View contains the Composer and Preview components, and handles data between the two components.
  getInitialState: function() {
    return {
      data: []
    };
  },

  submit: function(data) {
    // On submit (alerted by Composer), send data from Composer component to be 
    // rendered in Preview component.
    this.setState({data: data});
  },

  render: function() {
    return (
      <div>
        <Composer submit={this.submit} />
        <Preview data={this.state.data} />
      </div>
    );
  }
});

var Composer = React.createClass({
  // Composer is the view containing WidgetList (a list of Widgets that can be added) and 
  // WidgetInstances (the list of Widget component instances). It handles all changes 
  // in state from WidgetList, WidgetInstances, and individual Widgets.
  getInitialState: function() {
    return {
      instances: [],
      title: null
    };
  },

  handleAddWidget: function(data) {
    // When this function is called by WidgetList, add a new Widget to WidgetInstances.
    var newCount = this.state.instances;
    newCount.push(data);
    this.setState({instances: newCount});
  },

  handleDeleteWidget: function(data) {
    // When this function is called by an individual Widget, remove the Widget from 
    // WidgetInstances.
    var instances = this.state.instances;
    var instanceLength = instances.length;
    for (var i = 0; i < instanceLength; i++){
      if (instances[i].key == data.key){
        instances.splice(i, 1);
        this.setState({instances: instances});
        break;
      }
    }
  },

  handleUpdateData: function(data){
    // When the fields in an individual Widget is changed, update the data stored 
    // in this.state.instances (a collection of all the data entered in the Widgets)
    var instances = this.state.instances;
    var instanceLength = instances.length;
    for (var i = 0; i < instanceLength; i++){
      if (instances[i].key == data.key){
        instances[i] = data;
        this.setState({instances: instances});
        break;
      }
    }
  },

  handleUpdateTitle: function(title){
    // When the title is updated in WidgetInstances, update this.state.title (survey's title).
    this.setState({title: title});  
  },

  handleSubmit: function() {
    // When Composer is alerted by WidgetInstances to preview data, Composer alerts the View 
    // parent component to submit data to the Preview component.
    this.props.submit([this.state.title, this.state.instances]);
  },

  render: function() {
    return (
      <div style={{display:'inline-block'}}>
        <div style={{display:'inline-block', verticalAlign:'top', 
          width: '200', textAlign: 'center'}}>
          <WidgetList addWidget={this.handleAddWidget} />
        </div>
        <div style={{display:'inline-block', width: '450', textAlign: 'center'}}>
          <WidgetInstances data={this.state.instances} handleDeleteWidget={this.handleDeleteWidget} 
            handleUpdateData={this.handleUpdateData} handleUpdateTitle={this.handleUpdateTitle} 
            onSubmit={this.handleSubmit} />
        </div>
      </div>
    );
  }
});

var WidgetList = React.createClass({
  // WidgetList is a list of all the Widgets that can be added (Radio and Checkbox).
  addRadio: function() {
    // When the Radio button is clicked, add a new Radio component to the list of instances.
    // The key and type of widget is passed to and is handled by the parent Composer component.
    var timestamp = Date.now();
    this.props.addWidget({type: "radio", key: timestamp});
  },

  addCheckbox: function() {
    // When the Checkbox button is clicked, add a new Checkbox component to the list of instances.
    // The key and type of widget is passed to and is handled by the parent Composer component.
    var timestamp = Date.now();
    this.props.addWidget({type: "checkbox", key: timestamp});
  },

  render: function() {
    return (
      <div style={{display:'inline-block'}}>
        <h3>Widget List</h3>
        <button type="button" onClick={this.addRadio}>Radio</button>
        <br />
        <button type="button" onClick={this.addCheckbox}>Checkbox</button>
      </div>
    );
  }
});

var WidgetInstances = React.createClass({
  // WidgetInstances is the second column on the page. It holds all of the instances of the Widget
  // component. It also contains a field for the survey title. WidgetInstances serves as the 
  // middle man for handling data from the individual instances of the Widget to the Composer,
  // where the Widgets' data can be handled.
  handleDeleteWidget: function(data) {
    // Data is passed up from the Widget child component, and is then passed up to the parent 
    // Composer component where it will handle deletion of the Widget.
    this.props.handleDeleteWidget(data);
  },

  handleUpdateData: function(data){
    // Data is passed from the Widget child component, and is then passed up to the parent 
    // Composer component where it will handle updating the Widget's data.    
    this.props.handleUpdateData(data);  
  },

  handleUpdateTitle: function(title){
    // When the title is changed, WidgetInstances will pass up data to the parent Composer 
    // component where it will handle updating the survey's title. 
    this.props.handleUpdateTitle(this.refs.title.value.trim());  
  },

  onSubmit: function(){
    // When the submit button is pressed, alert the parent Composer component to send data to 
    // the Preview component.
    this.props.onSubmit();  
  },

  render: function() {
    var deleteFunction = this.handleDeleteWidget;
    var handleUpdateData = this.handleUpdateData;
    var instanceNodes = this.props.data.map(function (data) {
      return (
        <Widget key={data.key} data={data} deleteWidget={deleteFunction} 
          updateData={handleUpdateData} />
      );        
    });
    return (
      <div>
        <div style={{display:'inline-block'}}>
          <div style={{display:'inline-block', padding: "0px 10px"}}>
            <h4>Survey Title:</h4>   
          </div>
          <div style={{display:'inline-block'}}>
            <input type="text" ref="title" placeholder="Type title here." 
              onChange={this.handleUpdateTitle}/> 
          </div>
        </div>
        <input type="button" value="Submit" onClick={this.onSubmit} />
        {instanceNodes}
      </div>
    );
  }
});

var Widget = React.createClass({ 
  // Widget is an individual Widget containing fields for questions and choices.
  deleteWidget: function() {
    // When the delete button is clicked, send the Widget's data to the parent WidgetInstances.
    // WidgetInstances has an identical function that sends the data to their parent, Composer,  
    // where it can delete the widget.
    this.props.deleteWidget({
      type: this.props.data.type, 
      key: this.props.data.key, 
      question: this.refs.question.value.trim(), 
      choices: this.refs.choices.value.trim()
    });
  },

  updateData: function() {
    // When the data within the Widget instances is changed, send the Widget's data to the 
    // parent WidgetInstances. WidgetInstances has an identical function that sends the 
    // data to their parent, Composer, where it can update the data.
    this.props.updateData({
      type: this.props.data.type, 
      key: this.props.data.key, 
      question: this.refs.question.value.trim(), 
      choices: this.refs.choices.value.trim()
    });
  },

  render: function() {
      var title = "";
      if (this.props.data.type == "radio"){
        title = "Radio";
      }else {
        title = "Checkbox";
      }          
    return (
      <div className="widget" style={{margin: "10px", backgroundColor: "#ebebeb"}}>
        <div style={{display:"inline-block"}}>
          <h4 style={{textAlign:'left', margin: "10px", float:'left'}}>{title}</h4>
          <div style={{margin: "10px", float:'right'}}>
            <button type="button" onClick={this.deleteWidget} 
              style={{border: "none", outline: "none"}} >X</button>
          </div>
        </div>
        <br />
        <div>
          <input type="text" placeholder="Type question here." ref="question" 
            width="100" onChange={this.updateData}/>
          <br />
          <input type="text" placeholder="Type choices here." ref="choices" 
            onChange={this.updateData}/>
        </div>
      </div>
    );
  }
});

var Preview = React.createClass({
  // In the Preview component, you can preview all of the data entered into the Composer component.
  render: function() {
    var data = this.props.data;
    var title, instances, instanceNodes, cleanChoices;
    var returnData = [];
    if (data[1]){ 
      //Tf there is data sent to Preview component, parse and render the data. 
      title = data[0].toUpperCase();
      instances = data[1];
      instanceNodes = instances.map(function (widget) {
        var choices = widget.choices;
        cleanChoices = [];
        cleanChoices.push(<h4>{widget.question.toUpperCase()}</h4>);
        choices = choices.split(",");
        choices.forEach(function (chc) {
          chc = chc.trim();
          if (widget.type == "radio"){
            // I didn't have enough time to implement functional checkboxes and radios. If I did,
            // I would wrap the choices in <form></form> and change <p> in line 258 & 260 to <input>.
            cleanChoices.push(<p>○ {chc}</p>);
          }else {
            cleanChoices.push(<p>□ {chc}</p>);
          }
        }); 
        returnData.push(cleanChoices);
      });         
    } 
    return (
      <div className="preview" style={{display:'inline-block', verticalAlign:'top', 
        textAlign: 'left', width: '300', margin: "0px 50px"}} >
        <h3>Preview</h3>
        <h4 style={{textDecoration: "underline"}}>{title}</h4>
        {returnData}
      </div>
    );
  }
});

ReactDOM.render(
  <View />,
  document.getElementById('content')
);