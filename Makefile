all: prepare
	hugo

serve: prepare
	hugo server

serve-drafts: prepare
	hugo server -D

prepare: experience bibliography notebooks

experience:
	bin/sort-experience.ts data/experience.json

bibliography:
	bin/biblio.ts assets/bib/bibliography.bib -m assets/bib/members.json -o data/bibliography.json

notebooks: nbconvert
	bin/nbconvert/nbconvert

nbconvert:
	+make -C bin/nbconvert

.PHONY: prepare experience bibliography notebooks
