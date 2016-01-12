var React = require('react');
var ReactDOM = require('react-dom');
var Select = require('react-select');

const testoptions = [
    {value: 'one', label: 'One'},
    {value: 'two', label: 'Two'}
];

var PASADetails = React.createClass({
    returnJasonCallback: function () {
        return;
    },


    loadPASADetails: function () {
        $.ajax({
            crossDomain: true,
            crossOrigin: true,
            type: "GET",
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    }
    ,
    getInitialState: function () {
        return {
            data: []

        };
    }
    ,
    componentDidMount: function () {
        this.loadPASADetails();
        this.setState({options: this.state.options, data: this.state.data, value: this.state.value}, function () {
            console.log(this.state);
        });
        setInterval(this.loadPASADetails, this.props.pollInterval);
    }
    ,
    render: function () {
        return (
            <div className="container">
                <h1>PASA Details</h1>
                <PASAForm />
                <PASALines data={this.state.data}/>

            </div>
        );
    }
});

var PASALines = React.createClass({
    render: function () {
        var PASANodes = this.props.data.map(function (pasaline) {
            return (
                <PASALine key={pasaline.TaskUUID} TaskName={pasaline.TaskName}
                          resourceName={pasaline.Responsible.resourceName}
                          TaskEnd={pasaline.TaskEnd}/>
            );
        });

        return (
            <div className="well">
                {PASANodes}
            </div>
        );
    }
});

var PASALine = React.createClass({
    render: function () {
        return (
            <blockquote>
                <p>{this.props.TaskName}</p>
                <strong>{this.props.resourceName}</strong>
                <small>{this.props.TaskEnd}</small>
            </blockquote>
        );
    }
});


var PASAForm = React.createClass({
    transformProductSelectJSON: function (json) {
        var response = new Array();

        json.forEach(function (entry) {
            var val = {productId: entry.productId, productName: entry.productName};
            response.push({value: val, label: entry.productName})
        });
        return response;
    }
    ,
    loadProducts: function () {
        return fetch(`http://localhost:9999/products/callback`)
            .then((response) => {
                return response.json();
            }).then((json) => {
                var transformedResponse = this.transformProductSelectJSON(json);
                console.log(transformedResponse);
                return {options: transformedResponse};
            });
    }
    ,
    getInitialState: function () {
        return {
            options: []
        };
    }
    ,
    logChange: function (val) {
        console.log('selected: ' + val);
        this.setState({value: val});
    }
    ,
    handleSubmit: function (e) {
        e.preventDefault();

        var formData = $("#PASAForm").serialize();


        var saveUrl = "http://localhost:9999/tasks/save";
        $.ajax({
            url: saveUrl,
            method: 'POST',
            dataType: 'json',
            data: formData,
            cache: false,
            success: function (data) {
                console.log(data)
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(saveUrl, status, err.toString());
            }.bind(this)
        });

        // clears the form fields
        this.setState({taskDescription: "", value: "", desiredDate: new Date()})
        return;
    },

    render: function () {
        return (
            <div className="row">
                <form id="PASAForm" onSubmit={this.handleSubmit}>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <Select.Async id="productName" multi={true} name="productName" ref="productName" required
                                          value={this.state.value}
                                          loadOptions={this.loadProducts}
                                          onChange={this.logChange}
                            />
                        </div>
                    </div>
                    <div className="col-xs-5">
                        <div className="form-group">
                            <input type="text" id="taskDescription" name="taskDescription" required
                                   ref="taskDescription"
                                   placeholder="Task description"
                                   className="form-control"
                                   value={this.state.taskDescription}/>
                        </div>
                    </div>
                    <div className="col-xs-2">
                        <div className="form-group">
                            <input type="datetime" name="desiredDate" required ref="desiredDate"
                                   placeholder="Desired date" className="form-control" data-provide="datepicker"
                                   value={this.state.desiredDate}/>
                            <span className="input-icon fui-check-inverted"></span>
                        </div>
                    </div>
                    <div className="col-xs-2">
                        <input type="submit" className="btn btn-block btn-info" value="Add"/>
                    </div>
                </form>
            </div>
        )
            ;
    }
});

ReactDOM.render(<PASADetails url="http://localhost:9999/tasks/callback"
                             pollInterval={20000}/>, document.getElementById('content'));
