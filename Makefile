all: convert
	hugo

serve: convert
	hugo server

serve-drafts: convert
	hugo server -D

convert:
	go run bin/nbconvert.go

