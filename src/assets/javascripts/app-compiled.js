"use strict";

var PASADetails = React.createClass({
    displayName: "PASADetails",

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
            //            jsonpCallback: this.returnJasonCallback(),
            success: (function (data) {
                this.setState({ data: data });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }).bind(this)
        });
    },
    getInitialState: function getInitialState() {
        return { data: [] };
    },
    componentDidMount: function componentDidMount() {
        this.loadPASADetails();
        setInterval(this.loadPASADetails, this.props.pollInterval);
    },
    render: function render() {
        return React.createElement(
            "div",
            { className: "container" },
            React.createElement(
                "h1",
                null,
                "PASA Details"
            ),
            React.createElement(PASAForm, null),
            React.createElement(PASALines, { data: this.state.data })
        );
    }
});

var PASALines = React.createClass({
    displayName: "PASALines",

    render: function render() {
        var PASANodes = this.props.data.map(function (pasaline) {
            return React.createElement(PASALine, { key: pasaline.TaskUUID, TaskName: pasaline.TaskName, resourceName: pasaline.Responsible.resourceName,
                TaskEnd: pasaline.TaskEnd });
        });

        return React.createElement(
            "div",
            { className: "well" },
            PASANodes
        );
    }
});

var PASALine = React.createClass({
    displayName: "PASALine",

    render: function render() {
        return React.createElement(
            "blockquote",
            null,
            React.createElement(
                "p",
                null,
                this.props.TaskName
            ),
            React.createElement(
                "strong",
                null,
                this.props.resourceName
            ),
            React.createElement(
                "small",
                null,
                this.props.TaskEnd
            )
        );
    }
});

var PASAForm = React.createClass({
    displayName: "PASAForm",

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();

        var formData = $("#PASAForm").serialize();

        var saveUrl = "http://localhost:9000/PASA/save";
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
        React.findDOMNode(this.refs.type).value = '';
        React.findDOMNode(this.refs.description).value = '';
        React.findDOMNode(this.refs.data).value = '';
        return;
    },
    render: function render() {
        return React.createElement(
            "div",
            { className: "row" },
            React.createElement(
                "form",
                { id: "PASAForm", onSubmit: this.handleSubmit },
                React.createElement(
                    "div",
                    { className: "col-xs-3" },
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement("input", { type: "text", name: "type", required: "required", ref: "type", placeholder: "Type",
                            className: "form-control" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "col-xs-3" },
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement("input", { type: "text", name: "description", required: "required", ref: "description",
                            placeholder: "description",
                            className: "form-control" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "col-xs-3" },
                    React.createElement(
                        "div",
                        { className: "form-group" },
                        React.createElement("input", { type: "text", name: "data", required: "required", ref: "data",
                            placeholder: "data", className: "form-control" }),
                        React.createElement("span", { className: "input-icon fui-check-inverted" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "col-xs-3" },
                    React.createElement("input", { type: "submit", className: "btn btn-block btn-info", value: "Add" })
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(PASADetails, { url: "http://localhost:9999/tasks/callback",
    pollInterval: 2000 }), document.getElementById('content'));

//# sourceMappingURL=app-compiled.js.map