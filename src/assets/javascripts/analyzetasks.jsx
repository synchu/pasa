var React = require('react');
var ReactDOM = require('react-dom');
var Select = require('react-select');
import ToolboxApp from 'react-toolbox/lib/app';
import DatePicker from 'react-toolbox/lib/date_picker/';
import Table from 'react-toolbox/lib/table/';
import MainAppBar from 'navbar';
import Input from 'react-toolbox/lib/input'
import dropstyle from 'react-toolbox/lib/dropdown/style.scss'


const CHEVRON_LEFT = '<';
const CHEVRON_RIGHT = '>';

/**
 * This is our PASA front end screen, comprising PASAForm component with form fields for entering new task and
 * PASALines component, that displays
 * tasks we already have in the system
 */
var PASADetails = React.createClass({
    transformPasaDetails: function (json) {
        var response = new Array();

        json.forEach(function (entry) {
            response.push({
                TaskUUID: entry.TaskUUID,
                ProductName: entry.Product.productName,
                ResourceName: entry.Responsible.resourceName,
                TaskName: entry.TaskName,
                TaskStart: entry.TaskStart
            })
        });
        return response;
    },
    /**
     * Main function that loads (in json string format) the task data from PASA backend
     */
    loadPASADetails: function () {
        $.ajax({
            crossDomain: true,
            crossOrigin: true,
            type: "GET",
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({data: this.transformPasaDetails(data)});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    }
    ,
    /**
     * React standard - inits component data with empty
     * @returns {{data: Array}}
     */
    getInitialState: function () {
        return {
            data: []

        };
    }
    ,
    /**
     *React invokes this once the component - i.e. PASADetails has been mount - thus we need to load task details and
     *set state data (i.e. information that needs to be displayed on screen)
     */
    componentDidMount: function () {
        this.loadPASADetails();
        this.setState({options: this.state.options, data: this.state.data, value: this.state.value}, function () {
            console.log(this.state);
        });
        //sets the refresh interval to reload the information from the backend should any other input channel
        //entered some other tasks
        setInterval(this.loadPASADetails, this.props.pollInterval);
    }
    ,
    /**
     * React standard override component rendering function
     * @returns {XML}
     */
    render: function () {
        return (
            <div className="container" style={{paddingTop: 70+'px'}}>
                <h1>PASA Details</h1>
                <PASAForm onReloadDetails={this.loadPASADetails}/>
                <PASALines data={this.state.data}/>
            </div>
        );
    }
});

/**
 * This component returns all lines of our form, with each line, i.e. PASANode item comprising a task
 */
const tableModel = {
    ProductName: {type: String},
    TaskName: {type: String},
    ResourceName: {type: String},
    TaskStart: {type: Date}
};

var PASALines = React.createClass({
    /**
     * React standard component render override
     * @returns {XML}
     */
    render: function () {
        return (
            <div className="well">
                <Table
                    model={tableModel}
                    selectable={false}
                    source={this.props.data}
                />

            </div>
        );
    }
});

/**
 * Our PASAForm handling fields necessary to submit a new task request
 */
var PASAForm = React.createClass({
    /**
     * ReloadDetails
     */
    onReloadDetails: function () {
        //reload tasks
        this.props.onReloadDetails();
    },
    /**
     * Transform products to object that is read by Drop down select field
     * @param json - json to be transformed
     * @returns {Array} - array of transformed objects
     */
    transformProductSelectJSON: function (json) {
        var response = new Array();

        json.forEach(function (entry) {
            var val = {productId: entry.productId, productName: entry.productName};
            response.push({value: val, label: entry.productName})
        });

        return response;
    }
    ,
    /**
     * Load products from the backend
     * @returns {Promise.<TResult>} - products from the database as array of objects in the object format, required
     * by the drop down select
     */
    loadProducts: function () {
        let url = `http://pacific-thicket-3407.herokuapp.com/products/callback`;
        return $.ajax({
            crossDomain: true,
            crossOrigin: true,
            type: "GET",
            url: url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                return data;
            }.bind(this),
            error: function (xhr, status, err) {
                console.info(status.toString())
                this.setState({lastErr: status.toString() + ' ' + err.toString()})
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    }
    ,
    /**
     * React standard getInitialState function override to init our component
     * @returns {{options: Array, productName: string, taskDescription: string, desiredDate: Date}}
     */
    getInitialState: function () {
        return {
            options: [],
            productName: "",
            taskDescription: "",
            desiredDate: new Date()
        };
    }
    ,
    /**
     * React standard, executed on mounting completion
     */
    componentDidMount: function () {

        this.loadProducts().then(function(result){
            var selectOptions = this.transformProductSelectJSON(result);
            this.setState({options: selectOptions});
        }.bind(this));

    }
    ,
    /**
     * handle selected product(s) change in our drop down selection field in PASAForm
     * @param pval
     */
    handleProductChange: function (pval) {
        console.log('selected: ' + pval);
        this.setState({productName: pval});

    }
    ,
    /**
     * handle task description change in our PASAform
     * @param e
     */
    handleTaskDescriptionChange: function (e) {
        //console.log('taskDescription '+e)
        this.setState({taskDescription: e});
    }
    ,
    /**
     * handle PASAForm submission. This function submits the (JQuery serialized -> field1=val1 field2=val2) form data
     * to PASA backend http server
     * @param e
     */
    handleSubmit: function (e) {
        e.preventDefault();

        var formData = $("#PASAForm").serialize();
        console.log(formData);


        //ajax submission
        var saveUrl = "http://pacific-thicket-3407.herokuapp.com/tasks/save";
        $.ajax({
            crossDomain: true,
            crossOrigin: true,
            url: saveUrl,
            method: 'POST',
            //dataType:'json',
            //contentType:'application/json',
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
        this.setState({taskDescription: "", productName: "", desiredDate: new Date()})
        this.onReloadDetails();

        return;
    },
    /**
     * Dump desired date to console
     * @param date
     */
    handleDump: function (date) {
        this.setState({desiredDate: date});
        console.log(date);
    }
    ,
    /**
     * React standard render function override. This renders PASAForm fields and attached the relevant event handlers
     * @returns {XML}
     */
    render: function () {


        return (

            <div className="row">

                <form id="PASAForm" onSubmit={this.handleSubmit}>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <Select id="productName" name="productName" multi={true} placeholder="Select product"
                                    ref={(component) => (this._productName = component)}
                                    className={dropstyle.templateValue+' '+ dropstyle.value}
                                    style={{border:0, paddingTop:8+'px'}}
                                    required
                                    value={this.state.productName}
                                    options={this.state.options}
                                    onChange={this.handleProductChange}
                            />
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <div className="form-group">
                            <Input type="text" id="taskDescription" name="taskDescription" required
                                   ref={component => this._taskDescription = component}
                                   placeholder="Task description"
                                // className="form-control"
                                   onChange={this.handleTaskDescriptionChange}
                                   value={this.state.taskDescription}/>
                        </div>
                    </div>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <DatePicker id="desiredDate" name="desiredDate" placeholder="Desired date"
                                        label="Desired date"
                                        required ref={component => this._desiredDate = component}
                                        value={this.state.desiredDate}
                                        onChange={this.handleDump}/>

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

/**
 * Call to the React's standard renderer to render the navigation bar
 */
ReactDOM.render(
    <MainAppBar/>

    , document.getElementById('appbar')
)
;

/**
 * Call to the React's standard renderer to render the PASA front end screen /PASADetails. Note the poll interval
 * set to 25s which refreshes the task details (should there's another input channel for tasks). Tasks are also reloaded
 * on new task submission
 */
ReactDOM.render(
    <ToolboxApp>
        <PASADetails
            url="http://pacific-thicket-3407.herokuapp.com/tasks/callback"
            pollInterval={25000}/>
    </ToolboxApp>

    , document.getElementById('content')
)
;

