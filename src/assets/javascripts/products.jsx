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

        serializeObject: function (f) {
            var o = {};
            var a = f.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        },

        handleSubmit: function (e) {
            e.preventDefault();

            var formData = $("#ProductForm").serialize();
            //debug
            console.log(formData);
            //debug


            var saveUrl = 'http://localhost:9999/products/save';
            $.ajax({
                url: 'http://localhost:9999/products/save',
                type: 'POST',
                dataType: 'json',
                data: formData,
                cache: false,
                crossDomain: true,
                crossOrigin: true,
                success: function (data) {
                    console.log("Post succeeded" + data)
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(saveUrl, status, err.toString());
                }.bind(this)
            });

            // clears the form fields
            this.refs.productName.value = '';
            return;
        }
        ,
        render: function () {
            return (
                <div className="row">
                    <form id="ProductForm" onSubmit={this.handleSubmit}>
                        <div className="col-xs-3">
                            <div className="form-group">
                                <input type="hidden" name="productId" value="0"/>
                                <input type="text" name="productName" ref={(ref) => this.productName = ref} required="required" ref="type"
                                       placeholder="Add product name"
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
    })
    ;

ReactDOM.render(<ProductDetails url="http://localhost:9999/products/callback"
                                pollInterval={20000}/>, document.getElementById('content'));
