var ProductDetails = React.createClass({
    returnJasonCallback: function () {
        return;
    },
    loadProductDetails: function () {
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
        this.loadProductDetails();
        setInterval(this.loadProductDetails, this.props.pollInterval);
    },
    render: function () {
        return (
            <div className="container">
                <h1>Products Details</h1>
                <ProductForm />
                <ProductLines data={this.state.data}/>

            </div>
        );
    }
});

var ProductLines = React.createClass({
    render: function () {
        var ProductNodes = this.props.data.map(function (productline) {
            return (
                <ProductLine key={productline.productId} ProductName={productline.productName}/>
            );
        });

        return (
            <div className="well">
                {ProductNodes}
            </div>
        );
    }
});

var ProductLine = React.createClass({
    render: function () {
        return (
            <blockquote>
                <p>{this.props.ProductName}</p>
            </blockquote>
        );
    }
});


var ProductForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();

        var formData = $("#ProductForm").serialize();


        var saveUrl = "http://localhost:9999/products/save";
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
        React.findDOMNode(this.refs.ProductName).value = '';
        return;
    },
    render: function () {
        return (
            <div className="row">
                <form id="ProductForm" onSubmit={this.handleSubmit}>
                    <div className="col-xs-3">
                        <div className="form-group">
                            <input type="text" name="ProductName" required="required" ref="type" placeholder="Type"
                                   className="form-control"/>
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

ReactDOM.render(<ProductDetails url="http://localhost:9999/products/callback"
                             pollInterval={2000}/>, document.getElementById('content'));
