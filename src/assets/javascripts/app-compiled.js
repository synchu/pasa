'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Select = require('react-select');

var testoptions = [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }];

var PASADetails = React.createClass({
    displayName: 'PASADetails',

    returnJasonCallback: function returnJasonCallback() {
        return;
    },

    loadPASADetails: function loadPASADetails() {
        $.ajax({
            crossDomain: true,
            crossOrigin: true,
            type: "GET",
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: (function (data) {
                this.setState({ data: data });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }).bind(this)
        });
    },

    getInitialState: function getInitialState() {
        return {
            data: []

        };
    },

    componentDidMount: function componentDidMount() {
        this.loadPASADetails();
        this.setState({ options: this.state.options, data: this.state.data, value: this.state.value }, function () {
            console.log(this.state);
        });
        setInterval(this.loadPASADetails, this.props.pollInterval);
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
                'h1',
                null,
                'PASA Details'
            ),
            React.createElement(PASAForm, null),
            React.createElement(PASALines, { data: this.state.data })
        );
    }
});

var PASALines = React.createClass({
    displayName: 'PASALines',

    render: function render() {
        var PASANodes = this.props.data.map(function (pasaline) {
            return React.createElement(PASALine, { key: pasaline.TaskUUID, TaskName: pasaline.TaskName,
                resourceName: pasaline.Responsible.resourceName,
                TaskEnd: pasaline.TaskEnd });
        });

        return React.createElement(
            'div',
            { className: 'well' },
            PASANodes
        );
    }
});

var PASALine = React.createClass({
    displayName: 'PASALine',

    render: function render() {
        return React.createElement(
            'blockquote',
            null,
            React.createElement(
                'p',
                null,
                this.props.TaskName
            ),
            React.createElement(
                'strong',
                null,
                this.props.resourceName
            ),
            React.createElement(
                'small',
                null,
                this.props.TaskEnd
            )
        );
    }
});

var PASAForm = React.createClass({
    displayName: 'PASAForm',

    transformProductSelectJSON: function transformProductSelectJSON(json) {
        var response = new Array();

        json.forEach(function (entry) {
            var val = { productId: entry.productId, productName: entry.productName };
            response.push({ value: val, label: entry.productName });
        });
        return response;
    },

    loadProducts: function loadProducts() {
        var _this = this;

        return fetch('http://localhost:9999/products/callback').then(function (response) {
            return response.json();
        }).then(function (json) {
            var transformedResponse = _this.transformProductSelectJSON(json);
            console.log(transformedResponse);
            return { options: transformedResponse };
        });
    },

    getInitialState: function getInitialState() {
        return {
            options: []
        };
    },

    logChange: function logChange(val) {
        console.log('selected: ' + val);
        this.setState({ value: val });
    },

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();

        var formData = $("#PASAForm").serialize();

        var saveUrl = "http://localhost:9999/tasks/save";
        $.ajax({
            url: saveUrl,
            method: 'POST',
            dataType: 'json',
            data: formData,
            cache: false,
            success: (function (data) {
                console.log(data);
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error(saveUrl, status, err.toString());
            }).bind(this)
        });

        // clears the form fields
        this.setState({ taskDescription: "", value: "", desiredDate: new Date() });
        return;
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'form',
                { id: 'PASAForm', onSubmit: this.handleSubmit },
                React.createElement(
                    'div',
                    { className: 'col-xs-3' },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(Select.Async, { id: 'productName', multi: true, name: 'productName', ref: 'productName', required: true,
                            value: this.state.value,
                            loadOptions: this.loadProducts,
                            onChange: this.logChange
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-5' },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement('input', { type: 'text', id: 'taskDescription', name: 'taskDescription', required: true,
                            ref: 'taskDescription',
                            placeholder: 'Task description',
                            className: 'form-control',
                            value: this.state.taskDescription })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-2' },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement('input', { type: 'datetime', name: 'desiredDate', required: true, ref: 'desiredDate',
                            placeholder: 'Desired date', className: 'form-control', 'data-provide': 'datepicker',
                            value: this.state.desiredDate }),
                        React.createElement('span', { className: 'input-icon fui-check-inverted' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-2' },
                    React.createElement('input', { type: 'submit', className: 'btn btn-block btn-info', value: 'Add' })
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(PASADetails, { url: 'http://localhost:9999/tasks/callback',
    pollInterval: 20000 }), document.getElementById('content'));

//# sourceMappingURL=app-compiled.js.map