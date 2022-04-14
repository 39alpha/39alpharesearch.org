# Build Requirements
- Hugo
- Deno (export to PATH- follow the instructions)
- Pandoc (apt install pandoc-citeproc)
- Make sure `LANG` environmental variable is set to something comprehensible like "english" with `export LANG='en_US.UTF-8'`

# Building
Run `make serve`

# Basics

Website content from from two places, `content` and `notebooks`. All jupyter (or otherwise) notebooks are in `notebooks`, `content` has everything else, mostly static text. 

## Content



## Assets

These are things that have to be converted before Hugo can use them. Right now `sass` (full of .scss files) and `bib` which has information that we use to generate .json files in `data`

## Static

Static be static. Images, logo, whole bunch of constant (mostly visual) stuff, and some javascript. 

## Notebooks
In the `notebook` directory each notebook gets a directory (named appropriately). Within that directory you can have `notebook.ipynb` which will be live, `notebook_draft.ipynb` is a draft that isn't live. Use the notebook to store other static files related to that notebook

### Convert to markdown
`go run bin/nbconvert.go` handles the conversion from Jupyter to markdown and that builds into `content` and are not tracked by git.

### Markdown Dumbshit

- `weight` is not size or magnitude, its the order (its pulls things down).
- Template look up order https://gohugo.io/templates/lookup-order/

# What things are doing:

## Hugo

Handles the markdown. 

`layouts` has the different layouts for different types of pages. Hugo docs tell us how different pages are assigned
pages to layouts by default. 

## Deno

Convert bib to json files that can be read by Hugo 

(runs `bin/biblio.ts`)

## Siteproc (Pandoc)
Convert the .bib to a .json file.

## Make 

Read the make file dummy

# What you need to know about AWS
We're using an EC2 instance, you either know the login or you don't.

If you do access the site, don't fuck shit up.

Use ssh with ssh-keys. 

api39.json (and config.json) contains information about how to communicate with IPFS/Stripe/etc (config.json is for tests)


# How update DNS Settings 

Domain is owned by GoDaddy. 

1. Login to GoDaddy
2. Hit `Domains`
3. Scroll down, hit `Manage DNS`
4. Find the `_dnslink` entry (in the `name` column) 
5. Edit it with the ipfs hash (should read `dnslink=ipfs/[IPFS-HASH]`)


## Where's the fucking ipfs-has come from?

1. You pushed to master. Github handles this with a webhook.
2. Go to the github page, go to settings. 
3. Go to Webhooks (we only have one). Select the webhook.
4. Select `Recent Deliveriess`
5. Select the most recent `Response`, select `Response` (assuming it was successful) 
6. If it was a rebuild the body will have an entry for `ipfs-hash`, copy that. (If ipgs-hash isn't there look at older deliveries)


# ngix

This is your doorman - receives requests from the outside world, and sends them off to the appropiate place. 

In an ngix file you specify servers. Maps urls to IP/port addresses. 

## Servers
- 39alpharesearch.org: This is the actual website

- gateway.39alpharesearch.org: This is the IPFS gateway. 


# The dev site


# What you need to know about api39