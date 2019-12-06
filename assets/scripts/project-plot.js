function textColor(scheme, value, threshold=186) {
    const color = scheme(value);
    const [r, g, b] = color.slice(4, color.length - 1).split(',');
    const x = 0.299*parseInt(r,10) + 0.587*parseInt(g,10) + 0.114*parseInt(b,10);
    return (x <= threshold) ? "#ffffff" : "#000000";
}

const colorscheme = d3.scaleSequential(d3.interpolateSpectral);

const height = 600;
const radius = 15;
const margin = radius;
const width = 6*margin + height;

const innerwidth = Math.min(width, height) - 2*margin, innerheight = innerwidth;

const svg = d3.select('#risk-vs-applicability')
                .attr('title', 'Risk vs. Applicability')
                .attr('version', 1.1)
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('width', width)
                .attr('height', height);

const x = d3.scaleLinear().rangeRound([innerwidth, 0]);
const y = d3.scaleLinear().rangeRound([innerheight, 0]);

x.domain([10, 0]);
y.domain([0, 10]);

const space = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

const yaxis = space.append('g')
    .attr('transform', `translate(${innerwidth / 2}, 0)`)
    .call(d3.axisLeft(y).ticks([0,11]));

yaxis.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -margin / 2)
    .text('High Risk');

yaxis.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', innerheight + margin)
    .text('Low Risk');

const xaxis = space.append('g')
    .attr('transform', `translate(0, ${innerheight / 2})`)
    .call(d3.axisBottom(x).ticks([0,11]));

xaxis.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'start')
    .attr('x', x(0))
    .attr('y', -margin / 2)
    .text('Theoretical');

xaxis.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'end')
    .attr('x', x(10))
    .attr('y', -margin / 2)
    .text('Applied');

const linkgroup = space.append('g')
    .selectAll('a')
    .data(projects)
    .enter();

const links = linkgroup.append('a')
    .classed('project--link', true)
    .attr('href', d => d.url)
    .attr('title', d => d.title)
    .attr('transform', d => `translate(${x(d.applicability)}, ${y(d.risk)})`);

links.append('circle')
    .classed('project--node', true)
    .attr('r', radius)
    .attr('fill', d => colorscheme(d.reward/10));

const legend = space
    .append('g')
    .attr('width', width - innerwidth - margin)
    .attr('height', innerheight)
    .attr('transform', `translate(${3*margin + innerwidth}, 0)`);

legend.selectAll('rect')
    .data(d3.range(0,1001))
    .enter()
    .append('rect')
        .attr('width', 1.5*margin)
        .attr('height', innerheight / 1001)
        .attr('y', (_, i) => innerheight - (innerheight / 1001)*(i+1))
        .attr('fill', (_, i) => colorscheme(i/1000))
        .attr('stroke', (_, i) => colorscheme(i/1000))
        .attr('opacity', 0.7);

legend.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(90)')
    .attr('x', innerheight/2)
    .attr('y', -2*margin)
    .text('Reward');

legend.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'left')
    .attr('x', 2*margin)
    .attr('y', margin)
    .text('10');

legend.append('text')
    .classed('axis--label', true)
    .attr('text-anchor', 'left')
    .attr('x', 2*margin)
    .attr('y', innerheight)
    .text('0');
