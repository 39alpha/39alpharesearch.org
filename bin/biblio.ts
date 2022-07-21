#!/usr/bin/env -S deno run --allow-net --allow-run --allow-write --allow-read

import { basename } from 'https://deno.land/std@0.126.0/path/mod.ts';
import { Command, string } from 'https://deno.land/x/clay@v0.2.5/mod.ts';

interface Args {
    bibtex: string;
    output: string | null;
    members: string | null;
}

interface Author {
    family: string;
    given: string;
    is_member: Boolean | undefined;
}

interface BibJsonEntry {
    id: Number;
    author: Array<Author>;
    title: string;
    doi: string | undefined;
    'container-title': string | undefined;
    journal: string | undefined;
    issued: {
        'date-parts': Array<Array<Number>>;
    };
    date: {
        year: Number;
        month: Number;
    };
}

interface CrossRefEntry {
    title: Array<string>;
    DOI: string;
}

const CROSSREF_URL = 'https://api.crossref.org/works';

main();

async function main(): Promise<void> {
    const cmd = new Command('Convert BibTeX to a modified BibJSON')
        .required(string, 'bibtex')
        .optional(string, 'members', {
            flags: ['m', 'members'],
            description: 'file containing member names',
        })
        .optional(string, 'output', {
            flags: ['o', 'out'],
            description: 'output filename (default: stdout)',
        });
    return convert(cmd.run());
}

function decode(data: BufferSource): string {
    return (new TextDecoder('utf-8')).decode(data);
}

async function convert(args: Args): Promise<void> {
    const { bibtex: filename, members: members_filename, output } = args;
    const members = members_filename === null ? [] : await readMembers(members_filename);
    return bib2json(filename)
        .then(entries => Promise.all(entries.map(addDOI)))
        .then(entries => entries.map(entry => cleanup(entry, members)))
        .then(bib => {
            const json = JSON.stringify(bib);
            if (output !== null) {
                return Deno.writeTextFile(output, json);
            } else {
                console.log(json);
            }
        });
}

async function bib2json(filename: string): Promise<Array<BibJsonEntry>> {
    const proc = Deno.run({
        cmd: ['pandoc', '-t', 'csljson', filename],
        stdout: 'piped',
        stderr: 'null',
    });

    const raw = await proc.output().then(decode);
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.log(`While Reading Bibliography: ${err.toString()}`);
        throw err;
    }
}

async function addDOI(entry: BibJsonEntry): Promise<BibJsonEntry> {
    const title = encodeURI(entry.title);
    const response = await fetch(`${CROSSREF_URL}?query.title=${title}`);
    if (response.status === 200) {
        const body = await response.json();
        const items = body.message.items[0];
        for (let crossref of body.message.items) {
            if (matchReference(entry, crossref)) {
                if (entry.doi !== '' && entry.doi !== undefined && entry.doi != crossref.DOI) {
                    console.warn({
                        id: entry.id,
                        expected: entry.doi,
                        found: crossref.DOI,
                        message: 'DOIs do not match',
                    });
                }
                entry.doi = crossref.DOI;
                break;
            }
        }
    }

    if (entry.doi === '') {
        delete entry.doi;
    }

    if (entry.doi === undefined) {
        console.warn({
            id: entry.id,
            message: 'No DOI found',
        });
    }

    return entry;
}

function cleanup(entry: BibJsonEntry, members: Array<Author>): BibJsonEntry {
    try {
        entry.journal = entry['container-title'];
        const [ [ year, month ] ] = entry.issued['date-parts'];
        entry.date = { year, month };
    
        entry.author.forEach(toInitials);
        entry.author.forEach(author => isMember(author, members));
    } catch (err) {
        console.error(entry);
        throw err;
    }

    return entry;
}

function toInitials(author: Author) {
    if (author.given === undefined) {
        throw new Error('no given name');
    }
    author.given = author.given.split(/\s+/).map(n => n[0] + '.').join('');
}

function matchReference(bibentry: BibJsonEntry, crossref: CrossRefEntry): Boolean {
    return bibentry.title.toLowerCase() == crossref.title[0].toLowerCase();
}

async function readMembers(filename: string): Promise<Array<Author>> {
    const content = await Deno.readTextFile(filename);
    try {
        return JSON.parse(content);
    } catch (err) {
        console.log(`While Reading Members: ${err.toString()}`);
	throw err;
    }
}

function isMember(author: Author, members: Array<Author>) {
    author.is_member = false;
    for (let member of members) {
        if (author.family === member.family && author.given === member.given) {
            author.is_member = true;
            break;
        }
    }
}
