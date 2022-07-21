d3.selectAll('time').each(function(x) {
    const node = d3.select(this);
    const timezone = moment.tz.guess()
    const date = moment(node.html()).tz(timezone).format('YYYY-MM-DD HH:mm:SS z');
    node.html(date);
});
