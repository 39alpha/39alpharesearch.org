all: prepare
	hugo

dev: prepare
	hugo -D

serve: prepare
	hugo server

serve-drafts: prepare
	hugo server -D

prepare: convert
	bin/sort-experience.ts data/experience.json

convert:
	bin/biblio.ts assets/bib/bibliography.bib -m assets/bib/members.json -o data/bibliography.json
	# go run bin/nbconvert.go
