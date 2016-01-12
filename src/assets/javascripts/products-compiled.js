'use strict';

var ProductDetails = React.createClass({
    displayName: 'ProductDetails',

    returnJasonCallback: function returnJasonCallback() {
        return;
    },
    loadProductDetails: function loadProductDetails() {
        $.ajax({
            crossDomain: true,
            crossOrigin: true,
            type: "GET",
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: (function (data) {
                this.setState({ data: data, lastErr: '' });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.info(status.toString());
                this.setState({ lastErr: status.toString() + ' ' + err.toString() });
                console.error(this.props.url, status, err.toString());
            }).bind(this)
        });
    },
    getInitialState: function getInitialState() {
        return { data: [] };
    },
    componentDidMount: function componentDidMount() {
        this.loadProductDetails();
        setInterval(this.loadProductDetails, this.props.pollInterval);
    },
    render: function render() {

        var errShow = this.state.lastErr ? this.state.lastErr.length > 0 ? { display: 'block' } : { display: 'none' } : { display: 'none' };
        return React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
                'h1',
                null,
                'Products Details'
            ),
            React.createElement(
                'div',
                { id: 'myAlert', className: 'alert alert-warning',
                    style: errShow },
                React.createElement(
                    'span',
                    { className: 'sr-only' },
                    'Error:'
                ),
                'Seems we have an error, Jo. And the browser reports this -> ',
                this.state.lastErr
            ),
            React.createElement(ProductForm, null),
            React.createElement(ProductLines, { data: this.state.data })
        );
    }
});

var ProductLines = React.createClass({
    displayName: 'ProductLines',

    render: function render() {
        var ProductNodes = this.props.data.map(function (productline) {
            return React.createElement(ProductLine, { key: productline.productId, ProductName: productline.productName });
        });

        return React.createElement(
            'div',
            { className: 'well' },
            ProductNodes
        );
    }
});

var ProductLine = React.createClass({
    displayName: 'ProductLine',

    render: function render() {
        return React.createElement(
            'blockquote',
            null,
            React.createElement(
                'p',
                null,
                this.props.ProductName
            )
        );
    }
});

var ProductForm = React.createClass({
    displayName: 'ProductForm',

    handleSubmit: function handleSubmit(e) {
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
            success: (function (data) {
                console.log("Post succeeded" + data);
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error(saveUrl, status, err.toString());
            }).bind(this)
        });

        // clears the form fields

        this.findDOMNode(this.refs.productName).value = '';
        return;
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'form',
                { id: 'ProductForm', onSubmit: this.handleSubmit },
                React.createElement(
                    'div',
                    { className: 'col-xs-3' },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement('input', { type: 'hidden', name: 'productId', value: '0' }),
                        React.createElement('input', { type: 'text', name: 'productName', ref: 'productName',
                            required: 'required', ref: 'type',
                            placeholder: 'Add product name',
                            className: 'form-control' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-3' },
                    React.createElement('input', { type: 'submit', className: 'btn btn-block btn-info', value: 'Add' })
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(ProductDetails, { url: 'http://localhost:9999/products/callback',
    pollInterval: 2000 }), document.getElementById('content'));

//# sourceMappingURL=products-compiled.js.map