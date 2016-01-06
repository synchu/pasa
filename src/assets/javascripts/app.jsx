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
//            jsonpCallback: this.returnJasonCallback(),
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    },
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        this.loadPASADetails();
        setInterval(this.loadPASADetails, this.props.pollInterval);
    },
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
                <PASALine key={pasaline.TaskUUID} TaskName={pasaline.TaskName} resourceName={pasaline.Responsible.resourceName}
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
    handleSubmit: function (e) {
        e.preventDefault();

        var formData = $("#PASAForm").serialize();


        var saveUrl = "http://localhost:9000/PASA/save";
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
        React.findDOMNode(this.refs.type).value = '';
        React.findDOMNode(this.refs.description).value = '';
        React.findDOMNode(this.refs.data).value = '';
        return;
    },
    render: function () {
        return (
            <div className="row">
                <form id="PASAForm" onSubmit={this.handleSubmit}>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <input type="text" name="type" required="required" ref="type" placeholder="Type"
                                   className="form-control"/>
                        </div>
                    </div>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <input type="text" name="description" required="required" ref="description"
                                   placeholder="description"
                                   className="form-control"/>
                        </div>
                    </div>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <input type="text" name="data" required="required" ref="data"
                                   placeholder="data" className="form-control"/>
                            <span className="input-icon fui-check-inverted"></span>
                        </div>
                    </div>
                    <div className="col-xs-3">
                        <input type="submit" className="btn btn-block btn-info" value="Add"/>
                    </div>
                </form>
            </div>
        );
    }
});

ReactDOM.render(<PASADetails url="http://localhost:9999/tasks/callback"
                             pollInterval={2000}/>, document.getElementById('content'));
