(function() {
    const apikey = 'pk_live_51HzrsNEkRVu6dDpyxBgB1FwPEH3LZMcwBq4Y45lNDmMj2nOQj9vp0qblv6AcNMhvqSJXAw7kI4VZNQeoFFKp48qG00pmSeLRIJ';
    let stripe = Stripe(apikey);

    const round_currency = (x) => 0.01 * Math.round(100 * x);

    const get_email = () => d3.select('[name="email"]').property('value');

    const get_compensate = () => d3.select('[name="compensate"]').property('checked');

    const get_amount = () => {
        let amount_field = d3.select('[name="amount"]');
        let value = Number.parseFloat(amount_field.property('value'));
        if (get_compensate()) {
            value = (value + 0.3) / 0.971;
        }
        value = round_currency(value);
        amount_field.property('value', value.toFixed(2));

        return value;
    };

    d3.select('[name="donate"]').on('submit', function() {
        d3.event.preventDefault();

        let req = {
            currency: "usd",
            email: get_email(),
            product: "Your Generous Donation",
            unit_amount: get_amount()
        };

        d3.select('.flash').classed('hidden', true);
        d3.select('.flash p').classed('hidden', true);

        fetch('/api/v0/donate/checkout', {
            method: 'POST',
            body: JSON.stringify(req),
        })
        .then(res => res.json())
        .then(res => {
            if (typeof res.id === 'undefined') {
                throw res;
            }
            return res;
        })
        .then(session => stripe.redirectToCheckout({ sessionId: session.id }))
        .then(result => (result.error) ? alert(result.error.message) : {})
        .catch(err => {
            if (typeof err.type === 'undefined') {
                flash.classed('flash--error', true).classed('hidden', false);
                flash.select('.flash__content').html('An unexpected error occurred, please <a href="/contact-us">let us know</a>');
            } else {
                const flash = d3.select('.flash');
                if (err.type.endsWith('error')) {
                    flash.classed('flash--message', false)
                        .classed('flash--success', false)
                        .classed('flash--warning', false)
                        .classed('flash--error', true)
                        .classed('hidden', false);
                } else {
                    flash.classed('flash--message', true)
                        .classed('flash--success', false)
                        .classed('flash--warning', false)
                        .classed('flash--error', false)
                        .classed('hidden', false);
                }
                const id = err.type.match(/[\w-]+$/)[0];
                let flash_content = d3.select(`#${id}`);
                if (flash_content.size() == 0) {
                    flash_content = d3.select('#unexpected-error');
                }
                flash_content.classed('hidden', false);
            }
        });
    });

    (function() {
        (new URL(document.location))
            .searchParams
            .forEach((value, name) => {
                if (name === 'amount') {
                    value = Number.parseFloat(value).toFixed(2);
                }
                d3.select(`[name="${name}"]`).property('value', value);
            });

    })();
})();
