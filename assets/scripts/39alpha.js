function reveal_level_text() {
    const name = d3.select(d3.event.target).attr('name');
    d3.select(`[name="${name}-text"]`).classed('giving__hover--hidden', false);
}

function hide_level_text() {
    d3.select(d3.event.target).classed('giving__hover--hidden', true);
}

function giving_back() {
    d3.selectAll(".giving__hover").on('mouseenter', reveal_level_text);
    d3.selectAll(".giving__hover--text")
        .classed('giving__hover--hidden', true)
        .on('mouseleave', hide_level_text);
}
