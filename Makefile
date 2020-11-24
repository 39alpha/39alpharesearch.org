all: convert
	hugo

serve: convert
	hugo server

serve-drafs: convert
	hugo server -D

convert:
	go run bin/nbconvert.go
