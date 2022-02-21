#!/usr/bin/env -S deno run --allow-read --allow-write

import { Command, string } from 'https://deno.land/x/clay@v0.2.5/mod.ts';

interface Args {
    filename: string
}

interface Entry {
    from: number;
    to: number | undefined;
}

await main();

async function main(): Promise<void> {
    const cmd = new Command('Sort an experience.json file by start and end dates')
        .required(string, 'filename');

    await process(cmd.run());
}

function process({ filename }: Args): Promise<void> {
    return Deno.readTextFile(filename)
        .then(JSON.parse)
        .then(experience => experience.sort(compare))
        .then(experience => JSON.stringify(experience, null, '  '))
        .then(experience => Deno.writeTextFile(filename, experience));
}

function compare(a: Entry, b: Entry): number {
    if (a.to !== undefined && b.to !== undefined) {
        const u = b.to - a.to;
        if (u === 0) {
            return b.from - a.from;
        }
        return u;
    } else if (b.to !== undefined) {
        return -1;
    } else if (a.to !== undefined) {
        return 1;
    } else {
        return b.from - a.from;
    }
}
