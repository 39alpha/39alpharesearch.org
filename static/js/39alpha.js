function reveal_level_text() {
    const target = d3.select(d3.event.target);
    if (!target.classed('giving__hover--text')) {
        target.classed('giving__hover--hidden', true);
    }
    const name = target.attr('name');
    d3.select(`[name="${name}-text"]`).classed('giving__hover--hidden', false);
}

function hide_level_text() {
    const target = d3.select(d3.event.target);
    if (target.classed('giving__hover--text')) {
        target.classed('giving__hover--hidden', true);
    }
    const name = target.attr('name').split('-').slice(0,-1).join('-');
    d3.select(`[name="${name}"]`).classed('giving__hover--hidden', false);
}

function giving_back() {
    d3.selectAll(".giving__hover").on('mouseenter', reveal_level_text)
    d3.selectAll(".giving__hover--text")
        .classed('giving__hover--hidden', true)
        .on('mouseleave', hide_level_text);
}
